"use server"; 

import { APIURL, KEY } from "@/app/constants";

// دالة الجلب المساعدة
const fetchFn = (url: string, cache?: number) =>
  fetch(url, { next: { revalidate: cache ?? 3600 } }).then((res) => res.json());

// 1. البحث عن الألعاب وجلبها مع الفلترة
export const searchGames = async function (
  query = "",
  page = 1,
  filters?: { filterName: string; option: string }[],
  page_size = 20,
  cache = 0
) {
  const filterString = filters
    ? filters.map((filter) => `${filter.filterName}=${filter.option}`).join("&")
    : "";

  const url = `${APIURL}games?search=${query}&page_size=${page_size}&page=${page}${filterString ? `&${filterString}` : ""}&key=${KEY}`;
  
  const data = await fetchFn(url, cache);
  const count = data.count;

  return { data, count };
};

// 2. جلب تفاصيل لعبة محددة (مع الصور والألعاب المشابهة)
export const getGame = async function (id: string) {
  try {
    const data = await fetchFn(`${APIURL}games/${id}?key=${KEY}`); 
    const screenshots = await fetchFn(`${APIURL}games/${id}/screenshots?key=${KEY}`); 
    const similar = await fetchFn(`${APIURL}games/${id}/game-series?key=${KEY}`); 
    return { data, screenshots, similar };
  } catch (err) {
    throw err;
  }
};

// 3. جلب الألعاب حسب التصنيف (Genre)
export const getGameFromgenres = async function (genre = "51") {
  const data = await fetchFn(`${APIURL}games?genres=${genre}&page_size=15&key=${KEY}`);
  return data;
};

// 4. جلب الألعاب حسب منصة التشغيل (Platform)
export const gamebyplatforms = async function (id: string, page = 1, page_size = 20) {
  const data = await fetchFn(`${APIURL}games?platforms=${id}&page_size=${page_size}&page=${page}&key=${KEY}`);
  return data;
};

// 5. جلب مجموعة ألعاب مخصصة بواسطة الـ IDs
export const getGamesByIds = async function (ids: string[]) {
  const data = await Promise.all(ids.map((id) => getGame(id)));
  return data;
};