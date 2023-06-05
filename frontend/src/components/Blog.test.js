import React from 'react'
import '@testing-library/jest-dom/extend-expect'
// import { render, screen } from '@testing-library/react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  let container
  let blog
  const mockHandler = jest.fn()

  beforeEach(() => {
    const authUser = {
      username: 'Salva',
      name: 'Salvatore Vivolo',
    }

    blog = {
      title: 'React is cool',
      author: 'Salvatore Vivolo',
      url: 'https://www.react.com/1176',
      likes: 0,
      user: authUser,
    }

    container = render(
      <Blog
        blog={blog}
        user={authUser}
        onLike={mockHandler}
        onRemove={() => console.log('Remove')}
      />
    ).container
  })

  test('Renders title and author, but not url, likes and username', () => {
    let div
    // screen.debug()

    div = container.querySelector('.blog-title')
    expect(div).toHaveTextContent('React is cool')

    div = container.querySelector('.blog-author')
    expect(div).toHaveTextContent('Salvatore Vivolo')

    div = container.querySelector('.blog-url')
    expect(div).toBeNull()

    div = container.querySelector('.blog-likes')
    expect(div).toBeNull()

    div = container.querySelector('.blog-username')
    expect(div).toBeNull()
  })

  test('Renders url, likes and username when the View button is clicked', async () => {
    const user = userEvent.setup()

    const showButton = container.querySelector('.blog-view-button')
    await user.click(showButton)

    let div = container.querySelector('.blog-url')
    expect(div).toHaveTextContent('https://www.react.com/1176')

    div = container.querySelector('.blog-likes')
    expect(div).toHaveTextContent(blog.likes.toString())

    div = container.querySelector('.blog-username')
    expect(div).toHaveTextContent('Salvatore Vivolo')
  })

  test('When Like button is clicked twice, the event handler is called twice', async () => {
    const user = userEvent.setup()

    const showButton = container.querySelector('.blog-view-button')
    await user.click(showButton)

    const likeButton = container.querySelector('.blog-like-button')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockHandler.mock.calls).toHaveLength(2)
  })
})
