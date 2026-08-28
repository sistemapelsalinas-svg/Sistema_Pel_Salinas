import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "SGP Salinas — 2º Pel / 2ª Cia PM Ind / 11ª RPM",
  description: "Sistema de Gestão e Planejamento Operacional do 2º Pelotão de Salinas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} overflow-x-hidden`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 bg-gray-50 dark:bg-[#0C111D] text-gray-900 dark:text-gray-100 min-h-screen font-sans overflow-x-hidden w-full max-w-full`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
