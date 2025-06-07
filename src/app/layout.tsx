import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

import type { FC, PropsWithChildren } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        default: 'Z~Blog',
        template: '%s | Z~Blog'
    },
    description: '分享技术知识，记录生活点滴的个人博客',
    keywords: ['博客', '技术', '编程', 'Next.js', 'React', 'TypeScript'],
    authors: [{ name: '博客管理员' }],
    creator: '博客管理员',
    openGraph: {
        type: 'website',
        locale: 'zh_CN',
        url: 'https://yourblog.com',
        title: 'Z~Blog',
        description: '分享技术知识，记录生活点滴的个人博客',
        siteName: 'Z~Blog',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Z~Blog',
        description: '分享技术知识，记录生活点滴的个人博客',
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
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <html lang="zh-CN" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
            <AuthProvider>
                {children}
            </AuthProvider>
        </body>
    </html>
);

export default RootLayout;
