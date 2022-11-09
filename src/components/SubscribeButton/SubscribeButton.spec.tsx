import { fireEvent, render, screen } from '@testing-library/react'
import { signIn, useSession } from 'next-auth/client'
import { mocked } from 'jest-mock'
import { useRouter } from 'next/router'
import { SubscribeButton } from '.'

jest.mock('next-auth/client')
jest.mock('next/router')

describe('SubscribeButton component', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession)
    useSessionMocked.mockReturnValueOnce([null, false])

    render(<SubscribeButton />)

    expect(screen.getByText('Subscribe now')).toBeInTheDocument()
  })

  it('redirects user to sign in when not authenticated', () => {
    const useSessionMocked = mocked(useSession)
    const signInMocked = mocked(signIn)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(signInMocked).toHaveBeenCalled()
  })

  it('redirects user to posts when user already has a subscription', () => {
    const useRouterMocked = mocked(useRouter)
    const useSessionMocked = mocked(useSession)
    const pushMock = jest.fn()

    // Mocking functions
    useSessionMocked.mockReturnValueOnce([
      {
        user: {
          name: 'Nicholas Costa',
          email: 'nicholascostadev@gmail.com',
        },
        activeSubscription: 'fake-active-subscription',
        expires: 'fake-expires',
      },
      false,
    ])

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any)

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now')

    fireEvent.click(subscribeButton)

    expect(pushMock).toHaveBeenCalledWith('/posts')
  })
})
