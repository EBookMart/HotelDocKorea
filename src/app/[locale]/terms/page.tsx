import { setRequestLocale } from "next-intl/server";

export default async function TermsOfService({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans text-gray-800 bg-white min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-indigo-900 border-b pb-4">서비스 이용약관 (Terms of Service)</h1>
      
      <p className="mb-4 text-sm text-gray-500">시행일: 2026년 4월 15일</p>
      
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">제 1 조 (목적)</h2>
          <p>본 약관은 HotelDocKorea(이하 "회사")가 제공하는 호텔 프로모션 큐레이션 및 가격 비교 검색 서비스(이하 "서비스")와 관련하여, 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">제 2 조 (제휴 링크 면책 및 예약 보장 범위)</h2>
          <p className="text-rose-600 font-medium">회사는 각 호텔의 공식 홈페이지 정보와 글로벌 OTA(아고다, 부킹닷컴 등)에서 제공받는 정보의 단순 중개자이며, 예약 거래의 당사자가 아닙니다.</p>
          <ul className="list-disc pl-5 mt-2 text-gray-700">
            <li>본 사이트에 명시된 프로모션 가격, 투숙일정, 잔여 객실 수 등은 실시간으로 변동될 수 있습니다.</li>
            <li>이용자가 제휴 버튼(예: "아고다 최저가 비교")을 클릭하여 발생하는 파트너사 페이지에서의 결제 및 취소 환불 등 모든 법적 책임은 해당 파트너사(OTA) 및 이용자 본인에게 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">제 3 조 (AI 큐레이션 및 알림 서비스)</h2>
          <p>회사가 제공하는 "이 주의 가성비 특가" 등 AI 분석 추천 시스템은 빅데이터를 기반으로 한 단순 통계적 추천 정보입니다. 회사는 이 추천을 통해 비롯되는 경제적 이득 및 손실을 온전히 보장하지 않습니다.</p>
        </section>
        
        <div className="mt-10 pt-8 border-t text-center">
          <a href="/" className="inline-block bg-indigo-600 text-white font-bold px-6 py-2 rounded-full hover:bg-indigo-700 transition">홈으로 돌아가기</a>
        </div>
      </div>
    </div>
  );
}
