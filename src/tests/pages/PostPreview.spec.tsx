import { render, screen } from "@testing-library/react"
import { mocked } from "jest-mock"
import { getPrismicClient } from "../../services/prismic"
import Post, { getStaticProps } from "../../pages/posts/preview/[slug]"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

jest.mock("../../services/prismic")
jest.mock("next-auth/client")
jest.mock("next/router")

const post = {
  slug: "my-new-post",
  title: "My new post",
  excerpt: "Post excerpt",
  updatedAt: "10 de Abril",
  content: "<p>Content</p>",
}

describe("Post page", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce({
      data: null,
      status: "unauthenticated",
    })
    render(<Post post={post} />)

    expect(screen.getByText("My new post")).toBeInTheDocument()
    expect(screen.getByText("Content")).toBeInTheDocument()
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument()
  })

  it("redirects user to full post when user is subscribed", async () => {
    const useSessionMocked = mocked(useSession)
    const useRouterMocked = mocked(useRouter)

    const pushMock = jest.fn()

    useRouterMocked.mockReturnValueOnce({
      push: pushMock
    } as any)

    useSessionMocked.mockReturnValueOnce([
      {
        activeSubscription: "fake-active-subscription",
      },
      false,
    ] as any)

    render(<Post post={post} />)

    expect(pushMock).toHaveBeenCalledWith("/posts/my-new-post")
  })

  it("loads initial data", async () => {
    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "My new post" }],
          content: [{ type: "paragraph", text: "Post content" }],
        },
        last_publication_date: "04-01-2021",
      }),
    } as any)

    const response = await getStaticProps({params: { slug: 'my-new-post' } })

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
