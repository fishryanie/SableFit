import type { Metadata, Viewport } from "next";
import { MobileFlashScreen } from "@/components/mobile-flash-screen";
import { MobileZoomLock } from "@/components/mobile-zoom-lock";
import { PwaMobileInstall } from "@/components/pwa-mobile-install";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { defaultLocale } from "@/i18n/config";
import { Be_Vietnam_Pro, Space_Grotesk, Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sablefit.app"),
  title: {
    default: "SableFit",
    template: "%s | SableFit",
  },
  description:
    "SableFit is a mobile-first workout planner app and gym routine tracker for visual exercise libraries, weekly plans, and daily training reminders.",
  applicationName: "SableFit",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SableFit",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [{ url: "/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    "workout planner app",
    "gym routine tracker",
    "lich tap gym",
    "workout plan",
    "training schedule",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#111111",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <html
      lang={locale || defaultLocale}
      suppressHydrationWarning
      className={cn("h-full", "antialiased", beVietnamPro.variable, spaceGrotesk.variable, "font-sans", geist.variable)}
    >
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <TooltipProvider>
              <MobileZoomLock />
              <MobileFlashScreen />
              <PwaMobileInstall />
              {children}
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
