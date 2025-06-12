import { AiFillGithub } from "react-icons/ai";
import { SiVelog } from "react-icons/si";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <footer
      className={`w-full ${
        isHome ? "fixed bottom-0" : "relative"
      } bg-[#0091ea] h-32 px-6 md:px-12 flex items-center justify-between`}
    >
      <div className="flex flex-col gap-1 text-white">
        <p className="font-main text-sm md:text-base">
          Graduation Project · Gachon University, 2025
        </p>
        <p className="font-main text-sm md:text-base">
          Department of Artificial Intelligence
        </p>
        <p className="font-main text-sm md:text-base font-semibold">
          Created by Taeho Lee (이태호)
        </p>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/andy3400"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors duration-200"
        >
          <AiFillGithub size={28} />
        </a>
        <a
          href="https://velog.io/@andy3400"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-gray-300 transition-colors duration-200"
        >
          <SiVelog size={26} className="opacity-80 hover:opacity-100 transition-opacity duration-200" />
        </a>
      </div>
    </footer>
  );
};
export default Footer;