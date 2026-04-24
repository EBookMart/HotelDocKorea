"use client";

import React, { useState, useRef } from "react";
import { Phone, MapPin, Search, ShieldAlert, HeartPulse, FileText, Info, ExternalLink, HelpCircle, Navigation, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import emergencyData from "../../public/data/emergency.json";

export default function EmergencyHelpSection({ lang }: { lang: string }) {
  const [activeTab, setActiveTab] = useState<"hospital" | "lost" | "passport">("hospital");
  const [cardIndex, setCardIndex] = useState(0);
  const [nearbyPolice, setNearbyPolice] = useState<string | null>(null);
  const [loadingGPS, setLoadingGPS] = useState(false);

  const t: any = {
    ko: {
      title: "긴급 상황 가이드 (Emergency & Help In KOREA)",
      hospital: "의료 및 병원",
      lost: "유실물 대처",
      passport: "여권 분실/도난",
      bbbInfo: "119는 24시간 16개국 무료 통역을 지원합니다.",
      gpsBtn: "내 주변 경찰서 찾기",
      gpsLoading: "위치 파악 중...",
      lost112: "LOST112 (유실물 포털)",
      bbbHotline: "BBB 코리아 무료 통역 (1588-5644)",
      quickTip: "빠른 행동 지침",
      swipeTip: "카드를 넘겨 상세 지침을 확인하세요"
    },
    en: {
      title: "Emergency & Help In KOREA Guide",
      hospital: "Medical/Hospitals",
      lost: "Lost & Found",
      passport: "Lost Passport",
      bbbInfo: "119 provides 24/7 3-way translation (16 languages).",
      gpsBtn: "Find Nearby Police Station",
      gpsLoading: "Locating...",
      lost112: "LOST112 (Lost & Found Portal)",
      bbbHotline: "BBB Korea Translation (1588-5644)",
      quickTip: "Step-by-Step Action Guide",
      swipeTip: "Swipe cards to see detailed instructions"
    },
    ja: {
      title: "緊急事態ヘルプガイド In KOREA",
      hospital: "医療・病院",
      lost: "遺失物案内",
      passport: "パスポート紛실",
      bbbInfo: "119は24時間3者通話多言語対応可能です。",
      gpsBtn: "周辺の警察署を探す",
      gpsLoading: "位置を確認中...",
      lost112: "LOST112 (警察庁遺失物ポータル)",
      bbbHotline: "BBBコリア無料通訳 (1588-5644)",
      quickTip: "行動マニュアル",
      swipeTip: "カードをスライドして手順を確認してください"
    }
  };

  const currentT = t[lang] || t.en;
  const currentCards = (emergencyData.cardNews as any)[activeTab] || [];

  const handleTabChange = (tab: "hospital" | "lost" | "passport") => {
    setActiveTab(tab);
    setCardIndex(0);
  };

  const nextCard = () => setCardIndex((prev) => (prev + 1) % currentCards.length);
  const prevCard = () => setCardIndex((prev) => (prev - 1 + currentCards.length) % currentCards.length);

  const findNearbyPolice = () => {
    setLoadingGPS(true);
    if (!navigator.geolocation) {
      alert("GPS is not supported by your browser.");
      setLoadingGPS(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearbyPolice("Jongno Police Station (Simulated Result based on Seoul GPS)");
        setLoadingGPS(false);
      },
      () => {
        alert("Unable to retrieve your location.");
        setLoadingGPS(false);
      }
    );
  };

  return (
    <div id="emergency-section" className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-rose-500/5">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-red-600 via-rose-500 to-rose-600 p-8 md:p-12 text-white relative overflow-hidden">
        <div className="flex items-center gap-4 mb-3 relative z-10">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
            <ShieldAlert size={32} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">{currentT.title}</h2>
            <p className="text-white/80 text-xs font-bold tracking-widest mt-1">Official Protection System Guide for Foreign Tourists</p>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute -top-12 -right-12 opacity-10 rotate-12">
          <ShieldAlert size={280} />
        </div>
        <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-80 bg-gray-50/80 p-6 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible border-b lg:border-b-0 lg:border-r border-gray-100">
          {(["hospital", "lost", "passport"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 lg:flex-none flex items-center gap-3 py-4 px-6 rounded-2xl text-sm font-black transition-all text-left whitespace-nowrap ${
                activeTab === tab 
                ? "bg-white text-rose-600 shadow-xl shadow-rose-500/10 ring-1 ring-black/5 translate-x-1" 
                : "text-gray-400 hover:bg-gray-100"
              }`}
            >
              {tab === "hospital" && <HeartPulse size={18} />}
              {tab === "lost" && <Navigation size={18} />}
              {tab === "passport" && <FileText size={18} />}
              {currentT[tab]}
            </button>
          ))}

          <div className="hidden lg:block mt-auto p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Support Hotline</h4>
            <a href="tel:1330" className="flex items-center gap-2 text-rose-600">
               <Phone size={16} />
               <span className="font-black text-lg tracking-tighter">1330</span>
            </a>
            <p className="text-[10px] text-gray-500 mt-1 font-bold">24/7 National Help Desk</p>
          </div>
        </div>

        {/* Content Area - Card News Carousel */}
        <div className="flex-1 p-6 md:p-12 relative flex flex-col justify-center">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <CheckCircle2 size={24} className="text-rose-500" />
                {currentT.quickTip}
              </h3>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">{currentT.swipeTip}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevCard}
                className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-white hover:shadow-lg transition-all text-gray-400 hover:text-rose-600"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextCard}
                className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-white hover:shadow-lg transition-all text-gray-400 hover:text-rose-600 transition-all active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Carousel Slide */}
          <div className="relative h-[480px] md:h-[420px] w-full">
            {currentCards.map((card: any, idx: number) => {
              const isActive = idx === cardIndex;
              if (!isActive) return null;

              return (
                <div 
                  key={card.id}
                  className="absolute inset-0 flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500"
                >
                  {/* Card Visual Side */}
                  <div className={`w-full md:w-2/5 bg-gradient-to-br ${card.color} p-10 flex flex-col items-center justify-center text-white text-center`}>
                     <div className="bg-white/20 backdrop-blur-md w-24 h-24 rounded-3xl flex items-center justify-center text-6xl mb-6 shadow-xl">
                        {card.icon}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Lesson {idx + 1}</span>
                     <h4 className="text-2xl font-black tracking-tighter leading-none">{lang === 'ko' ? card.titleKo : card.title}</h4>
                  </div>

                  {/* Card Content Side */}
                  <div className="flex-1 p-8 md:p-12 flex flex-col">
                    <div className="flex-1">
                      <p className="text-lg md:text-xl font-black text-gray-900 leading-tight mb-4">
                        {lang === 'ko' ? card.descKo : card.desc}
                      </p>
                      
                      {/* Special Context logic for cards */}
                      {idx === 0 && activeTab === 'lost' && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100">
                          <Info size={14} /> Recommended Action: Check your recent credit card history.
                        </div>
                      )}
                      
                      {idx === 0 && activeTab === 'hospital' && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-[11px] font-bold rounded-xl border border-red-100">
                           <ShieldAlert size={14} /> Dial 119 directly; GPS will track your location automatically.
                        </div>
                      )}
                    </div>

                    <div className="mt-8">
                       <a 
                        href={card.actionUrl} 
                        target={card.actionUrl.startsWith('http') ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white shadow-2xl transition-all hover:scale-[1.03] active:scale-95 bg-gradient-to-r ${card.color}`}
                       >
                         {card.actionText}
                         <ChevronRight size={18} />
                       </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-1.5 mt-8">
            {currentCards.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCardIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === cardIndex ? "w-8 bg-rose-500" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info Area */}
      <div className="bg-gray-50 px-8 py-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-10">
          <div className="text-center md:text-left">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Police Portal</h5>
            <a href="https://www.lost112.go.kr" className="text-gray-900 font-black hover:text-rose-600 transition-colors">LOST112.GO.KR</a>
          </div>
          <div className="text-center md:text-left">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Passport Help</h5>
            <button onClick={() => handleTabChange('passport')} className="text-gray-900 font-black hover:text-rose-600 transition-colors">Embassy Guide</button>
          </div>
          <div className="text-center md:text-left">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Translation</h5>
            <a href="tel:1588-5644" className="text-gray-900 font-black hover:text-rose-600 transition-colors">1588-5644</a>
          </div>
        </div>
        
        <div className="hidden md:flex gap-4">
           {emergencyData.hotlines.slice(0, 2).map((h: any) => (
             <a key={h.id} href={`tel:${h.number}`} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-black text-gray-500 hover:border-rose-300 hover:text-rose-600 transition-all">
                <span>{h.icon}</span> {h.number}
             </a>
           ))}
        </div>
      </div>
    </div>
  );
}
