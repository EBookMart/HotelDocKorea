"use client";

import { Cloud, Sun, CloudRain } from "lucide-react";

// Mock Data
const regionWeathers = [
  { region: "수도권", temp: "15°C", icon: "sun" },
  { region: "영동권", temp: "12°C", icon: "cloud" },
  { region: "부산/경남", temp: "18°C", icon: "sun" },
  { region: "대구/경북", temp: "17°C", icon: "cloud-rain" },
  { region: "광주/호남", temp: "16°C", icon: "cloud" },
  { region: "충청권", temp: "14°C", icon: "sun" },
  { region: "제주도", temp: "19°C", icon: "cloud-rain" },
];

export default function WeatherSection({ sectionTitle }: { sectionTitle?: string }) {
  return (
    <section className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm w-full mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          🌤️ {sectionTitle || '권역별 기상정보'}
        </h2>
        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold border border-indigo-100">🔗 TourAPI 연동 예정</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {regionWeathers.map((w, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-3 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors">
            <span className="text-xs font-bold text-gray-600 mb-2">{w.region}</span>
            {w.icon === "sun" && <Sun size={24} className="text-yellow-500 mb-1" />}
            {w.icon === "cloud" && <Cloud size={24} className="text-gray-400 mb-1" />}
            {w.icon === "cloud-rain" && <CloudRain size={24} className="text-blue-400 mb-1" />}
            <span className="text-sm font-extrabold text-gray-800 mt-1">{w.temp}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
