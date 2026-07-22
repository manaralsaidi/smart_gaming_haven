"use client";
import React, { useState } from "react";
import GridContainer from "@/app/components/defaults/GridContainer";
import { useGetGames } from "@/lib/queryFunctions";
import GameSkeleton from "./GameSkeleton";
import GameCard from "./GameCard";
import Empty from "./defaults/Empty";
import { PaginationCustom } from "./PaginationCustom";

const Filters = ({ generes }: { generes: any[] }) => {
  const [page, setPage] = useState(1);
  const [activeGenres, setActiveGenres] = useState<number[]>([]);
  const { games, isLoading } = useGetGames({
    page,
    filters: activeGenres.length > 0 ? [{ filterName: "genres", option: activeGenres?.join(",") }] : [],
  });
  const totalPages = Math.ceil(games?.data.count / 21);
  return (
    <GridContainer className="gap-5 relative" cols={11}>
      <div className="lg:sticky lg:h-screen inset-0 col-span-full lg:col-span-2">
        <div className="flex flex-row flex-wrap lg:flex-col gap-3 bg-main py-4 px-4 rounded-2xl border border-teal-500/10">
          {generes.map((genre: any, i: number) => (
            <button
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
              key={i}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
      <GridContainer cols={3} className="gap-3 col-span-9">
        {isLoading ? (
          <GameSkeleton number={21} />
        ) : games?.data.results.length > 0 ? (
          games?.data.results.map((game: Game) => <GameCard screenBig={false} wishlist key={game.id} game={game} />)
        ) : (
          <Empty message="Sorry, no games found in this page" />
        )}
      </GridContainer>

      <PaginationCustom setPage={setPage} page={page} count={totalPages} />
    </GridContainer>
  );
};

export default Filters;