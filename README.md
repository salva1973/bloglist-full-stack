# Bloglist Full Stack

## Tests examples

```sh
npm test -- -t "favoriteBlog"
```

## Tests

```sh
npm test -- tests/blog_api.test.js
npm test -- -t "a specific blog is within the returned blogs"
npm test -- -t 'blogs'
```

### Frontend Unit Testing

```sh
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event

npm test
CI=true npm test
CI=true npm test -- --coverage
```

```javascript
import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Note from './Note'
import Togglable from './Togglable'
import NoteForm from './NoteForm'

test('Test description...', async () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true,
  }

  // 1.
  render(<Note note={note} />)

  // screen.debug()
  // screen.debug(element)

  const element = screen.getByText(
    'Component testing is done with react-testing-library'
  )
  expect(element).toBeDefined()

  // 2.
  const { container } = render(<Note note={note} />)
  const div = container.querySelector('.note')
  expect(div).toHaveTextContent(
    'Component testing is done with react-testing-library'
  )

  // 3.
  const element = screen.getByTestId('custom-element')
  expect(element).toBeDefined()

  // 4.
  const mockHandler = jest.fn()
  render(<Note note={note} toggleImportance={mockHandler} />)
  const user = userEvent.setup()
  const button = screen.getByText('make not important')
  await user.click(button)
  expect(mockHandler.mock.calls).toHaveLength(1)

  // 5.
  describe('<Togglable />', () => {
    let container

    beforeEach(() => {
      container = render(
        <Togglable buttonLabel="show...">
          <div className="testDiv">togglable content</div>
        </Togglable>
      ).container
    })

    test('renders its children', async () => {
      await screen.findAllByText('togglable content')
    })

    test('at start the children are not displayed', () => {
      const div = container.querySelector('.togglableContent')
      expect(div).toHaveStyle('display: none')
    })

    test('after clicking the button, children are displayed', async () => {
      const user = userEvent.setup()
      const button = screen.getByText('show...')
      await user.click(button)

      const div = container.querySelector('.togglableContent')
      expect(div).not.toHaveStyle('display: none')
    })

    test('toggled content can be closed', async () => {
      const user = userEvent.setup()
      const button = screen.getByText('show...')
      await user.click(button)

      const closeButton = screen.getByText('cancel')
      await user.click(closeButton)

      const div = container.querySelector('.togglableContent')
      expect(div).toHaveStyle('display: none')
    })
  })

  // 6.
  test('<NoteForm /> updates parent state and calls onSubmit', async () => {
    const createNote = jest.fn()
    const user = userEvent.setup()

    render(<NoteForm createNote={createNote} />)

    const input = screen.getByRole('textbox')
    const sendButton = screen.getByText('save')

    await user.type(input, 'testing a form...')
    await user.click(sendButton)

    expect(createNote.mock.calls).toHaveLength(1)
    expect(createNote.mock.calls[0][0].content).toBe('testing a form...')
  })

  // const inputs = screen.getAllByRole('textbox')
  // await user.type(inputs[0], 'testing a form...')

  test('<NoteForm /> updates parent state and calls onSubmit', () => {
    const createNote = jest.fn()

    render(<NoteForm createNote={createNote} />)

    const input = screen.getByPlaceholderText('write note content here')
    const sendButton = screen.getByText('save')

    userEvent.type(input, 'testing a form...')
    userEvent.click(sendButton)

    expect(createNote.mock.calls).toHaveLength(1)
    expect(createNote.mock.calls[0][0].content).toBe('testing a form...')
  })

  // const { container } = render(<NoteForm createNote={createNote} />)
  // const input = container.querySelector('#note-input')

  // const element = screen.getByText('Does not work anymore :(', { exact: false })

  // const element = await screen.findByText('Does not work anymore :(')

  test('does not render this', () => {
    const note = {
      content: 'This is a reminder',
      important: true,
    }

    render(<Note note={note} />)

    const element = screen.queryByText('do not want this thing to be rendered')
    expect(element).toBeNull()
  })
})
```

### Frontend End-To-End Testing

[https://docs.cypress.io/guides/core-concepts/introduction-to-cypress#Cypress-Can-Be-Simple-Sometimes]

```sh
npm uninstall cypress
rm -rf /Users/(whoami)/Library/Caches/Cypress/
npm cache --force clean

npm install --save-dev cypress
npm install eslint-plugin-cypress --save-dev
npm run cypress:open
```

## Authentication

The other solution is to save info about each token to backend database and to check for each API request if the access right corresponding to the token is still valid. With this scheme, access rights can be revoked at any time. This kind of solution is often called a server-side session.

The negative aspect of server-side sessions is the increased complexity in the backend and also the effect on performance since the token validity needs to be checked for each API request to the database. A database access is considerably slower compared to checking the validity of the token itself. That is why it is quite common to save the session corresponding to a token to a key-value database such as Redis that is limited in functionality compared to eg. MongoDB or relational database but extremely fast in some usage scenarios.

When server-side sessions are used, the token is quite often just a random string, that does not include any information about the user as it is quite often the case when jwt-tokens are used. For each API request, the server fetches the relevant information about the identity of the user from the database. It is also quite usual that instead of using Authorization-header, cookies are used as the mechanism for transferring the token between the client and the server.
