import { render, screen } from '@testing-library/react'
import { stripe } from '../../services/stripe'
import Home, { getStaticProps } from '../../pages'
import { mocked } from 'jest-mock'

jest.mock('../../services/stripe')
jest.mock('next/router')
jest.mock('next-auth/client', () => {
  return {
    useSession() {
      return [null, false]
    }
  }
})

describe('Home page', () => {
  it('renders correctly', () => {
    render(<Home product={{ priceId: 'fake-price-id', amount: 'R$10,00' }} />)

    expect(screen.getByText("for R$10,00 month")).toBeInTheDocument()
  })
  
  it('loads initial data', async () => {
    const retrievePricesMocked = mocked(stripe.prices.retrieve)

    retrievePricesMocked.mockResolvedValueOnce({
      id: 'fake-price-id',
      unit_amount: 1000,
    } as any)

    const response = await getStaticProps({})

    // you can log the response to see what it returns
    // console.log(response)
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake-price-id',
            amount: '$10.00',
          }
        }
      })
    )
  })
})