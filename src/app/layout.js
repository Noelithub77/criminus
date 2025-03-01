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
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Criminus",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Criminus" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="/native-app.css" />
      </head>
      <body
        className={`${geistSans.variable} ${dmSans.variable} antialiased min-h-screen flex flex-col overscroll-none`}
      >
        <div className="app-content">
          {children}
        </div>
        <Script src="/sw-register.js" strategy="afterInteractive" />
        <Script id="prevent-zoom" strategy="afterInteractive">
          {`
            // Only apply these on mobile devices
            if (window.innerWidth <= 768) {
              // Prevent pinch zoom
              document.addEventListener('touchmove', function(event) {
                if (event.scale !== 1) {
                  event.preventDefault();
                }
              }, { passive: false });
              
              // Double-tap prevention
              let lastTouchEnd = 0;
              document.addEventListener('touchend', function(event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                  event.preventDefault();
                }
                lastTouchEnd = now;
              }, false);
            }
            
            // Detect if the app is in standalone mode (PWA installed)
            if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
              document.documentElement.classList.add('pwa-installed');
            }
          `}
        </Script>
      </body>
    </html>
  );
}
