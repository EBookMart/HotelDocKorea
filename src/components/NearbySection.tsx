"use client";

import { useState, useEffect } from "react";

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
  const [items, setItems] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"food" | "attractions">("food");

  useEffect(() => {
    fetch("/data/attractions.json")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.attractions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("장소 데이터를 불러오지 못했습니다:", err);
        setLoading(false);
      });
  }, []);

  // 1. 활성 상태 필터링
  const activeItems = items.filter((item) => item.active);

  // 2. 권역 필터링 (전국이 아닐 경우)
  const regionFiltered = selectedRegion 
    ? activeItems.filter((item) => item.region === selectedRegion) 
    : activeItems;

  // 3. 탭(카테고리) 필터링
  const categoryKey = tab === "food" ? "food" : "attraction";
  const displayList = regionFiltered.filter((item) => item.category === categoryKey);

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
        <h2 className="text-xl font-bold text-gray-900">주변 맛집 · 관광지</h2>
        <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">🔗 TourAPI 연동 예정</span>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("food")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            tab === "food" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          맛집
        </button>
        <button
          onClick={() => setTab("attractions")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            tab === "attractions" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          관광지
        </button>
      </div>
      <div className="space-y-3">
        {displayList.length > 0 ? (
          displayList.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 rounded-lg hover:bg-pink-50 transition cursor-pointer">
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.address}</p>
                <span className="text-[10px] inline-block mt-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  {item.tag}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">정보가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
