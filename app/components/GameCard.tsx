import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaPlaystation, FaXbox, FaSteam } from "react-icons/fa";
import ImageSwitcher from "./ImageSwitcher";
import AddToWishList from "./AddToWishList";

// دالة مساعدة لتنظيف الروابط ومنع السلاسل النصية الفارغة ""
const getImageUrl = (url: string | null | undefined, fallback = "/placeholder.png") => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return fallback;
  }
  return url;
};

const GameCard = ({
  game,
  wishlist = true, // جعل القيمة الافتراضية true حتى يظهر الزر بشكل تلقائي
  screenBig = false,
}: {
  game: any;
  wishlist?: boolean;
  screenBig?: boolean;
}) => {
  // فحص الصور المصغرة الممررة للـ ImageSwitcher وتنظيف أي عنصر يحوي رابطاً فارغاً
  const rawScreenshots = (screenBig ? (game?.short_screenshots as any)?.results : game?.short_screenshots) || [];
  const cleanScreenshots = Array.isArray(rawScreenshots)
    ? rawScreenshots.filter((img: any) => {
        const src = typeof img === "string" ? img : img?.image;
        return src && typeof src === "string" && src.trim() !== "";
      })
    : [];

  // 🔹 تصفية المنصات لمنع تكرار أيقونة الـ Xbox أو PlayStation مرتين
  const uniquePlatformSlugs = Array.from(
    new Set(
      game?.parent_platforms?.map((p: any) => p?.platform?.slug).filter(Boolean)
    )
  );

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      {/* الحاوية الرئيسية للكارت مع جعل زر الـ Wishlist مستقلاً في الطبقة العلوية */}
      <div className="relative group w-full flex flex-col gap-4">

        {/* 1️⃣ زر الـ Wishlist */}
        {wishlist && game?.id && (
          <div 
            className="absolute left-2 top-2 z-30 cursor-pointer transition-transform duration-150 active:scale-95"
            onClick={(e) => e.stopPropagation()} // منع الانتقال لصفحة اللعبة عند الضغط على زر المفضلة
          >
            <AddToWishList plus gameId={game.id.toString()} />
          </div>
        )}

        {/* 2️⃣ الرابط الموحد */}
        <HoverCardTrigger className="w-full cursor-pointer" asChild>
          <Link href={`/game/${game?.id}`} className="flex flex-col gap-2 w-full text-left transition-transform duration-150 active:scale-[0.97]">

            {/* غلاف الصورة مع نسبة أبعاد متناسقة أفقياً (aspect-video) لمنع تمطيط الصورة */}
            <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-zinc-800/30 group-hover:border-teal-500/40 group-hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all duration-300">
              <Image
                className="object-cover group-hover:scale-105 duration-300"
                src={getImageUrl(game?.background_image)}
                alt={game?.name || "Game Image"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
              />
            </div>

            {/* اسم اللعبة */}
            <h4 className="text-sm line-clamp-1 font-semibold text-white group-hover:text-teal-400 transition-colors duration-200">
              {game?.name}
            </h4>

            {/* أيقونات المنصات بدون تكرار */}
            <div className="mt-1 flex items-center gap-1.5 text-gray-400 text-sm">
              {uniquePlatformSlugs.map((slug: any) => (
                <span key={`platform-${slug}`}>
                  {slug === "pc" ? (
                    <FaSteam className="hover:text-white transition-colors" />
                  ) : slug.includes("playstation") ? (
                    <FaPlaystation className="text-blue-500 hover:text-blue-400 transition-colors" />
                  ) : slug.includes("xbox") ? (
                    <FaXbox className="text-green-500 hover:text-green-400 transition-colors" />
                  ) : null}
                </span>
              ))}
            </div>
          </Link>
        </HoverCardTrigger>
      </div>

      {/* 3️⃣ صندوق الحوّام (Hover Card) */}
      <HoverCardContent align="center" className="w-80 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-xl p-4 shadow-2xl flex flex-col gap-3 z-50">
        {cleanScreenshots.length > 0 && (
          <ImageSwitcher
            game={game}
            images={cleanScreenshots}
          />
        )}

        <Link
          href={`/game/${game?.id}`}
          className="w-full text-center bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-white text-xs font-semibold py-2.5 rounded-lg border border-teal-500/20 hover:border-transparent transition-all duration-200 shadow-[0_0_15px_rgba(45,212,191,0)] hover:shadow-[0_0_15px_rgba(45,212,191,0.4)]"
        >
          ⭐ Write a Review & Ratings
        </Link>
      </HoverCardContent>
    </HoverCard>
  );
};

export default GameCard;