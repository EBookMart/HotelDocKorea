"use client";

import React, { useState } from "react";
import {
  Phone,
  ShieldAlert,
  HeartPulse,
  FileText,
  Info,
  Navigation,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import emergencyData from "../../public/data/emergency.json";

type TabKey = "hospital" | "lost" | "passport";

export default function EmergencyHelpSection() {
  const t = useTranslations("emergency");
  const [activeTab, setActiveTab] = useState<TabKey>("hospital");
  const [cardIndex, setCardIndex] = useState(0);

  const currentCards = (emergencyData.cardNews as any)[activeTab] || [];

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setCardIndex(0);
  };

  const isFirstCard = cardIndex === 0;
  const isLastCard = cardIndex === currentCards.length - 1;

  const nextCard = () => {
    if (!isLastCard) setCardIndex((prev) => prev + 1);
  };
  const prevCard = () => {
    if (!isFirstCard) setCardIndex((prev) => prev - 1);
  };

  return (
    <div
      id="emergency-section"
      className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-rose-500/5"
    >
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-red-600 via-rose-500 to-rose-600 p-8 md:p-12 text-white relative overflow-hidden">
        <div className="flex items-center gap-4 mb-5 relative z-10">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
            <ShieldAlert size={32} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">
              {t("title")}
            </h2>
            <p className="text-white/80 text-xs font-bold tracking-widest mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Translation Banner - common tool across all categories */}
        <a
          href="tel:1588-5644"
          className="relative z-10 inline-flex items-center gap-3 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 px-5 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
        >
          <span className="text-2xl">🌐</span>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
              {t("footer.translation")}
            </span>
            <span className="text-lg font-black tracking-tighter">1588-5644</span>
          </div>
        </a>

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
              {t(`tabs.${tab}`)}
            </button>
          ))}

          {/* Emergency Hotlines - 3 numbers, mobile-visible */}
          <div className="mt-4 lg:mt-auto lg:w-full space-y-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 hidden lg:block">
              {t("supportHotline")}
            </h4>
            <div className="flex lg:flex-col gap-2">
              {emergencyData.hotlines.map((h: any) => {
                const isTourist = h.id === "tourist";
                return (
                  <a
                    key={h.id}
                    href={`tel:${h.number}`}
                    className={`flex-1 lg:flex-none flex items-center gap-3 p-3 lg:p-4 rounded-2xl border transition-all shadow-sm hover:shadow-md active:scale-[0.98] ${
                      isTourist
                        ? "bg-rose-50 border-rose-200 hover:border-rose-300"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-2xl">{h.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-black text-lg tracking-tighter leading-none ${
                          isTourist ? "text-rose-600" : "text-gray-900"
                        }`}
                      >
                        {h.number}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 font-bold truncate">
                        {t(`hotlines.${h.id}`)}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-12 relative flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <CheckCircle2 size={24} className="text-rose-500" />
              {t("quickTip")}
            </h3>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">
              {t("swipeTip")}
            </p>
          </div>

          {/* Carousel with side-arrows */}
          <div className="relative h-[480px] md:h-[420px] w-full">
            {currentCards.map((card: any, idx: number) => {
              const isActive = idx === cardIndex;
              if (!isActive) return null;

              const cardTitle = t(`cards.${activeTab}.${card.id}.title`);
              const cardDesc = t(`cards.${activeTab}.${card.id}.desc`);
              const cardAction = t(`cards.${activeTab}.${card.id}.action`);

              return (
                <div
                  key={card.id}
                  className="absolute inset-0 flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500"
                >
                  <div
                    className={`w-full md:w-2/5 bg-gradient-to-br ${card.color} p-10 flex flex-col items-center justify-center text-white text-center`}
                  >
                    <div className="bg-white/20 backdrop-blur-md w-24 h-24 rounded-3xl flex items-center justify-center text-6xl mb-6 shadow-xl">
                      {card.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">
                      {t("lesson", { n: idx + 1 })}
                    </span>
                    <h4 className="text-2xl font-black tracking-tighter leading-none">
                      {cardTitle}
                    </h4>
                  </div>

                  <div className="flex-1 p-8 md:p-12 flex flex-col">
                    <div className="flex-1">
                      <p className="text-lg md:text-xl font-black text-gray-900 leading-tight mb-4">
                        {cardDesc}
                      </p>

                      {idx === 0 && activeTab === "lost" && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100">
                          <Info size={14} /> {t("lostTip")}
                        </div>
                      )}

                      {idx === 0 && activeTab === "hospital" && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-[11px] font-bold rounded-xl border border-red-100">
                          <ShieldAlert size={14} /> {t("hospitalTip")}
                        </div>
                      )}
                    </div>

                    <div className="mt-8 space-y-4">
                      <a
                        href={card.actionUrl}
                        target={card.actionUrl.startsWith("http") ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white shadow-2xl transition-all hover:scale-[1.03] active:scale-95 bg-gradient-to-r ${card.color}`}
                      >
                        {cardAction}
                        <ChevronRight size={18} />
                      </a>

                      {/* Contextual resource - shown inside the final card only */}
                      {idx === currentCards.length - 1 && activeTab === "lost" && (
                        <div className="pt-4 border-t border-gray-100">
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                            {t("footer.policePortal")}
                          </h5>
                          <a
                            href="https://www.lost112.go.kr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-gray-900 font-black hover:text-rose-600 transition-colors text-sm"
                          >
                            LOST112.GO.KR
                            <span className="text-xs">↗</span>
                          </a>
                        </div>
                      )}

                      {idx === currentCards.length - 1 && activeTab === "passport" && (
                        <div className="pt-4 border-t border-gray-100">
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                            {t("footer.passportHelp")}
                          </h5>
                          <button
                            onClick={() => alert(t("footer.embassyGuide"))}
                            className="inline-flex items-center gap-2 text-gray-900 font-black hover:text-rose-600 transition-colors text-sm"
                          >
                            {t("footer.embassyGuide")}
                            <span className="text-xs">→</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Side-center arrow buttons (new UI) */}
            <button
              onClick={prevCard}
              aria-label="Previous card"
              disabled={isFirstCard}
              className={`absolute left-2 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md shadow-xl shadow-black/10 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 hover:text-rose-600 active:scale-95 transition-all ${
                isFirstCard ? "invisible" : ""
              }`}
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <button
              onClick={nextCard}
              aria-label="Next card"
              disabled={isLastCard}
              className={`absolute right-2 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-md shadow-xl shadow-black/10 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 hover:text-rose-600 active:scale-95 transition-all ${
                isLastCard ? "invisible" : ""
              }`}
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-1.5 mt-8">
            {currentCards.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCardIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === cardIndex ? "w-8 bg-rose-500" : "w-1.5 bg-gray-200"
                }`}
                aria-label={`Go to card ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
