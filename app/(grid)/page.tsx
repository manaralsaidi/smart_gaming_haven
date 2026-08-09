import connect from "../actions/connect";
import { getGamesByIds, searchGames } from "../api/api";
import GamesSlider from "../components/GamesSlider";
import Hero from "../components/Hero";

export default async function Home() {
  await connect();
  
  const data = await searchGames("", 2, [], 9);
  const ps5 = await searchGames(
    "",
    1,
    [
      { filterName: "platforms", option: "187" },
      {
        filterName: "ordering",
        option: "-metacritic",
      },
    ],
    10
  );
  const pc = await searchGames("", 1, [{ filterName: "platforms", option: "4" }], 10);
  const { results } = data?.data || {};
  
  // جلب الألعاب المحددة
  const customGames = await getGamesByIds(["799265", "58550", "2462", "494384", "452642", "452634"]);

  // معالجة البيانات للتأكد من استخراج الكائنات بشكل صحيح وحمايتها
  const formattedCustomGames = Array.isArray(customGames)
    ? customGames.map((game: any) => game?.data || game).filter(Boolean)
    : [];

  return (
    <section className=" ">
      <Hero />
      <GamesSlider title="Top Games for PS5" games={ps5?.data?.results} />
      <GamesSlider title="Top Games" games={results} />
      
      {/* تم التعديل هنا لفك غلاف البيانات والتحقق من وجودها */}
      <GamesSlider 
        screenBig 
        big 
        slidesPerView={2} 
        title="PLAYSTATION EXCLUSIVES" 
        games={formattedCustomGames.length > 0 ? formattedCustomGames : ps5?.data?.results} 
      />
      
      <GamesSlider slidesPerView={4} title="Top PC Games" games={pc?.data?.results} />
    </section>
  );
}