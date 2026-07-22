"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactElement } from "react";

const NavLink = ({ navLink }: { navLink: { link: string; label: string; icon: ReactElement } }) => {
  const { label, icon } = navLink;
  const pathName = usePathname(); 
  const isActive = pathName === navLink.link;
  
  return (
    <Link
      href={navLink.link}
      /* تم تحويل درجات الـ rose بالكامل إلى teal-400 الفيروزي النيون مع توهج ناعم عند الاختيار */
      className={`flex my-2 duration-200 gap-3 items-center p-2 rounded-md transition-all font-medium tracking-wide w-full
        ${
          isActive 
            ? "text-teal-400 font-bold [text-shadow:0_0_12px_rgba(45,212,191,0.5)] bg-teal-950/20" 
            : "text-gray-400 hover:text-teal-300 [hover:text-shadow:0_0_10px_rgba(45,212,191,0.4)]"
        }`}
    >
      {React.cloneElement(icon, { className: "w-5 h-5 transition-transform duration-200" })}
      <span>{label}</span>
    </Link>
  );
};

export default NavLink;