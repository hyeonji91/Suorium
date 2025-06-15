// pages/LearnDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { signWords } from "../../data/signData";
import NavigationArrow from "../../components/Learn/NavigationArrow";

import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

const LearnDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const index = signWords.findIndex((w) => w.id === id);
  const word = signWords[index];
  console.log(word)

  const goTo = (direction: "prev" | "next") => {
    const nextIndex = direction === "prev" ? index - 1 : index + 1;
    if (nextIndex >= 0 && nextIndex < signWords.length) {
      navigate(`/learn/${signWords[nextIndex].id}`);
    }
  };

  return (
    
    <div className="flex flex-col min-h-screen">
    {/* 상단 고정 헤더 */}
    <header className="bg-white shadow-md h-16 flex items-center sticky top-0 z-20">
      <Header />
    </header>

    {/* 콘텐츠 */}
    <main className="flex-1 px-4 py-8">
  {word && (
    <div className="w-full max-w-screen-xl mx-auto flex flex-col items-center">
      <video
        src={"/" + word.videoUrl}
        controls
        className="w-full max-w-3xl mb-6"
        preload="metadata"
        playsInline
      />
      <h1 className="text-2xl font-bold mb-4">{word.label}</h1>
      <div className="flex justify-between w-full max-w-6xl">
        <NavigationArrow direction="left" onClick={() => goTo("prev")} />
        <NavigationArrow direction="right" onClick={() => goTo("next")} />
      </div>
    </div>
      )}
    </main>

    {/* 하단 고정 푸터 */}
    <footer className="h-14 bg-gray-100 flex items-center justify-center shadow-inner">
      <Footer />
    </footer>
  </div>
);
};

export default LearnDetail;
