import json
import cv2
import mediapipe as mp
import numpy as np
import os
import base64
import asyncio
import websockets
import queue
import threading
import time
from tensorflow.keras.models import load_model
import tensorflow as tf
from gemini import AIChatClient

import sys
import os
from dotenv import load_dotenv

# 프로젝트 루트 디렉토리를 Python 경로에 추가
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(project_root)

from server.fingerspell.fs_8081 import finger_spell
from server.LLM.LLM_8082 import generate_sentence

FEATURE_DIM = 84
NUM_CLASSES = 133
MIN_SEQ = 40
MAX_SEQ = 101

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = os.getenv("GEMINI_API_URL")
LLM_ID = "gemini-2.0-flash-lite"

json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'idx2word2.json')
with open(json_path, 'r', encoding='utf-8') as f:
    idx2word = json.load(f)

# 정규화
def norm(x):
    mean = x.mean(axis=0, keepdims=True)
    std  = x.std(axis=0, keepdims=True) + 1e-6
    x = (x - mean) / std
    return x

# 키포인트 추출
def extract_keypoints(results):
        # 왼손 키포인트 추출
        joint_left = np.zeros((21,2))
        if results.left_hand_landmarks:
            # 키포인트 추출
            for j, lm in enumerate(results.left_hand_landmarks.landmark):
                joint_left[j] = [lm.x, lm.y]
        hand_left_x = norm(joint_left[:, 0])
        hand_left_y = norm(joint_left[:, 1])          
        
        # 오른손 키포인트 추출
        joint_right = np.zeros((21,2))
        if results.right_hand_landmarks:
            # 키포인트 추출
            for j, lm in enumerate(results.right_hand_landmarks.landmark):
                joint_right[j] = [lm.x, lm.y]
        hand_right_x = norm(joint_right[:, 0])
        hand_right_y = norm(joint_right[:, 1])
        
        hand_left_xy = np.concatenate([hand_left_x, hand_left_y], axis=0)
        hand_right_xy = np.concatenate([hand_right_x, hand_right_y], axis=0)
        
        frame_keypoints =  np.concatenate([hand_left_xy.flatten(), hand_right_xy.flatten()], axis=0)

        return frame_keypoints # d =  21 * 4 = 84

def keypoints_padding(keypoints):        
    pad_len = MAX_SEQ - len(keypoints)
    pad_array = np.zeros((pad_len, FEATURE_DIM), dtype=np.float32)
    keypoints = np.vstack([keypoints, pad_array])
    return keypoints.astype(np.float32)

### 모델 가져오기 ###
model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gru_tensor.h5')
model = load_model(model_path)
### gemini 설정 ###
chat_client = AIChatClient(GEMINI_API_URL, GEMINI_API_KEY, LLM_ID)


#===========================================
mp_holistic = mp.solutions.holistic  # holistic: 얼굴, 손 등 감지

def process_frame(image_data):
    # base64 형식의 이미지 데이터를 bytes로 디코딩
    image_bytes = base64.b64decode(image_data)
    # bytes를 NumPy 배열로 변환
    np_arr = np.frombuffer(image_bytes, np.uint8)
    # NumPy 배열을 이미지로 변환
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # COLOR CONVERSION BGR 2 RGB
    image.flags.writeable = False  # 이미지 수정 불가 (결과 왜곡 방지?)
    results = model.process(image)  # 모델을 사용해 입력 이미지에 대한 예측 수행
    image.flags.writeable = True  # 이미지 다시 수정가능
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # COLOR COVERSION RGB 2 BGR
    return image, results


script_directory = os.path.dirname(os.path.abspath(__file__))
print("현재 작업 디렉토리:", script_directory)

MODEL_PATH = os.path.join(script_directory, 'gru_tensor.h5')
custom_objects = {'LSTM': lambda *args, **kwargs: tf.keras.layers.LSTM(*args, **{k: v for k, v in kwargs.items() if k != 'time_major'})}
model = load_model(MODEL_PATH, compile=False, custom_objects=custom_objects)  # 코랩 사용시 compile=False 필수


# 수어 단어와 라벨 목록 (actions)
word_list = 'db.txt'
actions = {}
word_list_dir = os.path.join(script_directory, "db.txt")
with open(word_list_dir, 'r', encoding='utf-8') as file:
    for line in file:
        parts = line.split()
        if len(parts) >= 2:
            a = parts[0]
            b = parts[1]
            actions[int(a)] = b
print(actions) # debug

sentence_length = 10
# seq_length = 30

