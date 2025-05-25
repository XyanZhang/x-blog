import type { Metadata } from 'next';
import type { FC, PropsWithChildren } from 'react';

import { Header } from '../_components/header';
import $styles from './layout.module.css';
export const metadata: Metadata = {
    title: 'pincman的博客',
    description:
        'pincman的个人博客,提供一些ts、react、node.js、php、golang相关的技术文档以及分享一些生活琐事',
};

const AppLayout: FC<PropsWithChildren> = ({ children }) => (
    <div className={$styles.layout}>
        <Header />
        {children}
    </div>
);
export default AppLayout;
