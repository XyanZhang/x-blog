// src/app/(pages)/page.tsx
import { FC } from 'react';

import $styles from './page.module.css';

const App: FC = () => (
    <main className={$styles.container}>
        <div className={$styles.block}>
            欢迎来到3R教室，这是<span>Nextjs课程的开始</span>
        </div>
    </main>
);
export default App;