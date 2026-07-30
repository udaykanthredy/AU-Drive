import type { Metadata } from 'next';
import { Jost } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const jost = Jost({ subsets: ['latin'], variable: '--font-jost' });

export const metadata: Metadata = {
  title: 'EchoDrive — Premium File Storage',
  description: 'Intelligent file organization and insights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jost.variable} font-sans bg-neo-bg text-black antialiased selection:bg-brand-500/30 selection:text-black`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
