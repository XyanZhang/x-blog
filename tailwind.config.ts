// tailwind.config.ts

import type { Config } from 'tailwindcss';

export default {
    prefix: 'tw-',
    darkMode: ['selector', '[class~="dark"]'],
    content: ['./src/app/**/*.{ts,tsx}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                xs: '480px',
                sm: '576px',
                md: '768px',
                lg: '992px',
                xl: '1200px',
                '2xl': '1400px',
            },
        },
        extend: {
            // 自定义的新增样式必须在全全局和独立配置两个地方都放置
            boxShadow: {
                nysm: '0 0 2px 0 rgb(0 0 0 / 0.05)',
                ny: '0 0 3px 0 rgb(0 0 0 / 0.1), 0 0 2px - 1px rgb(0 0 0 / 0.1)',
                nymd: '0 0 6px -1px rgb(0 0 0 / 0.1), 0 0 4px -2px rgb(0 0 0 / 0.1)',
                nylg: '0 0 15px -3px rgb(0 0 0 / 0.1), 0 0 6px -4px rgb(0 0 0 / 0.1)',
                spread: '0 5px 40px rgb(0 0 0 / 0.1)',
            },
            // shadcn
            // ...
        },
    },
    plugins: [require('tailwindcss-animate')],
} satisfies Config;