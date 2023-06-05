import { useState } from 'react'

import './Blog.css'

const Blog = ({ blog, user, onLike, onRemove }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  return (
    <div className="blog-container">
      <div className="blog-title">{blog.title}</div>
      <div className="blog-author"> {blog.author}</div>
      <button
        className={`blog-button ${visible ? 'blog-hide-button' : 'blog-view-button'}`}
        onClick={toggleVisibility}
      >
        {visible ? 'Hide' : 'View'}
      </button>
      {visible && (
        <div>
          <div className="blog-url">{blog.url}</div>
          <div className="blog-likes">
            Likes <div className="blog-likes-value">{blog.likes}</div>
          </div>
          <button
            className="blog-button blog-like-button"
            onClick={() => onLike(blog)}
          >
            Like
          </button>
          <br />
          <div className="blog-username">{blog.user.name}</div>
          {blog.user.username === user.username && (
            <button className="blog-delete-button" onClick={() => onRemove(blog)}>Delete</button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog
