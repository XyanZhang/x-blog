'use client'

import { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Settings, LogOut, Edit3, Image, Users } from 'lucide-react'

interface User {
  id: string
  username: string
  displayName?: string | null
  avatar?: string | null
  role: string
}

const UserNav: FC = () => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          const userData = data.user || data
          if (userData && userData.id) {
            setUser(userData)
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      if (response.ok) {
        setUser(null)
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const getDisplayName = () => {
    return user?.displayName || user?.username || '用户'
  }

  const getAvatarLetter = () => {
    const displayName = user?.displayName
    const username = user?.username
    if (displayName && displayName.length > 0) {
      return displayName.charAt(0).toUpperCase()
    }
    if (username && username.length > 0) {
      return username.charAt(0).toUpperCase()
    }
    return 'U'
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/auth/login"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          登录
        </Link>
        <Link
          href="/auth/register"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          注册
        </Link>
      </div>
    )
  }

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role)

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.avatar ? (
            <img
              src={user.avatar || '/api/avatar'}
              alt={user.displayName || '用户头像'}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            getAvatarLetter()
          )}
        </div>
        <span className="hidden sm:block text-sm font-medium">
          {getDisplayName()}
        </span>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {getDisplayName()}
            </p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <User className="h-4 w-4 mr-3" />
              个人资料
            </Link>

            {isAdmin && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <div className="px-3 py-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">管理</p>
                </div>
                <Link
                  href="/admin/posts"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Edit3 className="h-4 w-4 mr-3" />
                  文章管理
                </Link>
                <Link
                  href="/admin/photos"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Image className="h-4 w-4 mr-3" />
                  照片管理
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Users className="h-4 w-4 mr-3" />
                  用户管理
                </Link>
              </>
            )}

            <div className="border-t border-gray-100 my-1"></div>
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Settings className="h-4 w-4 mr-3" />
              设置
            </Link>
            <button
              onClick={() => {
                handleLogout()
                setIsDropdownOpen(false)
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserNav 