import main_logo from "../../assets/icons/main_logo.png"; // 실제 사용하는 이미지
import HeaderButton from "./HeaderButton";
import { useLocation, Link } from "react-router-dom";
import { useRecoilState } from "recoil";
import { authState } from "../../utils/recoil/atom";
import { useState } from "react";
import { Drawer } from "../Drawer/Drawer";
import menu from "../../assets/icons/menu.svg"; // 사용하도록 수정

const Header = () => {
  const location = useLocation();
  const path = location.pathname;
  const [auth, setAuth] = useRecoilState(authState);

  const [open, setOpen] = useState(false);
  const openHandler = () => {
    setOpen(!open);
  };

  return (
    <>
      {open && <Drawer onOpen={openHandler} isOpen={open} />}

      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={openHandler}
        className="lg:hidden fixed top-4 left-4 z-20"
      >
        <img src={menu} alt="menu" className="w-6 h-6" />
      </button>

      {/* 데스크탑 헤더 */}
      <div className="hidden lg:flex bg-[#0091ea] bg-opacity-90 fixed top-0 z-10 w-full h-[4.5rem] flex-row justify-between items-center">
        <div className="ml-[10rem]">
          <Link
            to="/"
            className="flex items-center justify-center w-full"
          >
            <img
              src={main_logo}
              alt="Sign Language Logo"
              className="h-16 w-16 rounded-full object-cover mx-auto"
            />
          </Link>
        </div>

        <div className="flex flex-row items-center justify-center h-full mr-[10vw]">
          <HeaderButton
            isClicked={path === "/login"}
            name="로그인"
            link="/login"
          />
          <HeaderButton
            isClicked={path === "/translate"}
            name="번역"
            link="/translate"
          />
          <HeaderButton
            isClicked={path === "/learn"}
            name="교육"
            link="/learn"
          />
        </div>
      </div>
    </>
  );
};

export default Header;