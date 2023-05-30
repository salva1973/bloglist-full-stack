import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const emptyMessage = { message: '', type: '' }

  const [blogs, setBlogs] = useState([])
  const [infoMessage, setInfoMessage] = useState(emptyMessage)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await blogService.getAll()
        setBlogs(blogs)
      } catch (error) {
        setInfoMessage({
          message: 'An error occurred while trying to fetch the blogs',
          type: 'error',
        })
        setTimeout(() => {
          setInfoMessage(emptyMessage)
        }, 5000)
      }
    }

    fetchBlogs()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async ({username, password}) => {    
    try {
      const user = await loginService.login({
        username,
        password,
      })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)            
    } catch (exception) {
      setInfoMessage({ message: 'Wrong credentials', type: 'error' })
      setTimeout(() => {
        setInfoMessage(emptyMessage)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      setInfoMessage({
        message: `A new blog ${blogObject.title} by ${blogObject.author} added`,
        type: 'info',
      })
      setTimeout(() => {
        setInfoMessage(emptyMessage)
      }, 5000)
    } catch (error) {
      setInfoMessage({
        message: 'Please provide the title, author and url',
        type: 'error',
      })
      setTimeout(() => {
        setInfoMessage(emptyMessage)
      }, 5000)
    }
  }

  return (
    <div>
      <h1>Blog app</h1>
      <Notification message={infoMessage.message} type={infoMessage.type} />

      {!user && (
        <Togglable buttonLabel="Login">
          <LoginForm login={handleLogin} />
        </Togglable>
      )}

      {user && (
        <div>
          <span>{user.name} logged in </span>
          <button onClick={handleLogout}>Logout</button>
          <Togglable buttonLabel="New blog">
            <BlogForm createBlog={addBlog} />
          </Togglable>
          <br />
          <br />
          <h2>Blogs</h2>
          {blogs.map((blog) => (
            <Blog key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  )
}

export default App
