"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { GoPeople } from "react-icons/go";

// دالة مساعدة لاستخراج رابط الصورة بدقة وتجاهل السلاسل النصية الفارغة
const getImageSrc = (item: any): string | null => {
  if (!item) return null;

  // إذا كان العنصر عبارة عن رابط نصي مباشر
  if (typeof item === "string" && item.trim() !== "") {
    return item;
  }

  // إذا كان العنصر عبارة عن كائن يحتوي على خاصية image أو url أو src
  if (typeof item === "object") {
    const src = item.image || item.src || item.url;
    if (typeof src === "string" && src.trim() !== "") {
      return src;
    }
  }

  return null;
};

const ImageSwitcher = ({ images, game }: { images: any[]; game: any }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // 1️⃣ استخراج وتصفية قائمة الصور الصالحة فقط
  const validImages = useMemo(() => {
    const rawList =
      images && images.length > 0
        ? images
        : game?.background_image
        ? [game.background_image]
        : [];

    return rawList
      .map((img) => getImageSrc(img))
      .filter((src): src is string => Boolean(src));
  }, [images, game?.background_image]);

  // 2️⃣ إعادة ضبط المؤشر إلى 0 عند تغير الصور لضمان عدم تجاوز طول المصفوفة
  useEffect(() => {
    setActiveIndex(0);
  }, [validImages]);

  // 3️⃣ تشغيل المؤقت للتبديل بين الصور
  useEffect(() => {
    if (validImages.length <= 1) return; // لا داعي للمؤقت إذا كانت هناك صورة واحدة أو لا توجد صور

    const t = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % validImages.length);
    }, 2500);

    return () => clearInterval(t);
  }, [validImages]);

  if (!game) return null;

  return (
    <div className="flex flex-col gap-4 py-3 items-center px-6 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-teal-500/40 shadow-[0_0_15px_rgba(45,212,191,0.2)] overflow-hidden">
      <div className="flex items-center gap-2 justify-between w-full">
        <h1 className="text-base text-white font-semibold line-clamp-1">
          {game.name}
        </h1>
        <p className="text-xs text-teal-400 mt-1 bg-teal-950/40 px-2 py-0.5 rounded-full whitespace-nowrap">
          Released {game.released || "N/A"}
        </p>
      </div>

      <div className="w-80 h-36 rounded-xl overflow-hidden relative border border-teal-500/20 bg-neutral-950 flex items-center justify-center">
        {validImages.length > 0 ? (
          validImages.map((src, index) => (
            <motion.div
              key={`${src}-${index}`}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              animate={{ opacity: activeIndex === index ? 1 : 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: activeIndex === index ? 1 : 0 }}
            >
              <Image
                fill
                src={src}
                alt={`${game.name || "Game"} preview`}
                className="object-cover"
                sizes="320px"
              />
            </motion.div>
          ))
        ) : (
          <span className="text-xs text-gray-500">No Image Preview</span>
        )}
      </div>

      <p className="text-sm flex items-center gap-2 self-start text-gray-300 mt-1">
        <GoPeople className="text-teal-400" />
        Review count{" "}
        <span className="text-teal-300 font-bold">
          {game.reviews_count ?? 0}
        </span>
      </p>
    </div>
  );
};

export default ImageSwitcher;