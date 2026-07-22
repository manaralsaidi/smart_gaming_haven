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
  name: string;
}

export default function CategoryPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [page, setPage] = useState(1);
  const [activeGenres, setActiveGenres] = useState<number[]>([]);

  useEffect(() => {
    fetch(`${APIURL}genres?key=${KEY}`)
      .then((res) => res.json())
      .then((data) => setGenres(data.results?.slice(0, 15) || []));
  }, []);

  const { games, isLoading } = useGetGames({
    page,
    filters: activeGenres.length > 0 ? [{ filterName: "genres", option: activeGenres?.join(",") }] : [],
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
            {genres.map((genre: Genre, i: number) => (
              <button
                key={i}
                onClick={() => {
                  activeGenres.includes(genre.id)
                    ? setActiveGenres(activeGenres.filter((id) => id !== genre.id))
                    : setActiveGenres([...activeGenres, genre.id]);
                }}
                className={`text-sm py-2 px-4 rounded-xl text-left transition-all duration-200 font-medium ${
                  activeGenres.includes(genre.id)
                    ? "bg-teal-500 text-neutral-950 font-bold shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                    : "text-gray-300 hover:bg-teal-950/40 hover:text-teal-400"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

       <GridContainer cols={3} className="gap-3 col-span-9">
          {isLoading ? (
            <GameSkeleton number={21} />
          ) : games?.data?.results && games.data.results.length > 0 ? (
            games.data.results.map((game: any) => (
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