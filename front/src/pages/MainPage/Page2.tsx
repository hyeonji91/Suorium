import main32 from "../../assets/images/main2.webp";
import logo from "../../assets/icons/logo.svg";
import Signatrium from "../../assets/icons/Signatrium.png";
import page2_main from "../../assets/images/Page2_img.png";

const Page2 = () => {
  return (
    <div
      id="section2"
      className="w-full h-screen flex flex-col md:flex-row items-center justify-center px-12 md:px-36"
    >
      {/* 이미지 영역 */}
      <img
        src={page2_main}
        alt="page2_main"
        className="hidden md:block w-auto max-w-full md:h-[15rem] lg:h-[20rem] xl:h-[20rem] 
                  rounded-2xl shadow-xl border border-gray-200 
                  transition-transform duration-300 ease-in-out hover:scale-105"
      />

      {/* 텍스트 영역 */}
      <div className="mt-8 md:mt-0 md:ml-44 md:min-w-[26rem] md:w-[28rem] lg:w-[35rem] xl:w-[43rem] flex flex-col">
        <div className="flex flex-row items-center justify-start">
          <img
            src={Signatrium}
            alt="logo"
            className="block w-auto h-[2.1rem] md:h-[2.5rem]"
          />
          <p className="text-3xl md:text-4xl font-bold text-black font-main ml-4">
            소개
          </p>
        </div>

        <p className="text-base text-gray-400 font-main mt-6 leading-8">
          <strong className="text-black">실시간 수어 인식:</strong> 사용자의 손 동작(수어)을 MediaPipe와 딥러닝 모델을 통해 인식하고,
          이를 텍스트 및 자연스러운 문장(GEMINI API)으로 번역
        </p>

        <p className="hidden md:block text-base text-gray-400 font-main mt-4 leading-8">
          <strong className="text-black">모바일 대응:</strong> 웹 기반뿐만 아니라 모바일 환경에서도 사용 가능하도록 최적화된 UI/UX 제공
        </p>

        <p className="text-base text-gray-400 font-main mt-4 leading-8">
          <strong className="text-black">데이터 기반:</strong> 2000개 문장, 3000개 단어 수준의 대규모 수어 데이터셋으로 폭넓은 언어 커버
        </p>
      </div>
    </div>
  );
};

export default Page2;