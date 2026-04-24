"use client";

import React, { useState, useEffect } from 'react';
import { 
  Train, Car, Bus, Info, AlertTriangle, CheckCircle2, 
  Navigation, CreditCard, ChevronRight, MapPin, 
  ExternalLink, Plane, ArrowRight, Smartphone,
  Luggage, Clock, CircleDot, Package
} from 'lucide-react';

interface AirportGuideProps {
  hotelName: string;
  lang: string;
  routeData?: any;
  isZimCarryRegistered?: boolean;
  zimCarryDeadline?: string;
}

export default function AirportGuide({ 
  hotelName, 
  lang, 
  routeData, 
  isZimCarryRegistered, 
  zimCarryDeadline 
}: AirportGuideProps) {
  const [activeTab, setActiveTab] = useState<string>('');
  const [isLuggageMode, setIsLuggageMode] = useState(false);

  const t: any = {
    ko: {
      title: "공항에서 호텔로 오시는 법",
      arex: "공항철도 (AREX)",
      taxi: "택시 (Taxi)",
      bus: "리무진 버스",
      subway: "지하철 (9호선)",
      express: "급행 (Express)",
      local: "일반 (Local)",
      luggageToggle: "무거운 짐이 있습니까?",
      luggageOn: "엘리베이터 우선 경로 활성화됨",
      luggageOff: "일반 도보 경로",
      preparingTitle: "공항 교통 가이드 정비 중",
      preparingDesc: "전국 호텔 교통 데이터 정밀 검수 중입니다. 곧 더 정확한 정보를 제공해 드리겠습니다.",
      linkNotice: "일반 지역 교통 정보는 아래 공식 링크를 참고하세요:",
      busLink: "인천공항 공항버스 안내 (공식)",
      domesticLink: "김포공항 국내선 안내 (공식)",
      bookNow: "예약하기",
      stepByStep: "단계별 이동 경로",
      mobilityApps: "외국인 특화 호출 앱",
      mobilityDesc: "본인인증 없이 해외 카드로 바로 이용하세요.",
      luggageService: "핸즈프리 수하물 배송",
      luggageDesc: "인천공항에서 호텔까지 짐을 먼저 보내고 빈손으로 여행하세요.",
      gtxAlert: "2026.06 업데이트: GTX-A 서울역-수서 전 구간 개통! 지방 이동이 30분 단축되었습니다.",
      applePayNotice: "Apple Pay 알림: 외국 발행 카드는 모바일 T-money 충전이 제한될 수 있으니 실물 WOWPASS 카드를 권장합니다.",
      fastest: "가장 빠름",
      krideTitle: "k.ride - 외국인 1위 택시 호출",
      krideDesc: "133개국 번역 지원 | 글로벌 신용카드 자동 결제",
    },
    en: {
      title: "Airport to Hotel Guide",
      arex: "AREX Train",
      taxi: "Taxi",
      bus: "Limousine Bus",
      subway: "Subway (Line 9)",
      express: "Express",
      local: "Local",
      luggageToggle: "Heavy Luggage?",
      luggageOn: "Elevator-centric route active",
      luggageOff: "Standard route",
      preparingTitle: "Transport Guide Updating",
      preparingDesc: "We are currently verifying regional transport data to provide more accurate information.",
      linkNotice: "Please refer to the official links for general transport info:",
      busLink: "Incheon Airport Bus Guide (Official)",
      domesticLink: "Gimpo Airport Domestic Flight (Official)",
      bookNow: "Book Now",
      stepByStep: "Step-by-Step Route",
      mobilityApps: "Mobility Apps for Foreigners",
      mobilityDesc: "Use with international cards. No K-auth required.",
      luggageService: "Hands-Free Luggage Delivery",
      luggageDesc: "Send your bags from ICN directly to your hotel and travel light.",
      gtxAlert: "June 2026 Update: GTX-A is fully open! Travel to regional cities is now 30m faster.",
      applePayNotice: "Apple Pay: Note that charging T-money via foreign cards might be restricted. WOWPASS is recommended.",
      fastest: "FASTEST",
      krideTitle: "k.ride - #1 Taxi App for Foreigners",
      krideDesc: "Supports 133 languages | Global Credit Card Auto-pay",
    },
    ja: {
      title: "空港からホテルへのアクセス",
      arex: "空港鉄道 (AREX)",
      taxi: "タクシー",
      bus: "リムジンバス",
      subway: "地下鉄 (9号선)",
      express: "急行",
      local: "各停",
      luggageToggle: "重い荷物がありますか？",
      luggageOn: "エレ베이터優先ルート有効",
      luggageOff: "一般ルート",
      preparingTitle: "交通ガイド整備中",
      preparingDesc: "全国のホテル交通 데이터를 정밀 검수 중입니다. 간혹 보다 정확한 정보를 제공해 드리겠습니다.",
      linkNotice: "一般的な交通情報は以下の公式リンクをご参照ください：",
      busLink: "仁川空港リム진버스案内 (公式)",
      domesticLink: "金浦空港国内線案内 (公式)",
      bookNow: "予約する",
      stepByStep: "ステップバイステップ経路",
      mobilityApps: "外国人特化配車アプリ",
      mobilityDesc: "韓国の電話번호認証なしで、海外カードで利用可能です。",
      luggageService: "ハン즈프리手荷物配送",
      luggageDesc: "仁川空港からホテルまで荷物を先に送り、手ぶらで旅行しましょう。",
      gtxAlert: "2026.06アップデート: GTX-A全区間開通! 地方への移動が30分短축되었습니다.",
      applePayNotice: "Apple Pay: 海外発行カードによるT-moneyチャージは制限される場合があります。WOWPASSを推奨します。",
      fastest: "最短",
      krideTitle: "k.ride - 外国人向けタクシー配車1位",
      krideDesc: "133ヶ国語翻訳対応 | グローバルクレジットカード自動決済",
    }
  };

  const curT = t[lang] || t.en;

  useEffect(() => {
    if (routeData?.type === 'regional' && routeData.fromAirports?.ICN?.options?.length > 0) {
      setActiveTab(routeData.fromAirports.ICN.options[0].id);
    } else {
      setActiveTab('arex');
    }
  }, [routeData]);

  if (!routeData) {
    return (
      <div className="w-full bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 mt-10 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white text-center">
           <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 animate-pulse">
                 <AlertTriangle size={32} className="text-yellow-400" />
              </div>
           </div>
           <h3 className="text-xl font-bold">{curT.preparingTitle}</h3>
           <p className="text-slate-200 text-sm mt-1">{hotelName}</p>
        </div>
        <div className="p-8 text-center">
           <p className="text-gray-600 font-medium mb-8 leading-relaxed">
              {curT.preparingDesc}
           </p>
           
           <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
              <h4 className="text-blue-900 text-sm font-bold mb-4 flex items-center justify-center gap-2">
                 <Navigation size={16} /> {curT.linkNotice}
              </h4>
              <div className="flex flex-col gap-3">
                 <a 
                    href="https://www.airport.kr/ap/ko/tpt/busRouteList.do" 
                    target="_blank" 
                    className="bg-white border border-blue-200 text-blue-700 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                 >
                    🚌 {curT.busLink} <ChevronRight size={16} />
                 </a>
                 <a 
                    href="https://www.airport.co.kr/gimpo/cms/frCon/index.do?MENU_ID=1130" 
                    target="_blank" 
                    className="bg-white border border-blue-200 text-blue-700 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                 >
                    ✈️ {curT.domesticLink} <ChevronRight size={16} />
                 </a>
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (routeData.type === 'regional') {
    const icnOptions = routeData.fromAirports?.ICN?.options || [];
    const activeOption = icnOptions.find((o: any) => o.id === activeTab) || icnOptions[0];

    return (
      <div className="w-full bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-900/5 mt-10 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-blue-800 p-6 text-white text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Navigation size={22} className="text-indigo-200" />
                Intermodal Transport Guide
              </h3>
              <p className="text-indigo-100/80 text-sm mt-1">{hotelName} • ICN/GMP Arrival</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-[10px] font-bold flex items-center gap-2 animate-pulse mx-auto md:mx-0 max-w-xs">
               <Info size={14} className="text-yellow-300 shrink-0" />
               <span className="leading-tight">{curT.gtxAlert}</span>
            </div>
          </div>
        </div>

        <div className="flex bg-indigo-50/50 border-b border-indigo-100 px-2 overflow-x-auto scroller-hide">
          {icnOptions.map((opt: any) => (
            <button
              key={opt.id}
              onClick={() => setActiveTab(opt.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === opt.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {opt.isFastest && <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded mr-1 font-black animate-pulse uppercase">{curT.fastest}</span>}
              {opt.id === 'ktx' || opt.id === 'gtx_srt' ? <Train size={16} /> : opt.id === 'bus' ? <Bus size={16} /> : <Plane size={16} />}
              {opt.title[lang] || opt.title.en}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeOption && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                     {activeOption.cost}
                  </div>
                  <h4 className="text-lg font-black text-indigo-900 mb-1">{activeOption.title[lang] || activeOption.title.en}</h4>
                  <p className="text-sm text-indigo-700/70 font-medium mb-6 leading-relaxed">{activeOption.summary[lang] || activeOption.summary.en}</p>
                  
                  <div className="relative pl-8 space-y-8">
                     <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-indigo-200 border-l border-dashed border-indigo-400" />
                     {activeOption.steps.map((step: any, idx: number) => (
                        <div key={idx} className="relative">
                           <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center z-10 shadow-sm">
                              {idx === 0 ? <CircleDot size={12} className="text-indigo-600" /> : idx === activeOption.steps.length - 1 ? <MapPin size={12} className="text-emerald-500" /> : <ArrowRight size={12} className="text-indigo-600" />}
                           </div>
                           <div className="text-sm font-bold text-indigo-900 leading-snug">{typeof step === 'string' ? step : (step[lang] || step.en)}</div>
                        </div>
                     ))}
                  </div>

                  {activeOption.booking && (
                    <div className="mt-8">
                       <a 
                          href={activeOption.booking.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full bg-indigo-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                       >
                          <CreditCard size={18} />
                          {curT.bookNow} on {activeOption.booking.name} (Live QR)
                       </a>
                       <p className="text-center text-[10px] text-indigo-400 mt-3 font-bold uppercase tracking-tighter">
                          Verified for Foreign Cards • Instant E-Ticket
                       </p>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
                     <div className="flex items-center gap-2 mb-3">
                        <Smartphone size={20} className="text-slate-700" />
                        <h4 className="text-sm font-black text-slate-800">{curT.mobilityApps}</h4>
                     </div>
                     <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{curT.mobilityDesc}</p>
                     <div className="flex flex-wrap gap-2">
                        <a href="https://kride.me/" target="_blank" rel="noopener noreferrer" className="bg-black text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:scale-105 transition-all shadow-md">
                           <span className="text-yellow-400 font-black">k.</span>ride
                        </a>
                        <div className="bg-white text-indigo-700 border border-indigo-200 px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                           TABA
                        </div>
                        <a href="https://www.uber.com/taxi" target="_blank" rel="noopener noreferrer" className="bg-black/80 text-white/90 px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:scale-105 transition-all shadow-md">
                           UT/Uber
                        </a>
                     </div>
                  </div>

                  <div className={`p-5 rounded-2xl border shadow-sm transition-all ${isZimCarryRegistered ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100 opacity-80'}`}>
                     <div className="flex items-center gap-2 mb-3">
                        <Luggage size={20} className={isZimCarryRegistered ? "text-emerald-700" : "text-gray-400"} />
                        <h4 className={`text-sm font-black ${isZimCarryRegistered ? "text-emerald-800" : "text-gray-500"}`}>{curT.luggageService}</h4>
                     </div>
                     <p className={`text-[11px] mb-4 leading-relaxed ${isZimCarryRegistered ? "text-emerald-600/80" : "text-gray-400"}`}>
                        {isZimCarryRegistered 
                          ? `${curT.luggageDesc} (Deadline: ${zimCarryDeadline})`
                          : "Direct delivery not supported for this hotel. Use external SAFEX hubs."}
                     </p>
                     <div className="grid grid-cols-2 gap-2">
                        <a href="https://www.zimcarry.net/" target="_blank" rel="noopener noreferrer" className={`py-2 rounded-lg text-center text-[10px] font-black border transition-all ${isZimCarryRegistered ? 'bg-white text-emerald-700 border-emerald-200 shadow-sm hover:border-emerald-500' : 'bg-gray-200 text-gray-400 border-transparent pointer-events-none'}`}>
                           ZIMCARRY
                        </a>
                        <div className={`py-2 rounded-lg text-center text-[10px] font-bold border ${isZimCarryRegistered ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50' : 'bg-gray-200 text-gray-400 border-transparent'}`}>
                           {isZimCarryRegistered ? "37k ~ 80k KRW" : "-"}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-120 transition-transform">
                     <Smartphone size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="bg-yellow-400 text-indigo-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">Must-Have App</span>
                       <h4 className="text-xl font-black">{curT.krideTitle}</h4>
                    </div>
                    <p className="text-sm text-indigo-100/80 font-medium mb-6 leading-relaxed">{curT.krideDesc}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <a href="https://kride.me/" target="_blank" rel="noopener noreferrer" className="bg-white text-indigo-900 px-6 py-3 rounded-2xl text-sm font-black shadow-lg hover:bg-yellow-400 hover:scale-105 transition-all text-center">
                          Install k.ride &gt;
                       </a>
                       <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-200">
                          <CheckCircle2 size={16} className="text-emerald-400" />
                          No Korean Phone Needed • Auto-Pay Ready
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="bg-amber-50 p-4 border-t border-amber-100 mx-6 mb-6 rounded-2xl flex items-start gap-3">
           <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
           <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
              {curT.applePayNotice}
           </p>
        </div>

        <div className="bg-indigo-950 p-4 text-white/40 text-[9px] font-medium text-center">
           Pathways suggested by HotelDocKorea Data Engine. Updated April 2026.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 mt-10 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Navigation size={22} className="text-blue-200" />
            {curT.title}
          </h3>
          <p className="text-blue-100/80 text-sm mt-1">{hotelName} • ICN/GMP Arrival</p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
           <div className="text-right">
              <div className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">{curT.luggageToggle}</div>
              <div className="text-[11px] font-medium leading-none">{isLuggageMode ? curT.luggageOn : curT.luggageOff}</div>
           </div>
           <button 
              onClick={() => setIsLuggageMode(!isLuggageMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isLuggageMode ? 'bg-yellow-400' : 'bg-white/20'}`}
           >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isLuggageMode ? 'translate-x-6' : ''} flex items-center justify-center`}>
                 <div className={`w-2 h-2 rounded-full ${isLuggageMode ? 'bg-yellow-600' : 'bg-gray-300'}`} />
              </div>
           </button>
        </div>
      </div>

      <div className="flex bg-blue-50/50 border-b border-blue-100 px-2 overflow-x-auto scroller-hide">
        {(['arex', 'taxi', 'bus', 'subway'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab === 'arex' && <Train size={16} />}
            {tab === 'taxi' && <Car size={16} />}
            {tab === 'bus' && <Bus size={16} />}
            {tab === 'subway' && <div className="w-4 h-4 rounded-full bg-yellow-400 text-[10px] flex items-center justify-center text-white font-bold">9</div>}
            {curT[tab]}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'arex' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Express Train</span>
                <div className="text-lg font-black text-blue-900 mt-1">43 min</div>
                <div className="text-xs text-blue-600">to Seoul St. / 14,800 KRW</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">All-stop Train</span>
                <div className="text-lg font-black text-gray-900 mt-1">59 min</div>
                <div className="text-xs text-gray-600">to Seoul St. / 4,750 KRW</div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h4 className="text-amber-800 text-sm font-bold flex items-center gap-2 mb-2">
                <Info size={16} /> QR Voucher Exchange Logic
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                If you have an **Express Train voucher**, Enter your serial number at the **Automatic Ticket Machine** to receive a Physical QR Code Ticket.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'taxi' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-xl">
                <h4 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Recommended for Foreigners</h4>
                <div className="text-xl font-black mb-3">International Taxi</div>
                <p className="text-[11px] text-indigo-100/80 leading-relaxed mb-4">
                   Fair fixed rates by zones (70,000 ~ 95,000 KRW). Drivers speak fluent English/JA/CN.
                </p>
                <div className="flex gap-2">
                   <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-[10px] font-bold">Zone A: 70k</div>
                   <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-[10px] font-bold">Zone B: 80k</div>
                   <div className="bg-indigo-500 px-3 py-1.5 rounded-lg text-[10px] font-bold">T1 Desk: 4, 39</div>
                </div>
             </div>

             <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <h4 className="text-rose-800 text-sm font-bold flex items-center gap-2 mb-2">
                   <AlertTriangle size={16} /> 30% Surcharge Warning
                </h4>
                <p className="text-xs text-rose-900 leading-relaxed font-medium">
                   When taking a taxi from ICN to Seoul, ALWAYS pick a taxi with a **'SEOUL'** license plate to avoid 30% Out-of-City Surcharge.
                </p>
             </div>
          </div>
        )}

        {activeTab === 'bus' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                   <div>
                      <div className="text-lg font-black text-gray-800">Airport Limousine</div>
                      <div className="text-xs text-gray-500">Fixed Routes to major hotels</div>
                   </div>
                   <div className="text-right">
                      <div className="text-lg font-black text-blue-600">17,000 KRW</div>
                      <div className="text-[10px] text-gray-400">Standard Rate</div>
                   </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-2xl">
                   <h4 className="text-indigo-900 text-sm font-bold mb-2">💡 Arriving Late? (After Midnight)</h4>
                   <p className="text-xs text-indigo-700 mb-3 font-medium">Late-night buses N6000, N6001, N6002 are available from **1F Platform 6A** at Terminal 1.</p>
                   <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-all flex items-center gap-1">
                      Check Midnight Schedule <ChevronRight size={14} />
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'subway' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-1 bg-yellow-400 rounded-full" />
                <div className="space-y-8 pl-10">
                   <div className="relative">
                      <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-500" />
                      <div className="font-extrabold text-red-600 text-sm">{curT.express}</div>
                      <div className="text-xs text-gray-500 mt-0.5 font-medium">Stops at major stations only. Best for Gangnam.</div>
                   </div>
                   <div className="relative">
                      <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-500" />
                      <div className="font-extrabold text-blue-600 text-sm">{curT.local}</div>
                      <div className="text-xs text-gray-500 mt-0.5 font-medium">Stops at every station.</div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-6 flex flex-col gap-6 border-t border-blue-100">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="bg-white p-2.5 rounded-xl shadow-sm">
                  <CreditCard className="text-blue-600" />
               </div>
               <div>
                  <div className="text-sm font-bold text-blue-900">Apple Pay T-money Ready?</div>
                  <div className="text-[10px] text-blue-600">Top-up via 'Foreigner' menu in Mobile Tmoney.</div>
               </div>
            </div>
            <div className="flex gap-2">
               <button className="bg-white text-blue-700 px-4 py-2 rounded-xl text-[10px] font-black shadow-sm border border-blue-200">
                  WOWPASS Card
               </button>
               <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-sm">
                  Climate Card
               </button>
            </div>
         </div>

         <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
               {curT.applePayNotice}
            </p>
         </div>

         <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <Smartphone size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-yellow-400 text-indigo-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Must-Have</span>
                 <h4 className="text-lg font-black">{curT.krideTitle}</h4>
              </div>
              <p className="text-xs text-indigo-100/80 mb-5 font-medium">{curT.krideDesc}</p>
              <div className="flex gap-3">
                 <a href="https://kride.me/" target="_blank" rel="noopener noreferrer" className="bg-white text-indigo-900 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-all">Install Now &gt;</a>
              </div>
            </div>
         </div>

         <div className={`p-4 rounded-2xl border transition-all ${isZimCarryRegistered ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100 opacity-80'}`}>
            <div className="flex items-center gap-2 mb-3">
               <Package size={16} className={isZimCarryRegistered ? "text-emerald-600" : "text-gray-400"} />
               <span className={`text-xs font-bold uppercase ${isZimCarryRegistered ? "text-emerald-900" : "text-gray-500"}`}>Luggage Delivery Services</span>
            </div>
            <p className={`text-[11px] mb-4 font-bold leading-relaxed ${isZimCarryRegistered ? "text-emerald-700" : "text-gray-400"}`}>
               {isZimCarryRegistered 
                 ? `Direct delivery available! (Deadline: ${zimCarryDeadline})`
                 : "Send your luggage directly to the hotel and travel hands-free."}
            </p>
            <div className="grid grid-cols-3 gap-2">
               <a href="https://www.safex.kr/" target="_blank" rel="noopener noreferrer" className="bg-white py-2 rounded-lg text-center text-[10px] font-bold text-indigo-900 shadow-sm border border-indigo-100">SAFEX</a>
               <a href="https://tripeasy.co.kr/" target="_blank" rel="noopener noreferrer" className="bg-white py-2 rounded-lg text-center text-[10px] font-bold text-indigo-900 shadow-sm border border-indigo-100">TRIPEASY</a>
               <a href="https://www.zimcarry.net/" target="_blank" rel="noopener noreferrer" className={`py-2 rounded-lg text-center text-[10px] font-black border transition-all ${isZimCarryRegistered ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-indigo-900 border-indigo-100'}`}>ZIMCARRY</a>
            </div>
         </div>
      </div>
    </div>
  );
}
