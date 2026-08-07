"use server"; 

import { APIURL, KEY } from "@/app/constants";
import gamesData from "@/app/constants/games.json";

// دالة الجلب المساعدة المحسّنة بالسعر والمهلة
const fetchFn = async (url: string, cache?: number) => {
  // إنشاء مهلة زمنية مدتها 2.5 ثانية فقط
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(url, { 
      next: { revalidate: cache ?? 3600 },
      signal: controller.signal 
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[API] Remote fetch skipped (${res.status}). Switching to local data.`);
      return null;
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return null;
    }

    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    // طباعة تحذير بسيط بدلاً من console.error لتفادي شاشات الأخطاء الحمراء في وضع التطوير
    console.warn(`[API] Network timeout or unreachable URL, using fallback.`);
    return null;
  }
};

// 1. البحث عن الألعاب وجلبها مع الفلترة (مع Fallback سريع)
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

  if (data && data.results && data.results.length > 0) {
    return { data, count: data.count || data.results.length };
  }

  // الـ Fallback المحلي الفوري
  return {
    data: {
      count: gamesData.length,
      results: gamesData,
    },
    count: gamesData.length,
  };
};

// 2. جلب تفاصيل لعبة محددة
export const getGame = async function (id: string) {
  try {
    const data = await fetchFn(`${APIURL}games/${id}?key=${KEY}`); 
    const screenshots = await fetchFn(`${APIURL}games/${id}/screenshots?key=${KEY}`); 
    const similar = await fetchFn(`${APIURL}games/${id}/game-series?key=${KEY}`); 

    if (data) {
      return { data, screenshots, similar };
    }
    throw new Error("Game data returned null");
  } catch (err) {
    // البحث عن اللعبة محلياً فوراً
    const fallbackGame = gamesData.find((g) => g.id.toString() === id.toString()) || gamesData[0];
    
    return {
      data: {
        id: fallbackGame.id,
        name: fallbackGame.name,
        background_image: fallbackGame.background_image,
        description_raw: `${fallbackGame.name} is an amazing game available to play now.`,
        ratings_count: 1250,
        ratings: [
          { id: 1, title: "exceptional", count: 800, percent: 64 },
          { id: 2, title: "recommended", count: 300, percent: 24 },
        ],
      },
      screenshots: {
        results: [{ image: fallbackGame.background_image }],
      },
      similar: {
        results: gamesData.filter((g) => g.id !== fallbackGame.id),
      },
    };
  }
};

// 3. جلب الألعاب حسب التصنيف (Genre)
export const getGameFromgenres = async function (genre = "51") {
  const data = await fetchFn(`${APIURL}games?genres=${genre}&page_size=15&key=${KEY}`);
  if (data && data.results && data.results.length > 0) {
    return data;
  }
  return { results: gamesData };
};

// 4. جلب الألعاب حسب منصة التشغيل (Platform)
export const gamebyplatforms = async function (id: string, page = 1, page_size = 20) {
  const data = await fetchFn(`${APIURL}games?platforms=${id}&page_size=${page_size}&page=${page}&key=${KEY}`);
  if (data && data.results && data.results.length > 0) {
    return data;
  }
  return { results: gamesData };
};

// 5. جلب مجموعة ألعاب مخصصة بواسطة الـ IDs
export const getGamesByIds = async function (ids: string[]) {
  if (!ids || ids.length === 0) return [];

  const data = await Promise.all(
    ids.map(async (id) => {
      const res = await getGame(id);
      return res?.data || null;
    })
  );

  return data.filter(Boolean);
};