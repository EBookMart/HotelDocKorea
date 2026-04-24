"use client";

import { useState } from "react";
import { Lock, TrendingUp, AlertTriangle, CheckCircle, Smartphone } from "lucide-react";

export default function AdminDashboardClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "7777") { // Hardcoded Mock PIN
      setIsAuthenticated(true);
    } else {
      alert("틀린 보안 PIN 입니다.");
      setPin("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-sm">
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center shadow-inner">
               <Lock className="text-gray-400" size={32} />
             </div>
          </div>
          <h1 className="text-white font-extrabold text-xl text-center mb-2">HotelDocKorea 지휘통제실</h1>
          <p className="text-gray-400 text-xs text-center mb-8">오직 권한이 있는 관리자만 접근할 수 있습니다.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="보안 PIN 4자리 입력" 
              className="bg-gray-900 border border-gray-600 text-white text-center tracking-widest font-bold rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={4}
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all">접속하기</button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4">
      <div className="w-full max-w-md">
         <header className="flex items-center justify-between py-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
            <span className="text-xs font-bold text-white bg-green-500 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
               <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> LIVE
            </span>
         </header>

         {/* Today's KPI */}
         <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
               <TrendingUp className="text-indigo-500 mb-2" size={24} />
               <h2 className="text-xs font-bold text-gray-400 mb-1">오늘 수집된 특가</h2>
               <div className="text-3xl font-black text-gray-800">90<span className="text-sm font-medium text-gray-500">건</span></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
               <Smartphone className="text-green-500 mb-2" size={24} />
               <h2 className="text-xs font-bold text-gray-400 mb-1">제휴 링크 (CTR)</h2>
               <div className="text-3xl font-black text-gray-800">12.4<span className="text-sm font-medium text-gray-500">%</span></div>
            </div>
         </div>

         {/* System Monitor */}
         <h2 className="text-sm font-extrabold text-gray-800 mb-4 px-1">자가 진단 시스템 로그</h2>
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <CheckCircle size={16} className="text-blue-500" />
               </div>
               <div>
                 <h3 className="text-sm font-bold text-gray-800">스크래퍼 정상 동작</h3>
                 <p className="text-[10px] text-gray-500 mt-0.5">새벽 04:00 (KST) - 5개 브랜드 스크래핑 성공</p>
               </div>
            </div>
            <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-rose-50/30">
               <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} className="text-rose-600" />
               </div>
               <div>
                 <h3 className="text-sm font-bold text-gray-800">Self-healing: 2 Dead Links Removed</h3>
                 <p className="text-[10px] text-gray-500 mt-0.5">파크하얏트 특가 종료 감지. 자동 삭제 조치됨 (04:05)</p>
               </div>
            </div>
            <div className="p-4 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <span className="text-indigo-500 text-xs font-extrabold">SNS</span>
               </div>
               <div>
                 <h3 className="text-sm font-bold text-gray-800">트위터/알림톡 발송 완료</h3>
                 <p className="text-[10px] text-gray-500 mt-0.5">오늘의 Top 3 발송 완료 (도달률: 1,200명)</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
