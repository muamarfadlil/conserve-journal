import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    template: "%s | CONSERVE Journal",
    default: "CONSERVE Journal of Community Services",
  },
  description:
    "Jurnal ilmiah pengabdian kepada masyarakat dengan fokus pada pelestarian " +
    "lingkungan, konservasi kelautan, dan pemberdayaan komunitas pesisir Indonesia.",
  keywords: [
    "jurnal pengabdian masyarakat",
    "community services",
    "konservasi laut",
    "pemberdayaan masyarakat",
    "jurnal ilmiah Indonesia",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "CONSERVE Journal of Community Services",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen bg-ocean-950">
        <SessionProvider session={session}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
