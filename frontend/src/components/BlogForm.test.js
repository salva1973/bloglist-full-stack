import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

describe('<Blog />', () => {
  test('The form calls the event handler when a new blog is created', async () => {
    // Initialization
    let input
    const createBlog = jest.fn()
    const container = render(<BlogForm createBlog={createBlog} />).container
    const user = userEvent.setup()
    const createButton = screen.getByText('Create')

    // Form preparation
    input = container.querySelector('#title')
    await user.type(input, 'React is cool')

    input = container.querySelector('#author')
    await user.type(input, 'Salvatore Vivolo')

    input = container.querySelector('#url')
    await user.type(input, 'https://www.react.com/1176')

    // Clicking the 'Create' button
    await user.click(createButton)

    // Checking the outcome
    expect(createBlog.mock.calls).toHaveLength(1)
    expect(createBlog.mock.calls[0][0].title).toBe('React is cool')
    expect(createBlog.mock.calls[0][0].author).toBe('Salvatore Vivolo')
    expect(createBlog.mock.calls[0][0].url).toBe('https://www.react.com/1176')
  })
})
