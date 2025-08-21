import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SecurityHeadersMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { response } = ctx

    // Security headers
    response.header('X-Content-Type-Options', 'nosniff')
    response.header('X-Frame-Options', 'DENY')
    response.header('X-XSS-Protection', '1; mode=block')
    response.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    
    // Content Security Policy (ajustez selon vos besoins)
    response.header('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self'; " +
      "font-src 'self'; " +
      "object-src 'none'; " +
      "media-src 'self'; " +
      "frame-src 'none';"
    )

    await next()
  }
}
