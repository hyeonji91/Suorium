import LazyLoad from "react-lazy-load";
import logo from "../../assets/icons/logo.svg";
import main2 from "../../assets/images/main.webp";
import main_sign from "../../assets/images/main_sign.png";
import { Link } from "react-router-dom";
import Signatrium from "../../assets/icons/Signatrium.png";

const Page1 = () => {
  return (
    <div
      id="section1"
      className="h-screen flex flex-col md:flex-row items-center justify-center w-full px-4"
    >
      {/* 텍스트 영역 */}
      <div className="flex flex-col items-start justify-start mt-8 md:mt-0 md:mr-16">
        <p className="font-bold text-black text-2xl mb-2 font-main">
          수어리움(수어 + 아트리움)
        </p>

        <LazyLoad>
          <img src={Signatrium} alt="Signatrium" className="w-48 mb-5" />
        </LazyLoad>

        <p className="text-lg text-gray-400 font-main mb-4 leading-relaxed">
          수어리움 서비스는 
          <br /> 청각장애인과 비장애인 간의 원활한 의사소통을 지원하고,
          <br /> 누구나 쉽게 수어를 배울 수 있도록 돕는
          <br /> AI 기반 수어 번역 및 교육 플랫폼입니다.
        </p>

        <Link to="/translate">
          <button className="bg-[#0091ea] text-white font-main text-base rounded-md w-52 h-12">
            수어 번역
          </button>
        </Link>
      </div>

      {/* 이미지 영역 */}
      <img
        src={main_sign}
        alt="main_sign"
        className="hidden md:block w-auto md:h-72 lg:h-80 2xl:h-[25rem] mt-10 md:mt-0
                  rounded-2xl shadow-xl border border-gray-200
                  transition-transform duration-300 ease-in-out hover:scale-105"
      />
    </div>
  );
};

export default Page1;