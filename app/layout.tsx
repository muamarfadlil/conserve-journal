import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";
import ThemeProvider from "@/components/ThemeProvider";
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
  const session = await getSession().catch(() => null);

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        {/* Skip to main content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[400]
                     focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-ocean-950
                     focus:font-semibold focus:rounded-lg focus:text-sm"
        >
          Langsung ke konten
        </a>

        <ThemeProvider>
          <SessionProvider session={session}>
            <ToastProvider>
              <Header />
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
            </ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
