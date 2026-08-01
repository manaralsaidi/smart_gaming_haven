export const KEY =
  process.env.NEXT_PUBLIC_RAWG_API_KEY ||
  process.env.RAWG_API_KEY ||
  "f003aa0a234d4ad3b1800e0429d3196a";

export const APIURL =
  process.env.NEXT_PUBLIC_RAWG_API_URL ||
  process.env.RAWG_API_URL ||
  "https://api.rawg.io/api/"; // 👈 تصحيح الرابط بإضافة api. في البداية