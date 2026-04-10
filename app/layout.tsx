import type {Metadata} from 'next';
import './globals.css';
import { Inter, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Agent Design System',
  description: 'Minimal, smart, and light local agent design system with high thinking capabilities.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("dark font-sans", inter.variable, jetbrainsMono.variable)}>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
