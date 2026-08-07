"use client";

import { getUser } from "@/app/actions/auth";
import { getGamesByIds, searchGames } from "@/app/api/api";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import gamesData from "@/app/constants/games.json"; // 👈 1. استيراد الملف المحلي

export const useGetUser = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });
  return { user, isLoading };
};

export const useGetGamesWithIds = (ids: string[]) => {
  const { data: games, isLoading } = useQuery({
    queryKey: [`games-${ids}`],
    queryFn: async () => {
      try {
        const res = await getGamesByIds(ids);
        return res;
      } catch (error) {
        // في حال فشل طلب الألعاب المحددة بـ ID
        return { data: gamesData.filter((g) => ids.includes(g.id.toString())) };
      }
    },
  });
  return { games, isLoading };
};

export const useGetGames = ({
  query = "",
  page = 1,
  pageSize = 21,
  filters = [],
  isDisabled = false,
}: {
  query?: string;
  page?: number;
  pageSize?: number;
  filters?: { filterName: string; option: string }[] | any;
  isDisabled?: boolean;
}) => {
  const { data: games, isLoading } = useQuery({
    queryKey: [`games-${page}-${JSON.stringify(filters)}-${query}`],
    queryFn: async () => {
      try {
        // 2. محاولة طلب البيانات الأساسية من RAWG
        const response = await searchGames(query, page, filters, pageSize);
        
        // التحقق من أن الاستجابة تحتوي على نتائج
        if (response && response.data && response.data.results) {
          return response;
        }
        throw new Error("Invalid API response format or empty");
      } catch (error) {
        console.warn("RAWG API Failed. Switching to local JSON Fallback:", error);

        // 3. الخطة البديلة (Fallback): إرجاع هيكل بيانات يطابق تماماً ما تتوقعه مكونات React لديكِ
        return {
          data: {
            count: gamesData.length,
            next: null,
            previous: null,
            results: gamesData,
          },
        };
      }
    },
    enabled: !isDisabled,
    placeholderData: keepPreviousData,
  });

  return { games, isLoading };
};