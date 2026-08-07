import { getGame } from "@/app/api/api";
import GamesSlider from "@/app/components/GamesSlider";
import SwiperCards from "@/app/components/SwiperCards";
import GameReviews from "@/app/components/GameReviews";
import { getUser } from "@/app/actions/auth";
import Image from "next/image";
import React from "react";
import gamesData from "@/app/constants/games.json"; // 👈 استيراد البيانات المحلية

const getRatingColor = (title: string) => {
  switch (title.toLowerCase()) {
    case "exceptional": return "text-green-400 bg-green-500/10 border-green-500/20";
    case "recommended": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "meh": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "skip": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
  }
};

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

const page = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    return <div className="text-center text-red-500 py-10">Invalid Game ID</div>;
  }

  // 1️⃣ المحاولة أولاً من الـ API
  let game = await getGame(id).catch((err) => {
    console.error("Error fetching game data from API:", err);
    return null;
  });

  // 2️⃣ الخطة البديلة (Fallback): البحث عن اللعبة محلياً عند فشل الـ API
  if (!game || !game.data) {
    const fallbackGame = gamesData.find((g) => g.id.toString() === id.toString()) || gamesData[0];
    
    game = {
      data: {
        id: fallbackGame.id,
        name: fallbackGame.name,
        background_image: fallbackGame.background_image,
        description_raw: `${fallbackGame.name} is an amazing game available to play now. (Loaded from Fallback Data)`,
        ratings_count: 1250,
        ratings: [
          { id: 1, title: "exceptional", count: 800, percent: 64 },
          { id: 2, title: "recommended", count: 300, percent: 24 },
          { id: 3, title: "meh", count: 100, percent: 8 },
          { id: 4, title: "skip", count: 50, percent: 4 },
        ],
      },
      screenshots: {
        results: [
          { image: fallbackGame.background_image }
        ],
      },
      similar: {
        results: gamesData.filter((g) => g.id.toString() !== id.toString()),
      },
    };
  }

  const authResult = await getUser().catch((err) => {
    console.error("Error fetching user authentication:", err);
    return null;
  });

  const currentUser = authResult && "data" in authResult && authResult.data
    ? { id: authResult.data._id || authResult.data.id, name: authResult.data.name }
    : null;

  const { screenshots, data, similar }: { screenshots: any; data: any; similar: any } = game;

  const rawImages = [
    ...(screenshots?.results || []),
    data?.background_image,
    data?.background_image_additional,
  ];

  const sliderItems = rawImages
    .map((item: any) => {
      if (!item) return null;

      let url: string | null = null;
      if (typeof item === "string") {
        url = item;
      } else if (typeof item === "object") {
        url = item.image || item.src || item.url || null;
      }

      if (!url || typeof url !== "string" || url.trim() === "") {
        return null;
      }

      return url.trim();
    })
    .filter((src): src is string => Boolean(src))
    .map((validSrc) => ({
      card: (
        <div className="rounded-xl overflow-hidden h-[24rem] md:h-[36rem] w-full relative">
          <Image
            src={validSrc}
            alt={data?.name || "Game Image"}
            fill
            className="object-cover"
            priority={false}
            sizes="100vw"
          />
        </div>
      ),
      src: validSrc,
    }));

  return (
    <div className="mt-10 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-white">{data?.name}</h1>
          <div className="text-gray-400 text-sm">
            Rating count: <span className="text-white font-medium">{data?.ratings_count}</span>
          </div>

          {sliderItems.length > 0 && (
            <SwiperCards
              slidesPerView={1}
              className="h-full"
              items={sliderItems}
              paginationImages
            />
          )}

          <p className="mt-6 text-gray-300 leading-relaxed text-lg">{data?.description_raw}</p>
        </div>
      </div>

      {data?.ratings && data?.ratings.length > 0 && (
        <div className="mt-12 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            ⭐ Players Distribution
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data.ratings.map(({ title, count, percent, id }: any) => {
              const colorClass = getRatingColor(title);
              return (
                <div key={id} className={`p-4 rounded-xl border flex flex-col gap-1 capitalize ${colorClass}`}>
                  <span className="font-bold text-lg">{title}</span>
                  <div className="flex justify-between items-center text-sm mt-2 opacity-90">
                    <span>{count} reviews</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-current rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-12">
        <GameReviews gameId={id} user={currentUser} />
      </div>

      <div className="mt-12">
        <GamesSlider title="Similar Games" games={similar?.results || []} />
      </div>
    </div>
  );
};

export default page;