"use client";
import { useGetGames } from "@/lib/queryFunctions";
import { AnimatePresence } from "framer-motion";
import { SearchIcon, XIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import MotionItem from "./defaults/MotionItem";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";

const Search = () => {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const { games, isLoading } = useGetGames({ query: search, isDisabled: search === "" });
  const [active, setActive] = useState(false);
  const outsideREF = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (outsideREF.current && !(outsideREF.current as HTMLElement).contains(e.target as Node)) {
        setActive(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query);
    }, 500);
    return () => clearTimeout(t);
  }, [query]);

  // دالة مساعدة للحصول على رابط الصورة بأمان
  const getImageSrc = (item: any): string => {
    // التحقق أولاً من أن item عبارة عن أوبجكت يحتوي على خاصية image
    if (typeof item === 'object' && item !== null && item.image) {
      return item.image;
    }
    // إذا كان item عبارة عن string مباشر
    if (typeof item === 'string') {
      return item;
    }
    // صورة افتراضية في حال لم نجد أي رابط (تأكدي من وجودها في مجلد public)
    return "/placeholder.png"; 
  };

  return (
    <div
      ref={outsideREF}
      className="w-full flex relative group items-center gap-2 justify-between px-4 border border-input focus-within:border-teal-500/70 focus-within:shadow-[0_0_15px_rgba(45,212,191,0.2)] duration-200 rounded-xl md:w-[40%] bg-main"
    >
      <input
        value={query}
        onFocus={() => setActive(true)} // فتح القائمة عند التركيز على الحقل
        onChange={(e) => {
          setActive(true);
          setQuery(e.target.value);
        }}
        placeholder="Search for games..."
        className="py-2 text-base w-full bg-transparent text-gray-50 border-none outline-none active:outline-none ring-0 placeholder:text-gray-400"
      />
      <div className="flex items-center gap-2">
        <XIcon
          className={`w-4 h-4 text-gray-400 hover:text-white cursor-pointer duration-150 ${query ? "opacity-100" : "opacity-0"}`}
          onClick={() => {
            setQuery("");
            setSearch("");
            setActive(false); // إغلاق القائمة عند المسح
          }}
        />
        <SearchIcon className="w-5 h-5 cursor-pointer duration-150 text-gray-400 group-hover:text-teal-400 [group-hover:filter:drop-shadow(0_0_4px_rgba(45,212,191,0.6))]" />
      </div>
      <AnimatePresence>
        {/* 🔴 تم تعديل الشرط هنا بشكل آمن */}
        {active && (games?.data || isLoading) && (
          <MotionItem
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute w-full top-full mt-2 z-50 bg-[#16191a] border border-teal-500/20 rounded-2xl shadow-xl max-h-[40vh] overflow-y-scroll left-0 custom-scrollbar"
          >
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2 flex items-start gap-2 px-4 py-2">
                  <Skeleton className="h-20 rounded-2xl w-[40%]" />
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))
            ) : games?.data.results.length > 0 ? (
              games?.data.results.map((game: any) => {
                const gameImage = getImageSrc(game.background_image); // 🟢 استخراج آمن
                
                return (
                  <div key={game.id} className="hover:bg-teal-950/50 border-l-2 border-transparent hover:border-teal-400 duration-150 flex flex-col gap-2 px-4 py-2 group/game-item">
                    <Link 
                      href={`/game/${game.id}`} 
                      className="flex gap-3 items-center w-full h-full"
                      onClick={() => setActive(false)} // إغلاق القائمة عند الضغط على لعبة
                    >
                      {/* غلاف الصورة مع تأثير Scale */}
                      <div className="rounded-2xl relative overflow-hidden w-[40%] bg-neutral-900 h-20 border border-zinc-800/60 duration-200 group-hover/game-item:border-teal-500/20 group-hover/game-item:scale-[1.03]">
                        <Image 
                          className="object-cover" 
                          src={gameImage} 
                          alt={game.name || "Game Image"} 
                          fill 
                          sizes="150px"
                        />
                      </div>
                      <h1 className="font-semibold text-white group-hover/game-item:text-teal-300 transition-colors line-clamp-2">
                        {game.name}
                      </h1>
                    </Link>
                  </div>
                );
              })
            ) : search !== "" ? ( // لا تظهر "No found" إذا لم يكتب المستخدم شيئاً
              <p className="text-center text-white py-4">No games found for query "{search}"</p>
            ) : null}
          </MotionItem>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;