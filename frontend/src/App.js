import { useState, useEffect, useRef } from 'react'
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
  const [likeUpdateTrigger, setLikeUpdateTrigger] = useState(false)

  const blogFormRef = useRef()

  const fetchBlogs = async () => {
    try {
      const fetchedBlogs = await blogService.getAll()
      fetchedBlogs.sort((a, b) => b.likes - a.likes)
      setBlogs(fetchedBlogs)
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

  useEffect(() => {
    fetchBlogs()
    // eslint-disable-next-line
  }, [blogs.length, likeUpdateTrigger])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async ({ username, password }) => {
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
      blogFormRef.current.toggleVisibility()
      setInfoMessage({
        message: `A new blog ${blogObject.title} by ${blogObject.author} added`,
        type: 'info',
      })
      setTimeout(() => {
        setInfoMessage(emptyMessage)
      }, 5000)
    } catch (error) {
      if (error.response.data.error === 'token expired') {
        window.localStorage.removeItem('loggedBlogappUser')
        setUser(null)
        setInfoMessage({
          message: 'Authentication expired. Please login again.',
          type: 'error',
        })
        setTimeout(() => {
          setInfoMessage(emptyMessage)
        }, 5000)
      } else {
        setInfoMessage({
          message: 'Please provide the title, author and url',
          type: 'error',
        })
        setTimeout(() => {
          setInfoMessage(emptyMessage)
        }, 5000)
      }
    }
  }

  const handleLike = async (blog) => {
    try {
      const updatedBlog = {
        user: blog.user.id,
        likes: blog.likes + 1,
        author: blog.author,
        title: blog.title,
        url: blog.url,
      }
      await blogService.update(blog.id, updatedBlog)
      const updatedBlogs = blogs.filter((blog) => blog.id !== updatedBlog.id)
      updatedBlogs.concat(updatedBlog)
      setBlogs(updatedBlogs)
      setLikeUpdateTrigger(!likeUpdateTrigger) // Toggle the trigger
      setInfoMessage({
        message: 'Blog updated.',
        type: 'info',
      })
      setTimeout(() => {
        setInfoMessage(emptyMessage)
      }, 5000)
    } catch (error) {
      if (error.response.data.error === 'token expired') {
        window.localStorage.removeItem('loggedBlogappUser')
        setUser(null)
        setInfoMessage({
          message: 'Authentication expired. Please login again.',
          type: 'error',
        })
        setTimeout(() => {
          setInfoMessage(emptyMessage)
        }, 5000)
      } else if (error.response.data.error === 'token invalid') {
        setInfoMessage({
          message:
            "You didn't create this blog and therefore you cannot modify it.",
          type: 'error',
        })
        setTimeout(() => {
          setInfoMessage(emptyMessage)
        }, 5000)
      }
    }
  }

  const handleRemove = async (blogToRemove) => {
    if (window.confirm('Do you really want to remove the blog?')) {
      try {
        await blogService.remove(blogToRemove.id)
        const updatedBlogs = blogs.filter((blog) => blog.id !== blogToRemove.id)
        setBlogs(updatedBlogs)
        setInfoMessage({
          message: 'Blog removed.',
          type: 'info',
        })
        setTimeout(() => {
          setInfoMessage(emptyMessage)
        }, 5000)
      } catch (error) {
        if (error.response.data.error === 'token expired') {
          window.localStorage.removeItem('loggedBlogappUser')
          setUser(null)
          setInfoMessage({
            message: 'Authentication expired. Please login again.',
            type: 'error',
          })
          setTimeout(() => {
            setInfoMessage(emptyMessage)
          }, 5000)
        } else if (error.response.data.error === 'token invalid') {
          setInfoMessage({
            message:
              "You didn't create this blog and therefore you cannot delete it.",
            type: 'error',
          })
          setTimeout(() => {
            setInfoMessage(emptyMessage)
          }, 5000)
        }
      }
    }
  }

  return (
    <div>
      <h1>Blog app</h1>
      <Notification message={infoMessage.message} type={infoMessage.type} />

      {!user && (
        // <Togglable buttonLabel="Login">
        <LoginForm login={handleLogin} />
        // </Togglable>
      )}

      {user && (
        <div>
          <span>{user.name} logged in </span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
          <br />
          <br />
          <br />
          <Togglable buttonLabel="New blog" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
          </Togglable>
          <h2>Blogs</h2>
          {blogs.map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              user={user}
              onLike={handleLike}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default App
