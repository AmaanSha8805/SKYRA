import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SplashScreen } from "@/components/SplashScreen";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SKYRA - AI-Powered Career Intelligence",
  description: "Understand your resume, analyze jobs, identify skill gaps, and make better career decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <SplashScreen />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
