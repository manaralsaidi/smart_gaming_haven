"use client";
import React, { useState, useEffect } from "react";
import GridContainer from "@/app/components/defaults/GridContainer";
import { useGetGames } from "@/lib/queryFunctions";
import GameSkeleton from "@/app/components/GameSkeleton";
import GameCard from "@/app/components/GameCard";
import Empty from "@/app/components/defaults/Empty";
import { PaginationCustom } from "@/app/components/PaginationCustom";
import { APIURL, KEY } from "@/app/constants";

interface Genre {
  id: number;
  slug: string;
  name: string;
}

// تصنيفات احتياطية مضبوطة الـ slug بدقة لـ RAWG API
const FALLBACK_GENRES: Genre[] = [
  { id: 4, slug: "action", name: "Action" },
  { id: 3, slug: "adventure", name: "Adventure" },
  { id: 5, slug: "role-playing-games-rpg", name: "RPG" },
  { id: 2, slug: "shooter", name: "Shooter" },
  { id: 7, slug: "puzzle", name: "Puzzle" },
  { id: 10, slug: "strategy", name: "Strategy" },
  { id: 15, slug: "sports", name: "Sports" },
];

export default function CategoryPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [page, setPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  useEffect(() => {
    fetch(`${APIURL}genres?key=${KEY}`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        if (data.results && data.results.length > 0) {
          setGenres(data.results.slice(0, 15));
        } else {
          setGenres(FALLBACK_GENRES);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch genres, using fallback data:", err);
        setGenres(FALLBACK_GENRES);
      });
  }, []);

  // دالة النقر: تختار تصنيف واحد، وإذا نُقر عليه مجدداً يلغى التحديد
  const handleGenreClick = (genre: Genre) => {
    setPage(1);
    setSelectedGenre((prev) => (prev?.id === genre.id ? null : genre));
  };

  const { games, isLoading } = useGetGames({
    page,
    filters: selectedGenre
      ? [{ filterName: "genres", option: selectedGenre.slug }]
      : [],
  });

  const allGames = games?.data?.results || [];

  // 💡 دالة الفلترة المرنة لدعم RAWG API والـ Mock Data بنفس الوقت
  const filteredGames = allGames.filter((game: any) => {
    if (!selectedGenre) return true;

    const genreName = selectedGenre.name.toLowerCase();
    const genreSlug = (selectedGenre.slug || "").toLowerCase();

    // 1. الفلترة إذا كانت الألعاب تحتوي على مصفوفة genres (RAWG API)
    if (Array.isArray(game.genres) && game.genres.length > 0) {
      return game.genres.some((g: any) => {
        if (typeof g === "string") return g.toLowerCase().includes(genreName);
        return (
          g.id === selectedGenre.id ||
          g.slug?.toLowerCase() === genreSlug ||
          g.name?.toLowerCase() === genreName
        );
      });
    }

    // 2. الفلترة الاحتياطية عند الاعتماد على Mock Data (البحث في الاسم والوصف)
    const fullText = `${game.name || ""} ${game.description || ""}`.toLowerCase();

    if (genreName === "rpg" || genreSlug.includes("rpg")) {
      return fullText.includes("rpg") || fullText.includes("role-playing");
    }
    if (genreName === "action" || genreSlug.includes("action")) {
      return fullText.includes("action") || fullText.includes("shooter") || fullText.includes("combat");
    }
    if (genreName === "shooter" || genreSlug.includes("shooter")) {
      return fullText.includes("shooter") || fullText.includes("fps") || fullText.includes("gunplay");
    }
    if (genreName === "puzzle" || genreSlug.includes("puzzle")) {
      return fullText.includes("puzzle") || fullText.includes("spatial");
    }
    if (genreName === "adventure" || genreSlug.includes("adventure")) {
      return fullText.includes("adventure") || fullText.includes("open-world") || fullText.includes("exploration");
    }
    if (genreName === "sports" || genreSlug.includes("sports")) {
      return fullText.includes("sports") || fullText.includes("racing") || fullText.includes("vehicle");
    }

    return fullText.includes(genreName);
  });

  const totalPages = games?.data?.count ? Math.ceil(games.data.count / 21) : 1;

  return (
    <div className="mt-10 p-6 flex flex-col gap-5 text-white">
      <div>
        <h1 className="text-3xl font-bold text-teal-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]">
          Browse by Category
        </h1>
        <p className="text-gray-400 mt-1">Filter games based on your favorite genres</p>
      </div>

      <GridContainer className="gap-5 relative" cols={11}>
        <div className="lg:sticky lg:h-screen inset-0 col-span-full lg:col-span-2">
          <div className="flex flex-row flex-wrap lg:flex-col gap-3 bg-neutral-900/90 py-4 px-4 rounded-2xl border border-teal-500/10">
            {genres.map((genre: Genre) => {
              const isSelected = selectedGenre?.id === genre.id;
              return (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre)}
                  className={`text-sm py-2 px-4 rounded-xl text-left transition-all duration-200 font-medium ${
                    isSelected
                      ? "bg-teal-500 text-neutral-950 font-bold shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                      : "text-gray-300 hover:bg-teal-950/40 hover:text-teal-400"
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </div>

        <GridContainer cols={3} className="gap-3 col-span-9">
          {isLoading ? (
            <GameSkeleton number={21} />
          ) : filteredGames.length > 0 ? (
            filteredGames.map((game: any) => (
              <GameCard screenBig={false} wishlist key={game.id} game={game} />
            ))
          ) : (
            <Empty message="Sorry, no games found in this category." />
          )}
        </GridContainer>

        <PaginationCustom setPage={setPage} page={page} count={totalPages} />
      </GridContainer>
    </div>
  );
}