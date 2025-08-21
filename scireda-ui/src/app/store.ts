import { create } from 'zustand'

type AuthState = {
  token: string | null
  user: { id: string; email: string; username: string } | null
  setAuth: (auth: { token: string; user: AuthState['user'] }) => void
  clearAuth: () => void
}

// Helper functions for localStorage with error handling
const getStoredToken = (): string | null => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  } catch {
    return null
  }
}

const getStoredUser = (): AuthState['user'] => {
  try {
    if (typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    }
    return null
  } catch {
    return null
  }
}

const setStoredToken = (token: string) => {
  try {
    localStorage.setItem('token', token)
  } catch {
    // Ignore localStorage errors
  }
}

const setStoredUser = (user: AuthState['user']) => {
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  } catch {
    // Ignore localStorage errors
  }
}

const clearStoredAuth = () => {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  } catch {
    // Ignore localStorage errors
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),
  user: getStoredUser(),
  setAuth: ({ token, user }) => {
    setStoredToken(token)
    setStoredUser(user)
    set({ token, user })
  },
  clearAuth: () => {
    clearStoredAuth()
    set({ token: null, user: null })
  },
}))


