// src/app/_components/header/logo.tsx
import Link from 'next/link';

export const HeaderLogo = () => (
    <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
        我的博客
    </Link>
);