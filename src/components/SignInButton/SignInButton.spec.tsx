import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { mocked } from 'jest-mock'
import { SignInButton } from '.'

jest.mock('next-auth/client')
const useSessionMocked = mocked(useSession)

describe('SignInButton component', () => {
  it('renders correctly when user is not authenticated', () => {
    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated"
    })

    render(<SignInButton />)

    expect(screen.getByText('Sign in with Github')).toBeInTheDocument()
  })

  it('renders correctly when user is authenticated', () => {
    useSessionMocked.mockReturnValueOnce({
      data: {
        user: { name: 'Nicholas Costa', email: 'nicholascostadev@gmail.com' },
        expires: 'fake-expires',
      },
      status: "authenticated"
    })

    render(<SignInButton />)

    expect(screen.getByText('Nicholas Costa')).toBeInTheDocument()
  })
})
