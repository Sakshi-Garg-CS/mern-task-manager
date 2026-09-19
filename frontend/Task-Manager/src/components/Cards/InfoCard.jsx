import React from "react";

const InfoCard = ({ label, value, color }) => {
  return (
    <div className="flex items-center gap-2 md:gap-3 shrink-0">
      <div className={`w-1.5 md:w-2 h-4 md:h-5 ${color} rounded-full`} />

      <p className="text-xs md:text-[14px] text-gray-500">
        <span className="text-sm md:text-[15px] text-black font-semibold">
          {value}
        </span>{" "}
        {label}
      </p>
    </div>
  );
};

export default InfoCard;
