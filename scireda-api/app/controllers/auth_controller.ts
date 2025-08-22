import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const registerSchema = vine.object({
      email: vine.string().email(),
      username: vine.string().minLength(3),
      password: vine
        .string()
        .minLength(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
    })

    try {
      const data = await vine.validate({ schema: registerSchema, data: request.all() })

      const existingUser = await User.query()
        .where('email', data.email)
        .orWhere('username', data.username)
        .first()

      if (existingUser) {
        return response.badRequest()
      }

      const user = await User.create({
        email: data.email,
        username: data.username,
        password: data.password,
      })

      const token = await User.accessTokens.create(user, ['*'], { expiresIn: '1d' })
      const tokenValue = token.value!.release()

      return response.created({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token: tokenValue,
      })
    } catch (error) {
      console.error('Registration error:', error)
      return response.internalServerError()
    }
  }

  async login({ request, response }: HttpContext) {
    const loginSchema = vine.object({
      email: vine.string().email(),
      password: vine.string().minLength(8),
    })

    try {
      const data = await vine.validate({ schema: loginSchema, data: request.all() })

      const user = await User.findBy('email', data.email)

      if (!user || !(await user.verifyPassword(data.password))) {
        return response.unauthorized()
      }

      const token = await User.accessTokens.create(user, ['*'], { expiresIn: '1d' })
      const tokenValue = token.value!.release()

      return response.ok({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token: tokenValue,
      })
    } catch (error) {
      console.error('Login error:', error)
      return response.internalServerError()
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()

      // Delete all access tokens for the user
      const tokens = await User.accessTokens.all(user)
      for (const token of tokens) {
        await User.accessTokens.delete(user, token.identifier)
      }
    } catch (error) {
      console.error('Logout error:', error)
      return response.internalServerError()
    }
  }

  async me({ auth, response }: HttpContext) {
    try {
      const user = await auth.authenticate()
      return response.ok({
        id: user.id,
        email: user.email,
        username: user.username,
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      return response.internalServerError()
    }
  }
}
