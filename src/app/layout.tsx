import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/footer/Footer";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

const siteName = "Active Solution Digital Service";
const siteDescription =
  "Active Solution accompagne les organisations dans la formation numérique, le développement de solutions digitales et la transformation digitale.";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    type: "website",
    locale: "fr_SN",
    siteName,
    title: siteName,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#07172e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={manrope.variable}>
      {/* #top : cible du lien « Retour en haut » du footer (focus programmatique, sans tabulation) */}
      <body id="top" tabIndex={-1}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
