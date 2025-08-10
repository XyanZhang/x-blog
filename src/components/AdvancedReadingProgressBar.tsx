'use client';

import { useEffect, useState } from 'react';

interface AdvancedReadingProgressBarProps {
  variant?: 'thin' | 'medium' | 'thick';
  showPercentage?: boolean;
  showGlow?: boolean;
  useGradient?: boolean;
  className?: string;
  onProgressChange?: (progress: number) => void;
}

export default function AdvancedReadingProgressBar({ 
  variant = 'medium',
  showPercentage = false,
  showGlow = true,
  useGradient = true,
  className = '',
  onProgressChange
}: AdvancedReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      const newProgress = Math.min(scrollPercent, 100);
      
      setProgress(newProgress);
      
      // 当滚动超过5%时显示进度条
      setIsVisible(newProgress > 5);
      
      // 调用回调函数
      if (onProgressChange) {
        onProgressChange(newProgress);
      }
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
  }, [onProgressChange]);

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

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed left-0 w-full z-40 transition-opacity duration-300 ${className}`}
      style={{ top: 'var(--header-height)' }}
    >
      <div 
        className={getProgressClasses()}
        style={{ 
          width: `${progress}%`,
          backgroundColor: useGradient ? undefined : 'hsl(var(--primary))'
        }}
      />
      
      {showPercentage && (
        <div className="absolute top-2 right-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-foreground/80 border border-border/50">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
} 