import React from "react";

export default function HeaderIntro() {
  return (
    <div
      className={`bg-white p-16 text-black text-center -mt-[60vh] rounded transition-opacity duration-500 ease-out 
      
        `}
    >
      <h1 className="text-xl md:text-5xl font-bold mb-4">
        <span className="text-red-700 font-extrabold">FEMICIDE</span> IN KENYA
      </h1>
      <p className="text-lg text-center">
        A data story tracking and humanizing Kenyan femicide cases through the
        years{" "}
      </p>
    </div>
  );
}
