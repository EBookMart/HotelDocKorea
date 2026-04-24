import { setRequestLocale } from "next-intl/server";

export default async function PrivacyPolicy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-2xl mx-auto p-8 font-sans text-gray-800 bg-white min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-indigo-900 border-b pb-4">개인정보 처리방침 (Privacy Policy)</h1>
      
      <p className="mb-4 text-sm text-gray-500">시행일: 2026년 4월 15일</p>
      
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. 수집하는 개인정보의 항목 및 수집방법</h2>
          <p>HotelDocKorea(이하 "본 사이트")는 이용자의 사전 동의 하에 특가 알림 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</p>
          <ul className="list-disc pl-5 mt-2 text-gray-700">
            <li>필수 항목: 이메일 주소</li>
            <li>수집 방법: 웹사이트 내 "특가 알람 받기" 폼을 통한 자발적 입력</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. 개인정보의 수집 및 이용 목적</h2>
          <p>수집된 이메일 주소는 AI 기반 실시간 호텔 프로모션 알림 및 뉴스레터 발송 목적으로만 사용되며, 그 외 어떠한 영리 목적으로도 타사에 제공되지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. 개인정보의 보유 및 이용 기간</h2>
          <p>이용자가 구독 해지(이메일 내 수신 거부) 링크를 클릭하거나 삭제를 요청할 경우, 해당 정보는 지체 없이 영구 삭제됩니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. 광고주 및 외부 링크에 대한 책임 한계 (Google AdSense)</h2>
          <p>본 사이트는 구글 애드센스(Google AdSense) 광고 시스템 및 제휴 링크(Affiliate Link)를 포함하고 있습니다. 구글 등 타사 업체는 이용자의 관심도 기반 광고를 제공하기 위해 DART 쿠키를 사용할 수 있습니다. 외부 사이트의 개인정보 취급에 대해서는 본 사이트가 책임지지 않습니다.</p>
        </section>
        
        <div className="mt-10 pt-8 border-t text-center">
          <a href="/" className="inline-block bg-indigo-600 text-white font-bold px-6 py-2 rounded-full hover:bg-indigo-700 transition">홈으로 돌아가기</a>
        </div>
      </div>
    </div>
  );
}
