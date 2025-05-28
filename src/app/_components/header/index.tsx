// src/app/_components/header/index.tsx
import type { FC } from 'react';

import { HeaderLogo } from './logo';

export const Header: FC = () => (
    <header className="flex justify-center items-center pt-6 max-h-24 flex-auto">
        <HeaderLogo />
    </header>
);
