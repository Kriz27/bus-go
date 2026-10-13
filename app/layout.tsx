import type { Metadata, Viewport } from 'next';
import { Montserrat, Noto_Sans, Roboto } from 'next/font/google';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});
const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans',
});
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto-sans',
});

export const metadata: Metadata = {
  title: 'RailOne',
  description: 'Plan journeys and manage your train bookings with RailOne.',
  generator: 'v0.app',
  manifest: '/bus-go/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: '/bus-go/railone.png',
        type: 'image/png',
      },
    ],
    apple: '/bus-go/railone.png',
  },
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: 'hsl(0, 0%, 100%)',
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${notoSans.variable} ${roboto.variable}`}
    >
      <body className="antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
