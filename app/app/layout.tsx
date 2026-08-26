import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SiteChrome } from "@/components/SiteChrome";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

/**
 * Display voice. The `wdth` axis is what makes the headlines expanded rather
 * than merely heavy — if the axis ever fails to load, Archivo still renders
 * at normal width and the page degrades to "bold" instead of breaking.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

/** Reserved for data: prices, durations, times, references, guard numbers. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Fades Barbershop — Honiara",
    template: "%s · Fades Barbershop",
  },
  description:
    "Fades, lining and beards in Honiara Town. Walk in, or book a time so you don't wait.",
  openGraph: {
    title: "Fades Barbershop — Honiara",
    description:
      "Fades, lining and beards in Honiara Town. Walk in, or book a time so you don't wait.",
    type: "website",
    locale: "en",
    siteName: "Fades Barbershop",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fades Barbershop — Honiara",
    description:
      "Fades, lining and beards in Honiara Town. Walk in, or book a time so you don't wait.",
  },
};

export const viewport: Viewport = {
  themeColor: "#191d1e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // globals.css sets `scroll-behavior: smooth` for the in-page anchors.
      // This tells Next it is deliberate, so it doesn't warn about smooth
      // scrolling being applied during route transitions.
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <MotionProvider>
          <SiteChrome footer={<SiteFooter />}>{children}</SiteChrome>
        </MotionProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
