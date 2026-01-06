import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import Header from "@/components/layout/Header";
import SessionRefresh from "@/components/auth/SessionRefresh";
import StripeRedirectHandler from "@/components/auth/StripeRedirectHandler";
import ToastProvider from "@/components/providers/ToastProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Startege - AI Governance Learning Platform",
  description: "Learn AI Governance through interactive concept cards and gamified learning. Prepare for the AIGP certification exam.",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Startege - AI Governance Learning Platform",
    description: "Learn AI Governance through interactive concept cards and gamified learning. Prepare for the AIGP certification exam.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Startege Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Startege - AI Governance Learning Platform",
    description: "Learn AI Governance through interactive concept cards and gamified learning. Prepare for the AIGP certification exam.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SessionProvider>
          <SessionRefresh />
          <Suspense fallback={null}>
            <StripeRedirectHandler />
          </Suspense>
          <Header />
          {children}
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}

