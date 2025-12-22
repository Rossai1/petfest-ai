import { Geist, Geist_Mono } from "next/font/google";
import { Quicksand } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from '@/components/Providers';
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
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
