"use client";

import React, { useState, useEffect } from "react";
import {
  Train, Car, Bus, Info, AlertTriangle, CheckCircle2,
  Navigation, CreditCard, ChevronRight, MapPin,
  Plane, ArrowRight, Smartphone, Luggage, CircleDot, Package,
} from "lucide-react";
import { useTranslations } from "next-intl";

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
  zimCarryDeadline,
}: AirportGuideProps) {
  const t = useTranslations("airportGuide");
  const [activeTab, setActiveTab] = useState<string>("");
  const [isLuggageMode, setIsLuggageMode] = useState(false);

  useEffect(() => {
    if (routeData?.type === "regional" && routeData.fromAirports?.ICN?.options?.length > 0) {
      setActiveTab(routeData.fromAirports.ICN.options[0].id);
    } else {
      setActiveTab("arex");
    }
  }, [routeData]);

  const updateMonth = "April 2026"; // 정적 표기, 향후 빌드 타임 자동화 가능

  // ─── 데이터 없음 (Preparing) ───
  if (!routeData) {
    return (
      <div className="w-full bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 mt-10 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-6 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 animate-pulse">
              <AlertTriangle size={32} className="text-yellow-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold">{t("preparing.title")}</h3>
          <p className="text-slate-200 text-sm mt-1">{hotelName}</p>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-600 font-medium mb-8 leading-relaxed">{t("preparing.desc")}</p>
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
            <h4 className="text-blue-900 text-sm font-bold mb-4 flex items-center justify-center gap-2">
              <Navigation size={16} /> {t("preparing.linkNotice")}
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.airport.kr/ap/ko/tpt/busRouteList.do"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-blue-200 text-blue-700 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                🚌 {t("preparing.busLink")} <ChevronRight size={16} />
              </a>
              <a
                href="https://www.airport.co.kr/gimpo/cms/frCon/index.do?MENU_ID=1130"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-blue-200 text-blue-700 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                ✈️ {t("preparing.domesticLink")} <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── 지방 호텔 (Regional Intermodal) ───
  if (routeData.type === "regional") {
    const icnOptions = routeData.fromAirports?.ICN?.options || [];
    const activeOption = icnOptions.find((o: any) => o.id === activeTab) || icnOptions[0];

    return (
      <div className="w-full bg-white rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-900/5 mt-10 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-blue-800 p-6 text-white text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Navigation size={22} className="text-indigo-200" />
                {t("intermodalTitle")}
              </h3>
              <p className="text-indigo-100/80 text-sm mt-1">{t("subtitle", { hotel: hotelName })}</p>
            </div>
          </div>
        </div>

        <div className="flex bg-indigo-50/50 border-b border-indigo-100 px-2 overflow-x-auto scroller-hide">
          {icnOptions.map((opt: any) => (
            <button
              key={opt.id}
              onClick={() => setActiveTab(opt.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === opt.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {opt.isFastest && (
                <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded mr-1 font-black animate-pulse uppercase">
                  {t("labels.fastest")}
                </span>
              )}
              {opt.id === "ktx" || opt.id === "gtx_srt" ? <Train size={16} /> : opt.id === "bus" ? <Bus size={16} /> : <Plane size={16} />}
              {opt.title?.[lang] || opt.title?.en || opt.id}
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
                <h4 className="text-lg font-black text-indigo-900 mb-1">
                  {activeOption.title?.[lang] || activeOption.title?.en}
                </h4>
                <p className="text-sm text-indigo-700/70 font-medium mb-6 leading-relaxed">
                  {activeOption.summary?.[lang] || activeOption.summary?.en}
                </p>

                <div className="relative pl-8 space-y-8">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-indigo-200 border-l border-dashed border-indigo-400" />
                  {activeOption.steps?.map((step: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center z-10 shadow-sm">
                        {idx === 0 ? (
                          <CircleDot size={12} className="text-indigo-600" />
                        ) : idx === activeOption.steps.length - 1 ? (
                          <MapPin size={12} className="text-emerald-500" />
                        ) : (
                          <ArrowRight size={12} className="text-indigo-600" />
                        )}
                      </div>
                      <div className="text-sm font-bold text-indigo-900 leading-snug">
                        {typeof step === "string" ? step : step?.[lang] || step?.en}
                      </div>
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
                      {t("labels.bookNow")} · {activeOption.booking.name}
                    </a>
                    <p className="text-center text-[10px] text-indigo-400 mt-3 font-bold uppercase tracking-tighter">
                      {t("labels.verifiedFor")}
                    </p>
                  </div>
                )}
              </div>

              {/* Mobility + Luggage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone size={20} className="text-slate-700" />
                    <h4 className="text-sm font-black text-slate-800">{t("mobility.title")}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{t("mobility.desc")}</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://kride.me/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:scale-105 transition-all shadow-md"
                    >
                      <span className="text-yellow-400 font-black">k.</span>ride
                    </a>
                    <a
                      href="https://www.uber.com/taxi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-black/80 text-white/90 px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:scale-105 transition-all shadow-md"
                    >
                      UT/Uber
                    </a>
                  </div>
                </div>

                <div
                  className={`p-5 rounded-2xl border shadow-sm transition-all ${
                    isZimCarryRegistered ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Luggage size={20} className={isZimCarryRegistered ? "text-emerald-700" : "text-gray-400"} />
                    <h4
                      className={`text-sm font-black ${
                        isZimCarryRegistered ? "text-emerald-800" : "text-gray-500"
                      }`}
                    >
                      {t("luggage.title")}
                    </h4>
                  </div>
                  <p
                    className={`text-[11px] mb-4 leading-relaxed ${
                      isZimCarryRegistered ? "text-emerald-600/80" : "text-gray-400"
                    }`}
                  >
                    {isZimCarryRegistered
                      ? `${t("luggage.desc")} (${t("luggage.deadlineNote", { deadline: zimCarryDeadline || "" })})`
                      : t("luggage.notSupported")}
                  </p>
                  <a
                    href="https://www.zimcarry.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block py-2 rounded-lg text-center text-[10px] font-black border transition-all ${
                      isZimCarryRegistered
                        ? "bg-white text-emerald-700 border-emerald-200 shadow-sm hover:border-emerald-500"
                        : "bg-gray-200 text-gray-400 border-transparent pointer-events-none"
                    }`}
                  >
                    ZIMCARRY {isZimCarryRegistered ? "· 37k~80k KRW" : ""}
                  </a>
                </div>
              </div>

              {/* k.ride 강조 카드 */}
              <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-120 transition-transform">
                  <Smartphone size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-yellow-400 text-indigo-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                      {t("labels.musthaveApp")}
                    </span>
                    <h4 className="text-xl font-black">{t("mobility.krideTitle")}</h4>
                  </div>
                  <p className="text-sm text-indigo-100/80 font-medium mb-6 leading-relaxed">
                    {t("mobility.krideDesc")}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://kride.me/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-indigo-900 px-6 py-3 rounded-2xl text-sm font-black shadow-lg hover:bg-yellow-400 hover:scale-105 transition-all text-center"
                    >
                      {t("mobility.krideInstall")}
                    </a>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-200">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      {t("mobility.krideBenefits")}
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
            {t("general.applePayNotice")}
          </p>
        </div>

        <div className="bg-indigo-950 p-4 text-white/40 text-[9px] font-medium text-center">
          {t("footer.credit", { month: updateMonth })}
        </div>
      </div>
    );
  }

  // ─── 일반 (Capital Area Standard) ───
  return (
    <div className="w-full bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 mt-10 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Navigation size={22} className="text-blue-200" />
            {t("title")}
          </h3>
          <p className="text-blue-100/80 text-sm mt-1">{t("subtitle", { hotel: hotelName })}</p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
          <div className="text-right">
            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-tighter">{t("labels.luggageToggle")}</div>
            <div className="text-[11px] font-medium leading-none">
              {isLuggageMode ? t("labels.luggageOn") : t("labels.luggageOff")}
            </div>
          </div>
          <button
            onClick={() => setIsLuggageMode(!isLuggageMode)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              isLuggageMode ? "bg-yellow-400" : "bg-white/20"
            }`}
            aria-label={t("labels.luggageToggle")}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                isLuggageMode ? "translate-x-6" : ""
              } flex items-center justify-center`}
            >
              <div className={`w-2 h-2 rounded-full ${isLuggageMode ? "bg-yellow-600" : "bg-gray-300"}`} />
            </div>
          </button>
        </div>
      </div>

      <div className="flex bg-blue-50/50 border-b border-blue-100 px-2 overflow-x-auto scroller-hide">
        {(["arex", "taxi", "bus", "subway"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "arex" && <Train size={16} />}
            {tab === "taxi" && <Car size={16} />}
            {tab === "bus" && <Bus size={16} />}
            {tab === "subway" && (
              <div className="w-4 h-4 rounded-full bg-yellow-400 text-[10px] flex items-center justify-center text-white font-bold">
                9
              </div>
            )}
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === "arex" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                  {t("general.expressTrainLabel")}
                </span>
                <div className="text-lg font-black text-blue-900 mt-1">{t("general.expressDuration")}</div>
                <div className="text-xs text-blue-600">{t("general.expressTo")}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  {t("general.localTrainLabel")}
                </span>
                <div className="text-lg font-black text-gray-900 mt-1">{t("general.localDuration")}</div>
                <div className="text-xs text-gray-600">{t("general.localTo")}</div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h4 className="text-amber-800 text-sm font-bold flex items-center gap-2 mb-2">
                <Info size={16} /> {t("general.qrTitle")}
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">{t("general.qrDesc")}</p>
            </div>
          </div>
        )}

        {activeTab === "taxi" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-xl">
              <h4 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                {t("general.intlTaxiTag")}
              </h4>
              <div className="text-xl font-black mb-3">{t("general.intlTaxiTitle")}</div>
              <p className="text-[11px] text-indigo-100/80 leading-relaxed mb-4">{t("general.intlTaxiDesc")}</p>
              <div className="flex gap-2 flex-wrap">
                <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-[10px] font-bold">
                  {t("general.zoneA")}
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-[10px] font-bold">
                  {t("general.zoneB")}
                </div>
                <div className="bg-indigo-500 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                  {t("general.t1Desk")}
                </div>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <h4 className="text-rose-800 text-sm font-bold flex items-center gap-2 mb-2">
                <AlertTriangle size={16} /> {t("general.surchargeTitle")}
              </h4>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">{t("general.surchargeDesc")}</p>
            </div>
          </div>
        )}

        {activeTab === "bus" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="text-lg font-black text-gray-800">{t("general.limousineTitle")}</div>
                  <div className="text-xs text-gray-500">{t("general.limousineSub")}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-blue-600">{t("general.limousineFare")}</div>
                  <div className="text-[10px] text-gray-400">{t("general.limousineRate")}</div>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-2xl">
                <h4 className="text-indigo-900 text-sm font-bold mb-2">💡 {t("general.lateNightTitle")}</h4>
                <p className="text-xs text-indigo-700 mb-3 font-medium">{t("general.lateNightDesc")}</p>
                <a
                  href="https://www.airport.kr/ap/ko/tpt/busRouteList.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-all"
                >
                  {t("general.lateNightCheck")} <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === "subway" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-1 bg-yellow-400 rounded-full" />
              <div className="space-y-8 pl-10">
                <div className="relative">
                  <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white ring-2 ring-red-500" />
                  <div className="font-extrabold text-red-600 text-sm">{t("labels.express")}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-medium">{t("general.expressRouteDesc")}</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-500" />
                  <div className="font-extrabold text-blue-600 text-sm">{t("labels.local")}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-medium">{t("general.localRouteDesc")}</div>
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
              <div className="text-sm font-bold text-blue-900">{t("general.applePayTitle")}</div>
              <div className="text-[10px] text-blue-600">{t("general.applePayDesc")}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href="https://www.wowpass.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-700 px-4 py-2 rounded-xl text-[10px] font-black shadow-sm border border-blue-200 hover:border-blue-400 transition-all"
            >
              {t("general.wowpassButton")}
            </a>
            <a
              href="https://news.seoul.go.kr/traffic/archives/512887"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-sm hover:bg-blue-700 transition-all"
            >
              {t("general.climateButton")}
            </a>
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 font-bold leading-relaxed">{t("general.applePayNotice")}</p>
        </div>

        <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Smartphone size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-yellow-400 text-indigo-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                {t("labels.musthaveApp")}
              </span>
              <h4 className="text-lg font-black">{t("mobility.krideTitle")}</h4>
            </div>
            <p className="text-xs text-indigo-100/80 mb-5 font-medium">{t("mobility.krideDesc")}</p>
            <div className="flex gap-3">
              <a
                href="https://kride.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-indigo-900 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-all"
              >
                {t("mobility.krideInstall")}
              </a>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isZimCarryRegistered ? "bg-emerald-50 border-emerald-100" : "bg-white border-gray-100 opacity-80"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className={isZimCarryRegistered ? "text-emerald-600" : "text-gray-400"} />
            <span
              className={`text-xs font-bold uppercase ${
                isZimCarryRegistered ? "text-emerald-900" : "text-gray-500"
              }`}
            >
              {t("general.luggageHeader")}
            </span>
          </div>
          <p
            className={`text-[11px] mb-4 font-bold leading-relaxed ${
              isZimCarryRegistered ? "text-emerald-700" : "text-gray-400"
            }`}
          >
            {isZimCarryRegistered
              ? t("general.luggageSendDirect", { deadline: zimCarryDeadline || "" })
              : t("general.luggageHandsFree")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <a
              href="https://www.safex.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white py-2 rounded-lg text-center text-[10px] font-bold text-indigo-900 shadow-sm border border-indigo-100 hover:border-indigo-300 transition-all"
            >
              SAFEX
            </a>
            <a
              href="https://tripeasy.co.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white py-2 rounded-lg text-center text-[10px] font-bold text-indigo-900 shadow-sm border border-indigo-100 hover:border-indigo-300 transition-all"
            >
              TRIPEASY
            </a>
            <a
              href="https://www.zimcarry.net/"
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2 rounded-lg text-center text-[10px] font-black border transition-all ${
                isZimCarryRegistered
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-white text-indigo-900 border-indigo-100 hover:border-indigo-300"
              }`}
            >
              ZIMCARRY
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
