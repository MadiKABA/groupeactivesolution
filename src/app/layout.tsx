import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
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
  themeColor: "#0b1730",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body>
        <Header />
        {/* Réserve la hauteur du header fixe (72px, 90px à partir de xl). En navy pour que le
            header translucide se fonde avec le hero en haut de page. */}
        <div aria-hidden="true" className="h-18 bg-brand-navy xl:h-22.5" />
        {children}
      </body>
    </html>
  );
}
