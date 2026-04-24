import { setRequestLocale } from "next-intl/server";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminDashboardClient />;
}
