import { FaArrowRightLong } from "react-icons/fa6";
import Input, {ChildProps} from "./Input";
import {
  translateState,
  resultText,
  dchannel,
  isGeneratingSentence,
  isTranslatingSentence,
} from "../../../utils/recoil/atom";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BiCopy, BiRevision } from "react-icons/bi";
import Swal from "sweetalert2";
import ConfigModal from "../config/ConfigModal";
import { NotTranslating } from "./NotTranslating";
import Webcam from "react-webcam";

const language = ["영어", "일본어", "중국어", "독일어", "프랑스어"];


const Translate = () => {
  const [isGenerating, setIsGenerating] = useRecoilState(isGeneratingSentence); // LLM API 응답 대기중 여부
  const [isTranslating, setIsTranslating] = useRecoilState(isTranslatingSentence); // LLM API 응답 대기중 여부
  //토글
  const [selectedLanguage, setSelectedLanguage] = useState("영어");
  const [isOpen, setIsOpen] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const onModalAlert = () => {
    setOpenModal(!openModal);
  };

  const [translate, setTranslate] = useRecoilState(translateState);
  const onClick = () => {
    setTranslate(true);
  };

  //토글
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const handleSelect = (country: string) => {
    setSelectedLanguage(country);
    setIsOpen(false);
  };


  const childComponentRef = useRef<ChildProps>(null);

  const generate_sentence = ()=>{
    if (childComponentRef.current) {
      childComponentRef?.current?.send_words();
      setIsGenerating(true);
    } else{
      alert("서버 연결 확인 및 새로고침 후 다시 시도해주세요.")
    }
  };

  const translate_sentence = ()=>{
    if (childComponentRef.current) {
      childComponentRef?.current?.translate(selectedLanguage);
      setIsTranslating(true);
    } else{
      alert("서버 연결 확인 및 새로고침 후 다시 시도해주세요.")
    }
  };

  const webcamRef = useRef<Webcam>(null);
  useEffect(() => {
    if (webcamRef.current?.video) {
      const stream = webcamRef.current?.video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      webcamRef.current.video.srcObject = null;
    }
  }, [translate]);

  const [text, setText] = useRecoilState(resultText);

  const channel = useRecoilValue(dchannel);

  const SendMessage = () => {
    if (!(channel === "")) {
      axios
        .post("https://localhost:3001/api/send_message", {
          message: text,
          CHANNEL_ID: channel,
        })
        .then((response) => console.log(response.data))
        .catch((e) => console.error(e));
    }
  };

  const copyToClipboardHandler = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      Toast.fire({
        icon: "success",
        title: "클립보드에 복사되었습니다!",
      });
    } catch (e) {
      console.error(e);
    }
  };

  const textClearHandler = () => {
    setText("");
  };

  const Toast = Swal.mixin({
    toast: true,
    position: "top-right",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  return (
    <div className="mt-[5rem] md:mt-[7rem] flex flex-col items-center justify-start w-full h-full mx-auto mb-[4rem]">
      {openModal && <ConfigModal onOpenModal={onModalAlert} />}
      <div className="flex flex-col items-center justify-center mt-2 w-full max-w-[40rem]">
        {translate ? (
          <>
            <div className="w-full aspect-video bg-[#1a1a1a] rounded-t-xl overflow-hidden">
              <Input ref={childComponentRef} />
            </div>
            <div className="w-full bg-white rounded-b-xl border border-gray-200 shadow-md">
              <p className="w-full h-[8rem] break-all overflow-scroll text-xl md:text-2xl text-[#2c3e50] font-main p-4 md:p-6">
                {text}
              </p>
              <div className="flex flex-row items-center justify-end md:justify-center mr-2 md:mr-0 h-[40px] md:mb-[5px]">
                <button
                  onClick={() => {
                    copyToClipboardHandler(text);
                  }}
                  className="text-xl md:text-2xl text-[#3498db] mr-[10px] hover:text-[#2980b9] transition-colors duration-200 rounded-full cursor-pointer"
                >
                  <BiCopy />
                </button>
                <button
                  onClick={textClearHandler}
                  className="text-xl md:text-2xl text-[#3498db] md:mr-[20px] hover:text-[#2980b9] transition-colors duration-200 rounded-full cursor-pointer"
                >
                  <BiRevision />
                </button>
                <button
                  onClick={generate_sentence}
                  className="ml-4 md:ml-0 flex flex-row justify-center items-center rounded-xl w-[8rem] h-[2.5rem] md:w-[10rem] md:h-[2.7rem] bg-[#3498db] hover:bg-[#2980b9] transition-colors duration-200 text-white font-main text-lg"
                >
                  {isGenerating ? '문장 생성중...' : '문장 생성'}
                </button>
                <div className="pl-4"></div>
                <button
                  onClick={translate_sentence}
                  className="ml-4 md:ml-0 flex flex-row justify-center items-center rounded-xl w-[8rem] h-[2.5rem] md:w-[10rem] md:h-[2.7rem] bg-[#3498db] hover:bg-[#2980b9] transition-colors duration-200 text-white font-main text-lg"
                >
                  {isTranslating ? '변역 생성중...' : '변역 생성'}
                </button>
                <div className="pl-4 relative inline-block w-32">
                  <button
                    onClick={toggleDropdown}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors duration-200"
                  >
                    {selectedLanguage} ▼
                  </button>
                  {isOpen && (
                    <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-md">
                      {language.map((country) => (
                        <li
                          key={country}
                          onClick={() => handleSelect(country)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {country}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full aspect-video bg-[#1a1a1a] rounded-xl flex flex-col items-center justify-center">
            <p className="text-2xl font-bold leading-normal text-white md:text-3xl font-main">
              카메라 연결 확인 후 <br />
            </p>
            <p className="mt-0 text-2xl font-bold leading-normal text-white md:text-3xl font-main md:mt-2">
              번역 시스템을 이용해주세요. <br />
            </p>
            <button
              onClick={onClick}
              className="w-[7rem] h-[2.7rem] md:w-[8.75rem] md:h-[3rem] mt-[30px] rounded-xl font-bold font-main text-xl text-white bg-[#3498db] hover:bg-[#2980b9] transition-colors duration-200"
            > 
              번역 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Translate;
