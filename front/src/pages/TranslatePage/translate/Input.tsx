import {
  useImperativeHandle,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import {
  HAND_CONNECTIONS,
  Holistic,
  Results as HolisticResults,
} from "@mediapipe/holistic";
import { useRecoilState } from "recoil";
import { resultText, isGeneratingSentence, isTranslatingSentence } from "../../../utils/recoil/atom";

export interface ChildProps {
  send_words: () => void;
  translate: (language: string) => void; 
}

const Input = forwardRef<ChildProps>((props, ref) => {
  const [isGenerating, setIsGenerating] = useRecoilState(isGeneratingSentence);
  const [isTranslating, setIsTranslating] = useRecoilState(isTranslatingSentence);

  const [text, setText] = useRecoilState(resultText);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previous, setPrevious] = useState("");
  const [isConnected, setIsConnected] = useState({
    main: false,
    hands: false,
    llm: false
  });

  const webcamRef = useRef<Webcam>(null);
  const resultsRef = useRef<HolisticResults | null>(null);

  const createWebSocket = (url: string) => {
    const ws = new WebSocket(url);
    ws.onclose = () => {
      console.log(`WebSocket closed: ${url}`);
      setTimeout(() => {
        console.log(`Attempting to reconnect: ${url}`);
        createWebSocket(url);
      }, 3000);
    };
    return ws;
  };

  const socketRef = useRef(createWebSocket("ws://localhost:8080"));
  const socketRef_hands = useRef(createWebSocket("ws://localhost:8081"));
  const socketRef_LLM = useRef(createWebSocket("ws://localhost:8082"));
  const socketRef_Translate = useRef(createWebSocket("ws://localhost:8083"));


  const transmission_frequency = 1000 / 30;

  const handleUserMedia = () => setTimeout(() => setLoading(false), 1000);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    setText("");
    setPrevious("");
  };

  useImperativeHandle(ref, () => ({ send_words, translate }));

  const OutputData = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    const imgData = imageSrc?.substr(23);
    if (imgData && isChecked && socketRef_hands.current.readyState === WebSocket.OPEN) {
      socketRef_hands.current.send(imgData);
    } else if (imgData) {
      console.error("ws connection is not open. (8081)");
      setText("Server2 disconnected");
    }
  }, [isChecked]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    const imgData = imageSrc?.substr(23);
    if (imgData && !isChecked && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(imgData);
    } else if (imgData) {
      console.error("ws connection is not open. (8080)");
      setText("Server Disconnected");
    }
  }, [isChecked]);

  const send_words = useCallback(() => {
    if (text && socketRef_LLM.current.readyState === WebSocket.OPEN) {
      console.log("LLM으로 보냄 : ", text)
      socketRef_LLM.current.send(text);
    } else {
      console.error("ws connection is not open. (8082)");
    }
  }, [text]);

  const translate = useCallback((language : string) => {
    if (text && socketRef_Translate.current.readyState === WebSocket.OPEN) {
      const payload = {
        message: text,
        language: language,
      };
      console.log("LLM으로 보냄 : ", payload)

      socketRef_Translate.current.send(JSON.stringify(payload));
    } else {
      console.error("ws connection is not open. (8083)");
    }
  }, [text]);

  useEffect(() => {
    const interval = setInterval(isChecked ? OutputData : capture, isChecked ? 1000 : transmission_frequency);
    return () => clearInterval(interval);
  }, [OutputData, capture, isChecked]);

  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    if (webcamRef.current?.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => await holistic.send({ image: webcamRef.current!.video! }),
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  }, []);

  useEffect(() => {
    socketRef.current.onmessage = (event) => {
      const jsonString = JSON.parse(event.data);
      console.log("받은 데이터", jsonString)
      if (!isChecked && jsonString.result) {
        const joinedString = jsonString.result.join('').trim();
        setText((prev) => prev + " " + joinedString);
        setPrevious(jsonString.result);
      }
    };

    socketRef.current.onopen = () => {
      console.log("ws connected (8080_useEffect)");
      setIsConnected(prev => ({ ...prev, main: true }));
    };
    
    socketRef.current.onclose = () => {
      console.log("ws closed (8080_useEffect)");
      setIsConnected(prev => ({ ...prev, main: false }));
    };

    return () => {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [isChecked]);

  useEffect(() => {
    socketRef_hands.current.onmessage = (event) => {
      const jsonString = JSON.parse(event.data);
      if (isChecked) {
        setText((prev) => prev + jsonString.result);
      }
    };

    socketRef_hands.current.onopen = () => {
      console.log("ws connected (8081_useEffect)");
      setIsConnected(prev => ({ ...prev, hands: true }));
    };
    
    socketRef_hands.current.onclose = () => {
      console.log("ws closed (8081_useEffect)");
      setIsConnected(prev => ({ ...prev, hands: false }));
    };

    return () => {
      if (socketRef_hands.current.readyState === WebSocket.OPEN) {
        socketRef_hands.current.close();
      }
    };
  }, [isChecked]);

  useEffect(() => {
    socketRef_LLM.current.onmessage = (event) => {
      const jsonString = JSON.parse(event.data);
      setText(jsonString.result);
      setIsGenerating(false);
    };

    socketRef_LLM.current.onopen = () => {
      console.log("ws connected (8082_useEffect)");
      setIsConnected(prev => ({ ...prev, llm: true }));
    };
    
    socketRef_LLM.current.onclose = () => {
      console.log("ws closed (8082_useEffect)");
      setIsConnected(prev => ({ ...prev, llm: false }));
    };

    return () => {
      if (socketRef_LLM.current.readyState === WebSocket.OPEN) {
        socketRef_LLM.current.close();
      }
    };
  }, []);

  useEffect(() => {
    socketRef_Translate.current.onmessage = (event) => {
      const jsonString = JSON.parse(event.data);
      setText(jsonString.result);
      setIsTranslating(false);
    };

    socketRef_Translate.current.onopen = () => {
      console.log("ws connected (8083_useEffect)");
      setIsConnected(prev => ({ ...prev, llm: true }));
    };
    
    socketRef_Translate.current.onclose = () => {
      console.log("ws closed (8083_useEffect)");
      setIsConnected(prev => ({ ...prev, llm: false }));
    };

    return () => {
      if (socketRef_Translate.current.readyState === WebSocket.OPEN) {
        socketRef_Translate.current.close();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="z-10 absolute w-full h-full flex items-center justify-center bg-black">
          <span className="text-white text-xl">로딩 중...</span>
        </div>
      )}

      <div className="w-full h-full">
        <Webcam
          audio={false}
          style={{
            visibility: loading ? "hidden" : "visible",
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
          mirrored={false}
          ref={webcamRef}
          onUserMedia={handleUserMedia}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
        />
      </div>
    </div>
  );
});

export default Input;
 