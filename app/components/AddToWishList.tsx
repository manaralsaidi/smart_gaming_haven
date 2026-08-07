"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { useWishlsit } from "../context/wishlistContext";

const AddToWishList = ({ gameId, plus }: { gameId: string | number; plus?: boolean }) => {
  const { handleAddToWishlist, wishlist } = useWishlsit();

  // 🔹 مقارنة الـ ID بتحويل الطرفين إلى String لمنع عدم التطابق بين الرقم والنص
  const isInWishlist = wishlist.some(
    (id) => String(id) === String(gameId)
  );

  return plus ? (
    isInWishlist ? (
      <XCircle 
        className="cursor-pointer text-red-500 hover:scale-110 transition-transform" 
        onClick={() => handleAddToWishlist(String(gameId))} 
      />
    ) : (
      <PlusCircle 
        className="cursor-pointer hover:scale-110 transition-transform" 
        onClick={() => handleAddToWishlist(String(gameId))} 
      />
    )
  ) : (
    <Button 
      className="capitalize" 
      onClick={() => handleAddToWishlist(String(gameId))}
      variant={isInWishlist ? "destructive" : "default"}
    >
      {isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    </Button>
  );
};

export default AddToWishList;