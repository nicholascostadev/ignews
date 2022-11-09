import { render, screen } from "@testing-library/react"
import { getServerSideProps } from "../../pages/posts/[slug]"
import { mocked } from "jest-mock"
import { getPrismicClient } from "../../services/prismic"
import Post from "../../pages/posts/[slug]"
import { getSession } from "next-auth/client"

jest.mock("../../services/prismic")
jest.mock("next-auth/client")

const post = {
  slug: "my-new-post",
  title: "My new post",
  excerpt: "Post excerpt",
  updatedAt: "10 de Abril",
  content: "<p>Content</p>",
}

describe("Post page", () => {
  it("renders correctly", () => {
    render(<Post post={post} />)

    expect(screen.getByText("My new post")).toBeInTheDocument()
    expect(screen.getByText("Content")).toBeInTheDocument()
  })

  it("redirects user if no subscription is found", async () => {
    const getSessionMocked = mocked(getSession)

    getSessionMocked.mockReturnValueOnce(null)

    const response = await getServerSideProps({
      params: {
        slug: "my-new-post",
      },
    } as any)

    // you can log the response to see what it returns
    // console.log(response)
    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/posts/preview/my-new-post",
        }),
      })
    )
  })

  it("loads initial data", async () => {
    const getSessionMocked = mocked(getSession)
    const getPrismicClientMocked = mocked(getPrismicClient)

    getSessionMocked.mockReturnValueOnce({
      activeSubscription: "fake-active-subscription",
    } as any)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "My new post" }],
          content: [{ type: "paragraph", text: "Post content" }],
        },
        last_publication_date: "04-01-2021",
      }),
    } as any)

    const response = await getServerSideProps({
      params: {
        slug: "my-new-post",
      },
    } as any)

    // you can log the response to see what it returns
    // console.log(response)
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "my-new-post",
            title: "My new post",
            content: "<p>Post content</p>",
            updatedAt: "01 de abril de 2021",
          }
        }
      })
    )
  })
})
