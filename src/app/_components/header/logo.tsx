// src/app/_components/header/logo.tsx
import Image from 'next/image';
import Link from 'next/link';

import Avatar from './avatar.svg';
import $styles from './logo.module.css';

export const HeaderLogo = () => (
    <Link href="/" className={$styles.link}>
        <Image
            src={Avatar}
            alt="avatar logo"
            style={{
                width: '20%',
                height: 'auto',
            }}
        />
    </Link>
);