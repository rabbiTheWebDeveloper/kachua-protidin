import type {Metadata, Viewport} from 'next';
import { Inter, Noto_Sans_Bengali, Noto_Serif_Bengali } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const bangla = Noto_Sans_Bengali({ 
  subsets: ['bengali'], 
  weight: ['400', '500', '600', '700'], 
  variable: '--font-bangla' 
});
const banglaSerif = Noto_Serif_Bengali({ 
  subsets: ['bengali'], 
  weight: ['400', '500', '600', '700', '900'], 
  variable: '--font-serif-bangla' 
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#b91c1c',
};

export const metadata: Metadata = {
  title: 'কচুয়া প্রতিদিন | চাঁদপুর জেলার সর্বপ্রথম ও সর্বাধুনিক অনলাইন নিউজ পোর্টাল',
  description: 'কচুয়া প্রতিদিন (Kachua Protidin) চাঁদপুর জেলার কচুয়া উপজেলার স্থানীয় খবর, রাজনীতি, সমাজ, খেলাধুলা, শিক্ষা ও ঐতিহ্যবাহী জীবনযাত্রার নির্ভরযোগ্য ও বস্তুনিষ্ঠ নিউজ পোর্টাল।',
  keywords: ['কচুয়া প্রতিদিন', 'Kachua Protidin', 'কচুয়া নিউজ', 'চাঁদপুর খবর', 'কচুয়া চাঁদপুর সংবাদ', 'Chandpur News', 'Kachua News Portal', 'চাঁদপুর জেলার খবর'],
  alternates: {
    canonical: 'https://kachuaprotidin.com',
  },
  openGraph: {
    title: 'কচুয়া প্রতিদিন | চাঁদপুর জেলার সর্বাধুনিক অনলাইন নিউজ পোর্টাল',
    description: 'কচুয়া প্রতিদিন চাঁদপুর জেলার কচুয়া উপজেলার স্থানীয় খবর, রাজনীতি, সমাজ, খেলাধুলা ও বস্তুনিষ্ঠ সংবাদের নির্ভরযোগ্য মাধ্যম।',
    siteName: 'কচুয়া প্রতিদিন',
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'কচুয়া প্রতিদিন | চাঁদপুর জেলার সর্বাধুনিক অনলাইন নিউজ পোর্টাল',
    description: 'কচুয়া প্রতিদিন চাঁদপুর জেলার কচুয়া উপজেলার স্থানীয় খবর, রাজনীতি, সমাজ, খেলাধুলা ও বস্তুনিষ্ঠ সংবাদের নির্ভরযোগ্য মাধ্যম।',
  }
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="bn" className={`${inter.variable} ${bangla.variable} ${banglaSerif.variable}`}>
      <body className="bg-white text-gray-900 font-bangla antialiased selection:bg-red-200 selection:text-black min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
