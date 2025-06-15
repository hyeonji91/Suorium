// components/SignCard.tsx
import React from "react";

interface SignCardProps {
  image: string;
  label: string;
  onClick: () => void;
}

const SignCard: React.FC<SignCardProps> = ({ image, label, onClick }) => {
  return (
    <div
      className="w-full flex flex-col items-center justify-center border rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-transform cursor-pointer p-4"
      onClick={onClick}
    >
      {/* <img src={image} alt={label} className="w-32 h-32 object-cover mb-2 rounded-lg" /> */}
      <video
        src={image}
        className="w64 h-64 rounded-lg object-cover"
        muted
        loop
        playsInline
      />
      <p className="text-lg font-semibold">{label}</p>
    </div>
  );
};

export default SignCard;