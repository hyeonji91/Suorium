// components/NavigationArrow.tsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationArrowProps {
  direction: "left" | "right";
  onClick: () => void;
}

const NavigationArrow: React.FC<NavigationArrowProps> = ({ direction, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
    >
      {direction === "left" ? (
        <ChevronLeft size={28} />
      ) : (
        <ChevronRight size={28} />
      )}
    </button>
  );
};

export default NavigationArrow;