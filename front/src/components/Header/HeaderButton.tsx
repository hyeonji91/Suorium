import { Link } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { translateState } from "../../utils/recoil/atom";
import { HeaderButtonProps } from "../../types/HeaderButtonProps";

const HeaderButton = ({ isClicked, name, link }: HeaderButtonProps) => {
  const setTranslate = useSetRecoilState(translateState);

  const onClickListener = () => {
    setTranslate(false);
  };

  return (
    <div onClick={onClickListener}>
      <Link
        to={link}
        className={`
          px-4 py-2 mx-2 rounded-md text-sm md:text-base font-semibold
          transition-all duration-300 ease-in-out
          ${isClicked 
            ? "bg-white text-[#2142AB] shadow-md scale-105"
            : "text-white hover:bg-white hover:text-[#2142AB] hover:shadow-lg active:scale-95"
          }
        `}
      >
        {name}
      </Link>
    </div>
  );
};

export default HeaderButton;