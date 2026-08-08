import React from "react";
import SwiperCards from "./SwiperCards";
import Link from "next/link";
import Image from "next/image";
import Heading from "./Heading";
import AddToWishList from "./AddToWishList";

// تعريف الواجهة لتحديد خصائص المكون وضمان حماية TypeScript
interface GamesSliderProps {
  games?: Game[];
  title: string;
  slidesPerView?: number;
  big?: boolean;
  screenBig?: boolean;
}

const GamesSlider = ({
  games = [],
  title,
  slidesPerView,
  big,
}: GamesSliderProps) => {
  return (
    <div>
      <div className="flex flex-col gap-6 mt-14">
        <div className="w-full justify-between flex items-center">
          <Heading text={title} />
          <Link
            className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-150 drop-shadow-[0_0_5px_rgba(45,212,191,0.3)] active:scale-95 inline-block"
            href="/category"
          >
            Browse All Games
          </Link>
        </div>
        <SwiperCards
          className="h-full"
          slidesPerView={slidesPerView || 4}
          items={(games || [])
            .filter((game: Game) => game && game.id) // ✅ تصفية القائمة واستبعاد أي قيمة null أو فارغة
            .map((game: Game) => {
              return {
                card: big ? (
                  /* تحويل الكارت الكبير كاملاً إلى رابط ديناميكي للعبة */
                  <Link
                    key={game.id}
                    href={`/game/${game.id}`}
                    className="flex overflow-hidden items-center bg-main rounded-2xl group transition-all duration-200 active:scale-[0.97]"
                  >
                    <div className="flex w-[60%] px-6 flex-col items-start ">
                      <h1 className="text-xl border-b-2 border-neutral-100 w-full pb-3 font-semibold text-white group-hover:text-teal-400 transition-colors">
                        {game.name}
                      </h1>
                      <p className="text-sm line-clamp-4 text-gray-100 pt-3">
                        {game.description_raw}
                      </p>
                    </div>
                    <div className="w-[40%] h-64 relative overflow-hidden">
                      <Image
                        className="group-hover:scale-110 duration-300 object-cover"
                        fill
                        src={game.background_image || "/placeholder.png"}
                        alt={game.name || "Game Image"}
                        sizes="(max-width: 768px) 40vw, 20vw"
                      />
                    </div>
                  </Link>
                ) : (
                  <div key={game.id} className="relative group">
                    {/* جعل الصورة والاسم معاً رابطاً واحداً قابلاً للضغط */}
                    <Link
                      href={`/game/${game.id}`}
                      className="block cursor-pointer transition-transform duration-150 active:scale-[0.97]"
                    >
                      <div
                        className="after:absolute after:inset-0 
                      after:w-0 group-hover:after:w-full after:h-full after:bg-teal-500/40 after:rounded-2xl after:duration-200 w-full h-96 rounded-2xl overflow-hidden relative shadow-[0_0_15px_rgba(45,212,191,0)] group-hover:shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all duration-300"
                      >
                        <Image
                          className="group-hover:scale-125 group-hover:rotate-6 duration-200 object-cover"
                          fill
                          src={game.background_image || "/placeholder.png"}
                          alt={game.name || "Game Image"}
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <h3 className="text-base line-clamp-1 mt-2 text-white font-semibold group-hover:text-teal-400 transition-colors">
                        {game.name}
                      </h3>
                    </Link>

                    {/* زر الـ Wishlist يبقى مستقلاً ومنفصلاً في الأعلى لكي لا يتعارض مع رابط الصفحة */}
                    <div className="absolute top-2 left-4 z-10">
                      <AddToWishList plus gameId={game.id?.toString() || ""} />
                    </div>
                  </div>
                ),
              };
            })}
        />
      </div>
    </div>
  );
};

export default GamesSlider;