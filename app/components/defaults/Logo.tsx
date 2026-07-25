import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link className="my-2 block" href={"/"}>
      <span className="font-extrabold whitespace-nowrap inline-flex items-center gap-x-1.5 text-base lg:text-lg tracking-wide select-none">
        {/* لون الفيريديان الساحر (Cyan-Teal) مع توهج نيون */}
        <span className="text-teal-400 [text-shadow:0_0_15px_rgba(45,212,191,0.5)] transition-colors duration-300 hover:text-cyan-300">
          Gaming
        </span>
        {/* لون فيروزي ناعم ومشرق */}
        <span className="text-cyan-100 [text-shadow:0_0_10px_rgba(165,243,252,0.3)]">
          Haven
        </span>
      </span>
    </Link>
  );
};

export default Logo;