import connect from "../actions/connect";
import { getGamesByIds, searchGames } from "../api/api";
import GamesSlider from "../components/GamesSlider";
import Hero from "../components/Hero";
import ChatBox from "../components/ChatBox";

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
  const { results } = data.data;
  const customGames = await getGamesByIds(["799265", "58550", "2462", "494384", "452642", "452634"]);

  return (
    <section className=" ">
      <Hero />
      <GamesSlider title="Top Games for PS5" games={ps5.data.results} />
      <GamesSlider title="Top Games" games={results} />
      <GamesSlider screenBig big slidesPerView={2} title="PLAYSTATION EXCLUSIVES" games={customGames.map((game) => game.data)} />
      <GamesSlider slidesPerView={4} title="Top PC Games" games={pc.data.results} />
      
      {/* AI Assistant Section */}
      <div className="my-12 px-4">
        <h2 className="text-2xl font-bold text-center mb-6">AI GAMING ASSISTANT 🎮</h2>
        <ChatBox />
      </div>
    </section>
  );
}