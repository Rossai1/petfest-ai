import { Geist, Geist_Mono } from "next/font/google";
import { Quicksand } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from '@/components/common/Providers';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Header from '@/components/common/Header';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "PetFest - Transforme seus pets em momentos festivos",
  description: "Transforme fotos dos seus pets em momentos festivos incríveis usando IA",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: '#7FB5B5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PetFest',
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk',
      }}
    >
      <html lang="pt-BR">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${quicksand.variable} antialiased`}
        >
          <ErrorBoundary>
            <Providers>
              <Header />
              {children}
            </Providers>
          </ErrorBoundary>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: '24px',
                padding: '16px',
                fontFamily: 'var(--font-quicksand)',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
