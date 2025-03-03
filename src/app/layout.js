import { Geist, DM_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Criminus",
  description: "Criminus, a anti crime software",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Criminus",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  shrinkToFit: false,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Criminus" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* <style>{`
          html, body {
            touch-action: pan-x pan-y;
            -ms-touch-action: pan-x pan-y;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            overscroll-behavior: none;
          }
        `}</style>
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('gesturestart', function(e) {
              e.preventDefault();
              return false;
            });
            document.addEventListener('gesturechange', function(e) {
              e.preventDefault();
              return false;
            });
            document.addEventListener('gestureend', function(e) {
              e.preventDefault();
              return false;
            });
            document.addEventListener('touchmove', function(e) {
              if (e.scale !== 1) { e.preventDefault(); }
            }, { passive: false });
          `
        }} /> */}
      </head>
      <body
        className={`${geistSans.variable} ${dmSans.variable} antialiased min-h-screen flex flex-col`}
      >
        {children}
        <Script src="/sw-register.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
