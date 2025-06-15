// pages/LearnHome.tsx
import { signWords } from "../../data/signData";
import SignCard from "../../components/Learn/SignCard";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

const LearnPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <header className="bg-white shadow-md h-16 flex items-center sticky top-0 z-20">
        <Header />
      </header>
  
      {/* 콘텐츠 */}
      <main className="flex-1 px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {signWords.map((word) => (
            <SignCard
              key={word.id}
              image={word.videoUrl}
              label={word.label}
              onClick={() => navigate(`/learn/${word.id}`)}
            />
          ))}
        </div>
      </main>
  
      {/* 푸터 */}
      <footer className="h-14 bg-gray-100 flex items-center justify-center shadow-inner">
        <Footer />
      </footer>
    </div>
  );
};

export default LearnPage;