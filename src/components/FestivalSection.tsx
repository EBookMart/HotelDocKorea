"use client";

import { Calendar } from "lucide-react";

const mockFestivals = [
  { id: 1, title: "서울 봄꽃축제 2026", date: "2026.04.01~04.15" },
  { id: 2, title: "한강 불꽃축제", date: "2026.05.04" },
  { id: 3, title: "인사동 전통문화 주간", date: "2026.04.20~04.27" }
];

export default function FestivalSection({ sectionTitle }: { sectionTitle?: string }) {
  return (
    <section className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          📅 {sectionTitle || '축제·행사'}
        </h2>
        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold border border-indigo-100">🔗 TourAPI 연동 예정</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {mockFestivals.map(fest => (
          <div key={fest.id} className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
            <div className="bg-red-100 p-2 rounded-lg text-red-500">
              <Calendar size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">{fest.title}</span>
              <span className="text-xs text-gray-500">{fest.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
