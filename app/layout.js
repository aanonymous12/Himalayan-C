import './globals.css';
import { Cormorant_Garamond, Figtree } from 'next/font/google';
import { CartProvider } from '@/components/CartProvider';

const display = Cormorant_Garamond({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--font-display', display: 'swap' });
const body = Figtree({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(site),
  title: { default: 'Himalayan Nepalese & Indian Cuisine | Restaurant in San Marcos, TX', template: '%s | Himalayan San Marcos' },
  description: 'Nepali and Indian restaurant at 115 Wonder World Drive, San Marcos, TX. Momos, curries, biryani and fresh tandoor naan. Eat in or order online for pickup.',
  openGraph: { type: 'website', siteName: 'Himalayan Nepalese & Indian Cuisine', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#2b1810', colorScheme: 'light' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body><CartProvider>{children}</CartProvider></body>
    </html>
  );
}
