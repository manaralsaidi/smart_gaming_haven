import { getGame } from "@/app/api/api";
import GameCard from "@/app/components/GameCard";
import React from "react";

const page = async () => {
  // جلب الألعاب من الدالة العامة (هنا نمرر المعرف الافتراضي المفتاح لجلب القائمة المشابهة أو الألعاب الشائعة)
  const game = await getGame("3498");
  
  // استخراج قائمة الألعاب القادمة من الـ API الخارجي
  const { similar }: { similar: any } = game;
  const allGames = similar?.results || [];

  return (
    <div className="mt-10 px-4 md:px-8 max-w-7xl mx-auto pb-16">
      {/* رأس الصفحة */}
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl font-bold text-white tracking-wide">
          🎮 Explore All Games
        </h1>
        <p className="text-gray-400 text-sm">
          Browse through our full collection of gaming worlds and community reviews.
        </p>
      </div>

      {/* شبكة عرض الألعاب (Grid System) */}
      {allGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allGames.map((gameItem: any) => (
            <GameCard 
              key={gameItem.id} 
              game={gameItem} 
              wishlist={true} 
              screenBig={false} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-20">
          <p className="text-lg font-medium">No games found.</p>
        </div>
      )}
    </div>
  );
};

export default page;