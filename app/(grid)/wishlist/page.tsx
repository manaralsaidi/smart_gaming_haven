"use client";

import Empty from "@/app/components/defaults/Empty";
import GridContainer from "@/app/components/defaults/GridContainer";
import GameCard from "@/app/components/GameCard";
import GameSkeleton from "@/app/components/GameSkeleton";
import Heading from "@/app/components/Heading";
import { useWishlsit } from "@/app/context/wishlistContext";
import { useGetGamesWithIds } from "@/lib/queryFunctions";
import React from "react";

const Page = () => {
  const { wishlist } = useWishlsit();
  const { games, isLoading } = useGetGamesWithIds(wishlist);

  const uniqueGames = Array.isArray(games)
    ? games.filter(
        (game: any, index: number, self: any[]) =>
          game &&
          index ===
            self.findIndex(
              (g: any) =>
                g &&
                (g?.data?.id || g?.id) === (game?.data?.id || game?.id)
            )
      )
    : [];

  return (
    <div className="mt-10 flex flex-col gap-4">
      <Heading text="My WishList ❤️" />
      <GridContainer className="gap-5" cols={4}>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <GameSkeleton key={index} />
          ))
        ) : uniqueGames && uniqueGames.length > 0 ? (
          uniqueGames.map((game: any, index: number) => {
            if (!game) return null;
            const gameData = game.data || game;

            return (
              <GameCard
                key={`${gameData.id || gameData._id}-${index}`}
                wishlist={true}
                game={{
                  ...gameData,
                  short_screenshots:
                    game.screenshots?.results ||
                    gameData.short_screenshots || [
                      { image: gameData.background_image },
                    ],
                }}
              />
            );
          })
        ) : (
          <div className="col-span-full">
            <Empty
              message="You have not added anything to your wishlist yet !"
              link="/category"
              linkText="Browse More Games"
            />
          </div>
        )}
      </GridContainer>
    </div>
  );
};

export default Page;