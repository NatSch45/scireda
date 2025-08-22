import { describe, it, expect, vi } from 'vitest'
import { render } from '../test-utils'
import { HomePage } from '../../src/pages/HomePage'

// Mock the auth store to avoid needing real authentication
vi.mock('../../src/app/store', () => ({
  useAuthStore: vi.fn((selector) => {
    const mockState = {
      token: null,
      user: null,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    }
    return selector(mockState)
  })
}))

describe('HomePage', () => {
  it('renders title', () => {
    const { getByText } = render(<HomePage />)
    expect(getByText(/Bienvenue/)).toBeInTheDocument()
  })
})


