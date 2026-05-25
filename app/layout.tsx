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
  metadataBase: new URL('https://kachuaprotidin.com'),
  title: {
    default: 'কচুয়া প্রতিদিন | বাগেরহাট জেলার সর্বাধুনিক অনলাইন নিউজ পোর্টাল',
    template: '%s | কচুয়া প্রতিদিন'
  },
  description: 'কচুয়া প্রতিদিন (Kachua Protidin) বাগেরহাট জেলার সর্বাধুনিক ও সর্বপ্রথম অনলাইন নিউজ পোর্টাল। কচুয়া উপজেলার স্থানীয় খবর, রাজনীতি, সমাজ, খেলাধুলা, শিক্ষা ও ঐতিহ্যবাহী বাগেরহাটের বস্তুনিষ্ঠ খবরের নির্ভরযোগ্য মুখপত্র।',
  keywords: [
    'কচুয়া প্রতিদিন', 'Kachua Protidin', 'কচুয়া নিউজ', 'বাগেরহাট খবর', 'কচুয়া বাগেরহাট সংবাদ', 
    'Bagerhat News', 'Kachua News Portal', 'বাগেরহাট জেলার খবর', 'বাগেরহাট ব্রেকিং নিউজ', 
    'বাংলাদেশ খবর', 'Prothom Alo Scraper BD', 'সর্বশেষ বাংলা খবর', 'অনলাইন খবর বাগেরহাট'
  ],
  authors: [{ name: 'কচুয়া প্রতিদিন বার্তা কক্ষ' }],
  creator: 'কচুয়া প্রতিদিন টেকনিক্যাল টিম',
  publisher: 'কচুয়া প্রতিদিন',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'কচুয়া প্রতিদিন | বাগেরহাট জেলার সর্বাধুনিক অনলাইন নিউজ পোর্টাল',
    description: 'বাগেরহাট জেলার কচুয়া উপজেলার স্থানীয় খবর, রাজনীতি, সমাজ, খেলাধুলা ও বস্তুনিষ্ঠ সংবাদের নির্ভরযোগ্য ও বিশ্বস্ত মুখপত্র।',
    siteName: 'কচুয়া প্রতিদিন',
    locale: 'bn_BD',
    type: 'website',
    url: 'https://kachuaprotidin.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'কচুয়া প্রতিদিন | বাগেরহাট জেলার সর্বাধুনিক অনলাইন নিউজ পোর্টাল',
    description: 'বাগেরহাট জেলার কচুয়া উপজেলার স্থানীয় খবর, রাজনীতি, সমাজ, খেলাধুলা ও বস্তুনিষ্ঠ সংবাদের নির্ভরযোগ্য ও বিশ্বস্ত মুখপত্র।',
    creator: '@kachuaprotidin',
  },
  verification: {
    google: 'google-site-verification-placeholder-token-2026',
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
