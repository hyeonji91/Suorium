import hospital from "../../assets/icons/hospital.jpg";
import school from "../../assets/icons/school.jpg";
import work from "../../assets/icons/work.png";

const Page3 = () => {
  const cardData = [
    {
      icon: hospital,
      title: "언제",
      description:
        "수어리움은 진료 상담, 검사 안내, 수술 동의 등 농인 환자들이 의료 과정을 겪는 모든 순간에 함께합니다. 언제든지 원활한 의사소통을 지원합니다.",
    },
    {
      icon: school,
      title: "어디든지",
      description:
        "수어리움은 교실, 강의실, 온라인 수업 등 어떤 환경에서도 농인 학생들과 교사, 또래 학생들 간의 원활한 소통을 돕습니다. 이를 통해 평등한 교육 기회를 보장합니다.",
    },
    {
      icon: work,
      title: "누구나",
      description:
        "수어리움은 누구와 일하든 원활하게 소통할 수 있도록 지원합니다. 이를 통해 모든 직원이 조직 내에서 평등하게 참여하고 성장할 수 있는 환경을 만듭니다.",
    },
  ];

  return (
    <div
      id="section3"
      className="h-screen flex flex-col items-center justify-center px-12 md:px-36"
    >
      <p className="text-4xl font-bold text-black font-main">서비스 활용</p>
      <p className="text-lg text-gray-600 font-main mt-5 px-4 md:px-0 text-center max-w-3xl">
        수어리움은 누구나, 어디서나 수어를 쉽게 사용할 수 있도록 돕는 확장성 높은 서비스입니다.
      </p>

      <div className="flex flex-col md:flex-row items-center justify-center mt-12 gap-10 w-full max-w-7xl">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-white border border-gray-200 rounded-xl shadow-md p-6 md:p-8 max-w-sm text-center"
          >
            <img
              src={card.icon}
              alt={card.title}
              className="h-20 w-20 mb-5 rounded-lg object-cover"
            />
            <p className="text-2xl font-bold text-black font-main mb-4">{card.title}</p>
            <p className="text-base text-gray-500 font-main leading-relaxed">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page3;