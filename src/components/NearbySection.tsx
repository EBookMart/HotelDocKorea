"use client";
import { useState } from "react";

const SAMPLE_FOOD = [
  { icon: "🍜", name: "광장시장 먹거리",       address: "서울 종로구", tag: "전통시장" },
  { icon: "⭐", name: "강남 미슐랭 레스토랑",  address: "서울 강남구", tag: "파인다이닝" },
  { icon: "🌮", name: "이태원 세계음식거리",   address: "서울 용산구", tag: "세계음식" },
  { icon: "🍖", name: "마포 한우 골목",         address: "서울 마포구", tag: "한식" },
];

const SAMPLE_ATTRACTIONS = [
  { icon: "🏯", name: "경복궁",           address: "서울 종로구",   tag: "궁궐" },
  { icon: "🗼", name: "남산서울타워",    address: "서울 중구",     tag: "전망대" },
  { icon: "🏘️", name: "북촌한옥마을",     address: "서울 종로구",   tag: "전통마을" },
  { icon: "🎨", name: "국립중앙박물관",  address: "서울 용산구",   tag: "박물관" },
];

export default function NearbySection({ selectedRegion }: { selectedRegion: string | null }) {
  const [tab, setTab] = useState<"food" | "attractions">("food");
  const data = tab === "food" ? SAMPLE_FOOD : SAMPLE_ATTRACTIONS;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🍜</span>
        <h2 className="text-xl font-bold text-gray-900">주변 맛집 · 관광지</h2>
        <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">🔗 TourAPI 연동 예정</span>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("food")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${tab === "food" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}>
          맛집
        </button>
        <button onClick={() => setTab("attractions")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${tab === "attractions" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700"}`}>
          관광지
        </button>
      </div>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-pink-50 transition cursor-pointer">
            <span className="text-3xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{item.address}</p>
              <span className="text-[10px] inline-block mt-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{item.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
