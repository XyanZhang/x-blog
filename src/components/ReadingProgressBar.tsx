'use client';

import { useEffect, useState } from 'react';

interface ReadingProgressBarProps {
  variant?: 'thin' | 'medium' | 'thick';
  showGlow?: boolean;
  useGradient?: boolean;
  className?: string;
}

export default function ReadingProgressBar({ 
  variant = 'medium',
  showGlow = true,
  useGradient = true,
  className = '' 
}: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(scrollPercent, 100));
    };

    // 初始更新
    updateProgress();

    // 添加事件监听器
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const getHeightClass = () => {
    switch (variant) {
      case 'thin': return 'progress-thin';
      case 'thick': return 'progress-thick';
      default: return 'progress-medium';
    }
  };

  const getProgressClasses = () => {
    const classes = [
      'h-full',
      'progress-smooth',
      getHeightClass()
    ];

    if (useGradient) {
      classes.push('reading-progress-bar');
    }

    if (showGlow) {
      classes.push('reading-progress-bar-glow');
    }

    return classes.join(' ');
  };

  return (
    <div 
      className={`fixed left-0 w-full z-40 ${className}`}
      style={{ top: 'var(--header-height)' }}
    >
      <div 
        className={getProgressClasses()}
        style={{ 
          width: `${progress}%`,
          backgroundColor: useGradient ? undefined : 'hsl(var(--primary))'
        }}
      />
    </div>
  );
} 