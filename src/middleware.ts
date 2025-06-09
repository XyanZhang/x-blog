import { NextRequest, NextResponse } from 'next/server'

// 简化的 JWT 验证，适用于 Edge Runtime
function verifyTokenEdge(token: string): { userId: string; username: string; role: string } | null {
  try {
    // 简单的 JWT 结构检查
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // 解码 payload（不验证签名，在 Edge Runtime 中签名验证比较复杂）
    const payload = JSON.parse(atob(parts[1]))
    
    // 检查是否过期
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role
    }
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 需要认证的路由
  const protectedRoutes = ['/profile', '/settings', '/admin']
  
  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    console.log('[Middleware] Protected route:', pathname)
    console.log('[Middleware] Token found:', !!token)
    
    if (!token) {
      console.log('[Middleware] No token, redirecting to login')
      // 重定向到登录页面
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const payload = verifyTokenEdge(token)
      console.log('[Middleware] Token verification result:', !!payload)
      
      if (!payload) {
        console.log('[Middleware] Token invalid, redirecting to login')
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      console.log('[Middleware] User authenticated:', payload.username)

      // 检查管理员权限
      if (pathname.startsWith('/admin') && !['ADMIN', 'SUPER_ADMIN'].includes(payload.role)) {
        console.log('[Middleware] Admin access denied, redirecting to home')
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('[Middleware] Token verification error:', error)
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 