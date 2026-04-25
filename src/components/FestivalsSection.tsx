"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { translateFestivalName, translateFestivalLocation, translateFestivalDescription } from "@/lib/translations";

interface Festival {
  id: string;
  icon: string;
  name: string;
  period: string;
  location: string;
  description: string;
  region: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

export default function FestivalsSection({ selectedRegion }: { selectedRegion: string | null }) {
  const t = useTranslations("festivals");
  const locale = useLocale();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/festivals.json")
      .then((res) => res.json())
      .then((data) => {
        setFestivals(data.festivals || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load festivals:", err);
        setLoading(false);
      });
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const activeFestivals = festivals.filter((f) => {
    if (!f.active) return false;
    if (f.startDate && f.startDate > today) return false;
    if (f.endDate && f.endDate < today) return false;
    return true;
  });

  const filtered = activeFestivals.filter((f) => {
    const regionMatch = !selectedRegion || f.region === selectedRegion;
    if (!regionMatch) return false;

    if (searchTerm.trim()) {
      const searchable = [f.name, f.location, f.description, f.region]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, "");
      const query = searchTerm.toLowerCase().replace(/\s+/g, "");
      return searchable.includes(query);
    }
    return true;
  });

  // 검색 중: 검색 결과만 표시
  // 권역 선택 시: 해당 권역 결과만 표시 (없으면 빈 상태)
  // 전국 + 검색 없음: 최대 4개 노출 (초기 진입 화면)
  const displayList = searchTerm.trim()
    ? filtered
    : selectedRegion
    ? filtered.slice(0, 4)
    : filtered.slice(0, 4);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📅</span>
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={t("clearSearch")}
          >
            ✕
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="text-xs text-gray-500 mb-3 px-1">
          {t("searchResult", { query: searchTerm, count: filtered.length })}
        </div>
      )}

      <div className="space-y-3">
        {displayList.length > 0 ? (
          displayList.map((f) => (
            <div
              key={f.id}
              className="flex gap-3 p-3 rounded-lg hover:bg-purple-50 transition"
            >
              <span className="text-3xl">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {translateFestivalName(f.name, locale)}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {f.period} · {translateFestivalLocation(f.location, locale)}
                </p>
                {f.description && (
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                    {translateFestivalDescription(f.description, locale)}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-gray-400">
              {searchTerm
                ? t("noResults", { query: searchTerm })
                : selectedRegion
                ? t("noActiveInRegion")
                : t("noActive")}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-xs text-purple-500 hover:underline"
              >
                {t("clearSearch")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
