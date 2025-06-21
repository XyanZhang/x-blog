'use client'

import React, { useState, useEffect } from 'react'

interface TypewriterTextProps {
  texts: string[]
  speed?: number
  delay?: number
  className?: string
  cursorClassName?: string
  loop?: boolean
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  texts,
  speed = 100,
  delay = 2000,
  className = '',
  cursorClassName = 'animate-blink',
  loop = true
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const currentText = texts[currentTextIndex]
    
    if (!isDeleting) {
      // 打字效果
      if (currentCharIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, currentCharIndex + 1))
          setCurrentCharIndex(currentCharIndex + 1)
        }, speed)
        return () => clearTimeout(timeout)
      } else {
        // 完成打字，等待后开始删除
        const timeout = setTimeout(() => {
          if (loop || currentTextIndex < texts.length - 1) {
            setIsDeleting(true)
          } else {
            // 如果是最后一个文本且不循环，则暂停
            setIsPaused(true)
          }
        }, delay)
        return () => clearTimeout(timeout)
      }
    } else {
      // 删除效果
      if (currentCharIndex > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, currentCharIndex - 1))
          setCurrentCharIndex(currentCharIndex - 1)
        }, speed / 2) // 删除速度稍快
        return () => clearTimeout(timeout)
      } else {
        // 完成删除，切换到下一个文本
        setIsDeleting(false)
        if (loop) {
          setCurrentTextIndex((currentTextIndex + 1) % texts.length)
        } else {
          setCurrentTextIndex(Math.min(currentTextIndex + 1, texts.length - 1))
        }
      }
    }
  }, [currentTextIndex, currentCharIndex, isDeleting, isPaused, texts, speed, delay, loop])

  return (
    <span className={className}>
      {displayText}
      <span 
        className={`inline-block w-1 h-full bg-gradient-to-b from-transparent via-current to-transparent ${cursorClassName}`}
        style={{ 
          marginLeft: '2px',
          borderRadius: '1px'
        }}
      ></span>
    </span>
  )
}

export default TypewriterText 