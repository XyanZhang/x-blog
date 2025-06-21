'use client'

import React, { useState, useEffect } from 'react'

interface TypewriterTextProps {
  texts: string[]
  speed?: number
  delay?: number
  className?: string
  cursorClassName?: string
  loop?: boolean
  groupSize?: number
  separator?: string
  maxWidth?: string
}

function groupArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  texts,
  speed = 100,
  delay = 2000,
  className = '',
  cursorClassName = 'animate-blink',
  loop = true,
  groupSize = 1,
  separator = ' · ',
  maxWidth = 'max-w-4xl'
}) => {
  // 分组
  const groups = groupArray(texts, groupSize).map(group => group.join(separator))

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const currentText = groups[currentGroupIndex]
    
    // 只实现打字效果，不删除
    if (currentCharIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(currentText.slice(0, currentCharIndex + 1))
        setCurrentCharIndex(currentCharIndex + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      // 完成打字，等待后切换到下一个分组
      const timeout = setTimeout(() => {
        if (loop || currentGroupIndex < groups.length - 1) {
          setCurrentGroupIndex((currentGroupIndex + 1) % groups.length)
          setCurrentCharIndex(0)
          setDisplayText('')
        } else {
          setIsPaused(true)
        }
      }, delay)
      return () => clearTimeout(timeout)
    }
  }, [currentGroupIndex, currentCharIndex, isPaused, groups, speed, delay, loop])

  return (
    <div className={`${maxWidth} mx-auto text-center`}>
      <span 
        className={`${className} inline-block`}
        style={{ 
          minHeight: '1.2em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {displayText}
        <span 
          className={`inline-block w-1 h-full bg-gradient-to-b from-transparent via-current to-transparent ${cursorClassName}`}
          style={{ 
            marginLeft: '2px',
            borderRadius: '1px'
          }}
        ></span>
      </span>
    </div>
  )
}

export default TypewriterText 