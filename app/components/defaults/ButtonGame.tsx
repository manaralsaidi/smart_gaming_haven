"use client";
import React, { ReactElement } from "react";
import ButtonSvg from "../ButtonSvg";
import Link from "next/link";
import Spinner from "./Spinner";

const ButtonGame = ({
  className,
  onClick,
  link,
  text,
  icon,
  disabled = false,
}: {
  className?: string;
  onClick?: () => void;
  link?: string;
  text: string;
  icon?: ReactElement;
  disabled?: boolean;
}) => {
  return (
    <button
      disabled={disabled}
      onClick={() => {
        onClick && onClick();
      }}
      /* تم تغيير hover:text-rose-400 إلى hover:text-teal-300 وإضافة لمعان text-shadow فيروزي */
      className={`${
        className || ""
      } text-white hover:text-teal-300 [hover:text-shadow:0_0_10px_rgba(45,212,191,0.6)] duration-200 min-w-[100px] relative px-6 flex-initial gap-2 py-2 text-center m-auto font-medium tracking-wide`}
    >
      {ButtonSvg(false)}
      <span className="relative z-10">
        {disabled ? <Spinner /> : link ? <Link href={link}>{text}</Link> : text}
      </span>
      {icon && icon}
    </button>
  );
};

export default ButtonGame;