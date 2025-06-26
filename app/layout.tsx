import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AuthServerWrapper from "./auth-server-wrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PeerStone",
  description: "Your secure blockchain wallet",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "48x48", url: "/favicon-48x48.png" },
    { rel: "icon", type: "image/png", sizes: "256x256", url: "/favicon-256x256.png" },
    { rel: "icon", type: "image/png", sizes: "192x192", url: "/android-chrome-192x192.png" },
    // Add more here if you add more sizes
  ],
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthServerWrapper>
          {children}
        </AuthServerWrapper>
      </body>
    </html>
  );
}
