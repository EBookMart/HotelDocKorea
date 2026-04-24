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

  const filePath = path.join(process.cwd(), 'public', 'data', 'hotels.json');
  let hotelData = {};
  
  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    hotelData = JSON.parse(fileData);
  } catch (err) {
    console.error("Failed to load hotels.json", err);
  }

  return (
    <div className="w-full min-h-screen">
      <HomeClient hotelData={hotelData} />
    </div>
  );
}
