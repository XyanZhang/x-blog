import type { Metadata } from 'next';
import type { FC, PropsWithChildren } from 'react';

import { Header } from '../_components/header';

export const metadata: Metadata = {
    title: '我的博客',
    description: '分享技术知识，记录生活点滴的个人博客',
};

const AppLayout: FC<PropsWithChildren> = ({ children }) => (
    <div className="min-h-screen bg-gray-50">
        {/* <Header /> */}
        {children}
    </div>
);

export default AppLayout;
