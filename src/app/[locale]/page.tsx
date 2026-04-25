import fs from 'fs';
import path from 'path';
import HomeClient from '@/components/HomeClient';
import { setRequestLocale } from "next-intl/server";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const publicDir = path.join(process.cwd(), 'public', 'data');

  let hotelData = {};
  try {
    hotelData = JSON.parse(fs.readFileSync(path.join(publicDir, 'hotels.json'), 'utf8'));
  } catch (err) {
    console.error("Failed to load hotels.json", err);
  }

  let hotPicksData: { promotions: any[] } = { promotions: [] };
  try {
    hotPicksData = JSON.parse(fs.readFileSync(path.join(publicDir, 'hot-picks.json'), 'utf8'));
  } catch (err) {
    console.error("Failed to load hot-picks.json", err);
  }

  return (
    <div className="w-full min-h-screen">
      <HomeClient hotelData={hotelData} hotPicksData={hotPicksData} />
    </div>
  );
}
