// src/app/_components/header/index.tsx
'use client'

import type { FC } from 'react';
import Link from 'next/link';
import { useState } from 'react';

import UserNav from '@/components/auth/user-nav';
import { NavLink } from './nav-link';

export const Header: FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* 左侧：博客标题和导航菜单 */}
                    <div className="flex items-center space-x-8">
                        {/* 博客标题 */}
                        <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                            Z~Blog
                        </Link>
                        
                        {/* 桌面端导航菜单 */}
                        <nav className="hidden md:flex items-center space-x-6">
                            <NavLink href="/">首页</NavLink>
                            <NavLink href="/posts">文章</NavLink>
                            <NavLink href="/photos">摄影</NavLink>
                            <NavLink href="/albums">图册</NavLink>
                            <NavLink href="/categories">分类</NavLink>
                            <NavLink href="/tags">标签</NavLink>
                            <NavLink href="/about">关于</NavLink>
                        </nav>
                    </div>

                    {/* 右侧：移动端菜单按钮和用户导航 */}
                    <div className="flex items-center space-x-4">
                        {/* 用户导航 */}
                        {/* <UserNav /> */}
                        
                        {/* 移动端菜单按钮 */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">打开主菜单</span>
                            {/* 汉堡菜单图标 */}
                            <svg
                                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {/* 关闭图标 */}
                            <svg
                                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* 移动端导航菜单 */}
            <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} border-t border-gray-200`}>
                <div className="px-4 py-3 space-y-1">
                    <NavLink 
                        href="/" 
                        className="block"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        首页
                    </NavLink>
                    <NavLink 
                        href="/posts" 
                        className="block"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        文章
                    </NavLink>
                    <NavLink 
                        href="/photos" 
                        className="block"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        摄影
                    </NavLink>
                    <NavLink 
                        href="/albums" 
                        className="block"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        图册
                    </NavLink>
                    <NavLink 
                        href="/categories" 
                        className="block"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        分类
                    </NavLink>
                    <NavLink 
                        href="/tags" 
                        className="block"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        标签
                    </NavLink>
                    <NavLink 
                        href="/about" 
                        className="block"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        关于
                    </NavLink>
                </div>
            </div>
        </header>
    );
};
