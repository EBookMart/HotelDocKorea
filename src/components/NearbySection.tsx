"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";

interface Attraction {
  id: string;
  category: "food" | "attraction";
  icon: string;
  name: string;
  address: string;
  tag: string;
  region: string;
  active: boolean;
}

export default function NearbySection({ selectedRegion }: { selectedRegion: string | null }) {
  const t = useTranslations("nearby");
  const [items, setItems] = useState<Attraction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"food" | "attraction">("food");

  useEffect(() => {
    fetch("/data/attractions.json")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.attractions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load attractions:", err);
        setLoading(false);
      });
  }, []);

  const filtered = items.filter((item) => {
    if (!item.active) return false;
    if (item.category !== tab) return false;
    const regionMatch = !selectedRegion || item.region === selectedRegion;
    if (!regionMatch) return false;

    if (searchTerm.trim()) {
      const searchable = [item.name, item.address, item.tag, item.region]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/\s+/g, "");
      const query = searchTerm.toLowerCase().replace(/\s+/g, "");
      return searchable.includes(query);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-8 w-16 bg-gray-100 rounded-full"></div>
          <div className="h-8 w-16 bg-gray-100 rounded-full"></div>
        </div>
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
        <span className="text-2xl">🍜</span>
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("food")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            tab === "food" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("tabFood")}
        </button>
        <button
          onClick={() => setTab("attraction")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            tab === "attraction" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("tabAttractions")}
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={tab === "food" ? t("searchPlaceholderFood") : t("searchPlaceholderAttractions")}
          className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const mapsQuery = encodeURIComponent(`${item.name} ${item.address}`);
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

            return (
              <a
                key={item.id}
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 p-3 rounded-lg hover:bg-pink-50 transition group"
              >
                <span className="text-3xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                    {item.name}
                    <ExternalLink size={12} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.address}</p>
                  <span className="text-[10px] inline-block mt-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    {item.tag}
                  </span>
                </div>
              </a>
            );
          })
        ) : (
          <div className="text-center py-10 text-sm text-gray-400">{t("noData")}</div>
        )}
      </div>
    </div>
  );
}
