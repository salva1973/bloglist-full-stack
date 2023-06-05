import { useState } from 'react'

import './BlogForm.css'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title,
      author,
      url,
    })

    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div className="formDiv">
      <h2>Create a new blog</h2>

      <div className="form-container">
        <form onSubmit={addBlog}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              value={title}
              id="title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Write the blog title here"
            />
          </div>
          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              type="text"
              value={author}
              id="author"
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Write the blog author here"
            />
          </div>
          <div className="form-group">
            <label htmlFor="url">URL</label>
            <input
              type="text"
              value={url}
              id="url"
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Write the blog url here"
            />
          </div>

          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  )
}

export default BlogForm
