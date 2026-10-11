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
  title: 'BusGo - Bus Tickets',
  description: 'Plan journeys and manage your bus bookings with BusGo.',
  generator: 'v0.app',
  manifest: '/bus-go/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: '/bus-go/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/bus-go/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/bus-go/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/bus-go/apple-icon.png',
  },
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2563eb',
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
