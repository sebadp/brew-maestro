import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Metadata } from 'next';
import './globals.css';
import { createMetadata } from '@/lib/seo';
import { ThemeProvider } from '@/components/ThemeProvider';
import SkipLink from '@/components/SkipLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReferralBanner from '@/components/ReferralBanner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = createMetadata();

const themeScript = `(() => {
  const storageKey = 'brewmaestro-theme';
  try {
    const stored = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light';
    document.documentElement.dataset.theme = resolved;
  } catch (error) {
    document.documentElement.dataset.theme = 'light';
  }
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${inter.variable} ${jetbrains.variable} bg-background text-foreground antialiased`}
      >
        <SkipLink />
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <ReferralBanner />
            <Header />
            <main id="content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
