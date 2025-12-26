import type { Metadata } from "next";
import { Inter, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Give Hope | Mission Resource Management",
  description: "The grounded ministry platform for mission-focused organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} ${syne.variable} font-sans antialiased`}
      >
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="48583689-5836-4c2d-98d2-e5c1a9812316"
        />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
            </QueryProvider>
          </ThemeProvider>
          <Toaster />
          <WebVitalsReporter />
          <VisualEditsMessenger />
        </body>
    </html>
  );
}
