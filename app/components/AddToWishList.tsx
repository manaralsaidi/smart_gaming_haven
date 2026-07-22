"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { useWishlsit } from "../context/wishlistContext";

const AddToWishList = ({ gameId, plus }: { gameId: string; plus?: boolean }) => {
  const { handleAddToWishlist, wishlist } = useWishlsit();
  const isInWishlist = wishlist.includes(gameId)!!;
  return plus ? (
    isInWishlist ? (
      <XCircle onClick={() => handleAddToWishlist(gameId)} />
    ) : (
      <PlusCircle onClick={() => handleAddToWishlist(gameId)} />
    )
  ) : (
    <Button className=" capitalize" onClick={() => handleAddToWishlist(gameId)}>
      {isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    </Button>
  );
};

export default AddToWishList;
