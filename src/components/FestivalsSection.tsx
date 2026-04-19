"use client";

interface Festival {
  icon: string;
  name: string;
  period: string;
  location: string;
  description: string;
  region: string;
}

const SAMPLE_FESTIVALS: Festival[] = [
  { icon: "🌸", name: "서울 봄꽃축제 2026",   period: "2026.04.01 ~ 04.15", location: "여의도 한강공원", description: "벚꽃과 다채로운 봄꽃을 즐기는 서울 대표 축제", region: "수도권" },
  { icon: "🎆", name: "한강 불꽃축제",         period: "2026.05.04",          location: "여의도 한강공원", description: "세계 각국의 불꽃 연출이 한강 위를 수놓는다",     region: "수도권" },
  { icon: "🎨", name: "인사동 전통문화 주간",  period: "2026.04.20 ~ 04.27", location: "인사동 일대",      description: "전통 공예·다도·한복 체험 프로그램 진행",         region: "수도권" },
  { icon: "🌼", name: "제주 유채꽃 축제",       period: "2026.04.05 ~ 04.20", location: "제주 가시리",      description: "노란 유채꽃 물결이 장관을 이루는 봄 축제",      region: "제주도" },
  { icon: "🎭", name: "부산국제연극제",         period: "2026.05.01 ~ 05.10", location: "부산 해운대·광안리", description: "세계 각국 극단의 초청 공연",                    region: "부산경남권" },
];

export default function FestivalsSection({ selectedRegion }: { selectedRegion: string | null }) {
  const filtered = selectedRegion ? SAMPLE_FESTIVALS.filter((f) => f.region === selectedRegion) : SAMPLE_FESTIVALS;
  const displayList = filtered.length > 0 ? filtered.slice(0, 4) : SAMPLE_FESTIVALS.slice(0, 4);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📅</span>
        <h2 className="text-xl font-bold text-gray-900">축제 · 공연 · 행사</h2>
        <span className="ml-auto text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">🔗 TourAPI 연동 예정</span>
      </div>
      <div className="space-y-3">
        {displayList.map((f, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-purple-50 transition cursor-pointer">
            <span className="text-3xl">{f.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{f.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{f.period} · {f.location}</p>
              <p className="text-sm text-gray-700 mt-1 line-clamp-2">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
