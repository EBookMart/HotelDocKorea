"use client";

import React, { useState } from 'react';
import { Train, Car, Bus, Info, AlertTriangle, CheckCircle2, Navigation, CreditCard, ChevronRight } from 'lucide-react';
import { TranslatedText } from './HomeClient';

interface AirportGuideProps {
  hotelName: string;
  lang: string;
  routeData?: any;
}

export default function AirportGuide({ hotelName, lang, routeData }: AirportGuideProps) {
  const [activeTab, setActiveTab] = useState<'arex' | 'taxi' | 'bus' | 'subway'>('arex');
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
      luggageOn: "エレベーター優先ルート有効",
      luggageOff: "一般ルート",
    }
  };

  const curT = t[lang] || t.en;

  return (
    <div className="w-full bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 mt-10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Navigation size={22} className="text-blue-200" />
            {curT.title}
          </h3>
          <p className="text-blue-100/80 text-sm mt-1">{hotelName} • ICN/GMP Arrival</p>
        </div>

        {/* 🎒 Luggage Free Toggle */}
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

      {/* Tabs */}
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

      {/* Content */}
      <div className="p-6">
        {activeTab === 'arex' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Quick Summary */}
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

            {/* Critical Guide */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h4 className="text-amber-800 text-sm font-bold flex items-center gap-2 mb-2">
                <Info size={16} /> QR Voucher Exchange Logic
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                If you have an **Express Train voucher** (13-digit serial number), you cannot enter the gate directly. 
                <br /><br />
                <span className="font-bold">Procedure:</span> Enter your serial number at the **Automatic Ticket Machine** to receive a Physical QR Code Ticket.
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-2">
               <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
               <p className="text-sm text-gray-600 leading-snug">
                  AREX is the best choice if your hotel is near **Seoul Station**, **Hongik Univ.**, or **Gongdeok**.
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
                   Fair fixed rates by zones (70,000 ~ 95,000 KRW). Drivers speak fluent English/Japanese/Chinese.
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
                <p className="text-xs text-rose-900 leading-relaxed">
                   When taking a taxi from ICN to Seoul, ALWAYS pick a taxi with a **'SEOUL'** license plate.
                   <br /><br />
                   <span className="font-extrabold underline">Why?</span> Incheon taxis charge a <span className="font-black underline">30% Out-of-City Surcharge</span> when they enter Seoul.
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
                   <p className="text-xs text-indigo-700 mb-3">Late-night buses N6000, N6001, N6002 are available from **1F Platform 6A** at Terminal 1.</p>
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
                      <div className="text-xs text-gray-500 mt-0.5">Stops at major stations only. Best for Gangnam.</div>
                   </div>
                   <div className="relative">
                      <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-500" />
                      <div className="font-extrabold text-blue-600 text-sm">{curT.local}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Stops at every station.</div>
                   </div>
                </div>
             </div>

             <div className="bg-gray-100 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-red-500 font-bold">急</div>
                <div className="text-xs text-gray-600 leading-relaxed">
                   Look for the <span className="font-bold text-red-500">RED</span> sign on the platform screen. "急" or "Express" means it's the fast one!
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer / Smart Card & Luggage Delivery */}
      <div className="bg-blue-50 p-6 flex flex-col gap-6 border-t border-blue-100">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="bg-white p-2 rounded-xl shadow-sm">
                  <CreditCard className="text-blue-600" />
               </div>
               <div>
                  <div className="text-sm font-bold text-blue-900">Apple Pay T-money Ready?</div>
                  <div className="text-[10px] text-blue-600">Top-up via 'Foreigner' menu in Mobile Tmoney.</div>
               </div>
            </div>
            <div className="flex gap-2">
               <button className="bg-white text-blue-700 px-4 py-2 rounded-xl text-[10px] font-extraBold shadow-sm hover:shadow-md transition-all border border-blue-200">
                  WOWPASS Card
               </button>
               <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-extraBold shadow-sm hover:bg-blue-700 transition-all">
                  Climate Card
               </button>
            </div>
         </div>

         <div className="bg-indigo-100/50 p-4 rounded-2xl border border-indigo-200/50">
            <div className="flex items-center gap-2 mb-3">
               <CheckCircle2 size={16} className="text-indigo-600" />
               <span className="text-xs font-bold text-indigo-900 uppercase">Luggage Delivery Services</span>
            </div>
            <p className="text-[11px] text-indigo-700/80 mb-4 font-medium">
               Too heavy to take a train? Send your luggage directly to the hotel and travel hands-free. Same-day delivery available.
            </p>
            <div className="grid grid-cols-3 gap-2">
               <a href="https://www.safex.kr/" target="_blank" className="bg-white py-2 rounded-lg text-center text-[10px] font-bold text-indigo-900 shadow-sm border border-indigo-100 hover:border-indigo-400 transition-all">SAFEX</a>
               <a href="https://tripeasy.co.kr/" target="_blank" className="bg-white py-2 rounded-lg text-center text-[10px] font-bold text-indigo-900 shadow-sm border border-indigo-100 hover:border-indigo-400 transition-all">TRIPEASY</a>
               <a href="https://www.zimcarry.net/" target="_blank" className="bg-white py-2 rounded-lg text-center text-[10px] font-bold text-indigo-900 shadow-sm border border-indigo-100 hover:border-indigo-400 transition-all">ZIMCARRY</a>
            </div>
         </div>
      </div>
    </div>
  );
}
