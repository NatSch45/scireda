import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { HomePage } from '../../src/pages/HomePage'

describe('HomePage', () => {
  it('renders title', () => {
    const { getByText } = render(<HomePage />)
    expect(getByText(/Bienvenue/)).toBeInTheDocument()
  })
})