frame_queue = queue.Queue()
result_queue = queue.Queue() # 멀티스레딩 - 처리할 작업 목록

# 데이터 전처리, lstm predict 스레드
def frame_processor():
    global frame_queue
    
    keypoints_sequence = [] # 키포인트 저장용
    seq_action = ["", ""] # 확인용
    sentence = [" ", ] # 예측한 단어 저장용
    word = ""


    # seq = []
    # previous = ''
    # detected_word = ['','','']
    # detected_word_len = 3
    clear_count=0
    pre_no_hands=False
    
    mp_holistic = mp.solutions.holistic
    holistic = mp_holistic.Holistic()
    
    while True:
        message = frame_queue.get()
        if message==None:
            print("None Message")
            continue
        frame = process_frame(message)
        if frame is None:
            break
        image, result = mediapipe_detection(frame, holistic)
        
        # if result.multi_hand_landmarks is not None:
        #     if pre_no_hands:
        #         pre_no_hands = False
        #         clear_count=0
        
        angles = extract_keypoints(result)
        # 디버깅 [0. ,] 이 아니면 출력
        if not np.allclose(angles[:10], np.zeros(10)):
            print("angles ", angles[:10])

        keypoints_sequence.append(angles)
        if len(keypoints_sequence) > MAX_SEQ: # 101 초과이면 마지막 100로 prediction 한다
            sequence = keypoints_sequence[-MAX_SEQ:]  
        else: # 101개 이하일 때 패딩해서 사용
            sequence = keypoints_sequence
            sequence = keypoints_padding(sequence)

        if len(sequence) > MIN_SEQ * 50:  # 메모리 정리
            sequence = sequence[-MIN_SEQ:]

        if len(keypoints_sequence) >= MIN_SEQ:  # 전체 30 프레임 이상이면 
            sequence = np.expand_dims(sequence, axis=0)  # batch dimension 추가
            predictions = model.predict(sequence, verbose=0)
            predicted_class = np.argmax(predictions, axis=1)[0]
            
            predicted_class_name = idx2word.get(str(predicted_class), "<UNK>")
            probality = predictions[0][predicted_class]
            if probality > 0.5:
                print(f"예측된 클래스: {predicted_class_name}, 확률: {probality:.2f}")

            if probality>0.8:
                seq_action.append(predicted_class_name)
                if seq_action[-1] == seq_action[-2]: # 연속으로 같은 동작일 때 (정확성 체크)
                    if predicted_class_name != sentence[-1]:
                        sentence.append(predicted_class_name)
                        print('sentence ', sentence)
                        keypoints_sequence.clear()

                        print('prediction ', predicted_class, ':', predicted_class_name)
                        print('acc ', probality) # (batch, class)

                        word = f'Prediction: {predicted_class_name} Acc: {probality:.2f}'    

        
        
        #======================================================== 단어 detected
        
        if len(sentence) >1:
            result_dict = {'result': sentence}
            result_json = json.dumps(result_dict)
            time.sleep(0.5)
            sentence = [" ", ]
            frame_queue = queue.Queue() # 작업 리스트 초기화

            result_queue.put(result_json)
            print("result_json" ,result_json)


        # else:
        #     # print(clear_count, len(seq))
        #     if pre_no_hands:
        #         if len(sentence)!=0:
        #             # print("increasing...")
        #             clear_count+=1
        #             if clear_count>50:
        #                 clear_count = 0
        #                 # print("cleared")
        #                 sentence=[]
        #     else:
        #         pre_no_hands=True

# 송수신 스레드
async def handle_client(websocket, path):
    try:
        while True:
            # print(frame_queue.qsize())
            message = await websocket.recv()
            if message:
                frame_queue.put(message)
            if not result_queue.empty():
                result_json = result_queue.get()
                try:
                    if websocket.open:
                        await websocket.send(result_json)
                except Exception as e:
                    print(f"send error: {str(e)}")
    except websockets.exceptions.ConnectionClosedOK:
        pass
    finally:
        frame_queue.put(None)
        result_queue.put(None)


start_server_1 = websockets.serve(handle_client, "localhost", 8080)
start_server_2 = websockets.serve(finger_spell, "localhost", 8081)  
start_server_3 = websockets.serve(generate_sentence, "localhost", 8082)

async def main():
    await asyncio.gather(start_server_1, start_server_2, start_server_3)

if __name__ == "__main__":
    processor_thread = threading.Thread(target=frame_processor)
    processor_thread.start()
    asyncio.get_event_loop().run_until_complete(main())
    asyncio.get_event_loop().run_forever()
    processor_thread.join()



