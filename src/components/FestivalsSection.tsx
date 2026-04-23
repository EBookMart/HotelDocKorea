"use client";

import { useState, useEffect } from "react";

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
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/festivals.json")
      .then((res) => res.json())
      .then((data) => {
        setFestivals(data.festivals || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("축제 데이터를 불러오지 못했습니다:", err);
        setLoading(false);
      });
  }, []);

  const today = new Date().toISOString().split("T")[0];

  // 1. 활성 상태 및 날짜 필터링
  const activeFestivals = festivals.filter((f) => {
    if (!f.active) return false;
    if (f.startDate && f.startDate > today) return false;
    if (f.endDate && f.endDate < today) return false;
    return true;
  });

  // 2. 권역 필터링
  const filtered = selectedRegion 
    ? activeFestivals.filter((f) => f.region === selectedRegion) 
    : activeFestivals;

  // 3. 표시 리스트 (최대 4개, 필터 결과 없으면 전체 활성 중 4개)
  const displayList = filtered.length > 0 
    ? filtered.slice(0, 4) 
    : activeFestivals.slice(0, 4);

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
        <h2 className="text-xl font-bold text-gray-900">축제 · 공연 · 행사</h2>
        <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">🔗 TourAPI 연동 예정</span>
      </div>
      <div className="space-y-3">
        {displayList.length > 0 ? (
          displayList.map((f) => (
            <div key={f.id} className="flex gap-3 p-3 rounded-lg hover:bg-purple-50 transition cursor-pointer">
              <span className="text-3xl">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{f.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{f.period} · {f.location}</p>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{f.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">진행 중인 행사가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
