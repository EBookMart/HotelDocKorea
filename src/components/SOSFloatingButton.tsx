"use client";

/**
 * SOSFloatingButton
 * 모바일 전용 응급 도움말 플로팅 버튼입니다.
 * 클릭 시 EmergencyHelpSection으로 스크롤합니다.
 * ⚠️ Phase 2C-1: messages/*.json 파일을 건드리지 않기 위해 aria-label에 영어 고정값 사용 (방안 B)
 */
export default function SOSFloatingButton() {
  const handleClick = () => {
    document.getElementById("emergency-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Emergency and Help"
      className="md:hidden fixed bottom-6 right-4 z-50 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg shadow-red-600/40 transition-all duration-200 hover:scale-105 active:scale-95"
    >
      <span className="text-xs font-bold leading-none">SOS</span>
      <span className="text-[8px] mt-0.5 leading-none opacity-90">HELP</span>
    </button>
  );
}
