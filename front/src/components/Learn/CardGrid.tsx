// components/CardGrid.tsx
// import React from "react";
// import SignCard from "./SignCard";
// import { signWords } from "../../data/signData";
// import { useNavigate } from "react-router-dom";

// const CardGrid: React.FC = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
//       {signWords.map((word) => (
//         <SignCard
//           key={word.id}
//           image={word.videoUrl}
//           label={word.label}
//           onClick={() => navigate(`/learn/${word.id}`)}
//         />
//       ))}
//     </div>
//   );
// };

// export default CardGrid;


// components/CardGrid.tsx
import React, { useState } from "react";
import SignCard from "./SignCard";
import { useNavigate } from "react-router-dom";
import { signWords } from "../../data/signData";

const ITEMS_PER_PAGE = 12;

const CardGrid: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(signWords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = signWords.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4  gap-4">
        {currentItems.map((word) => (
          <SignCard
            key={word.id}
            image={word.videoUrl}
            label={word.label}
            onClick={() => navigate(`/learn/${word.id}`)}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-1 rounded ${
                currentPage === pageNum ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CardGrid;