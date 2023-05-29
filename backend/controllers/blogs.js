const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user

  if (!user) {
    response.status(401).json({ error: 'token not provided' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.statusMessage = 'Page Not Found. The force is weak with this one!'
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const user = request.user

  if (!blog) {
    response.status(404).json({ error: 'blog not found' })
  }

  if (!user) {
    response.status(401).json({ error: 'token not provided' })
  }

  if (blog.user.toString() === user._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'token invalid' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = await Blog.findById(request.params.id)
  const user = request.user

  if (!blog) {
    response.status(404).json({ error: 'blog not found' })
  }

  if (!user) {
    response.status(401).json({ error: 'token not provided' })
  }

  if (blog.user.toString() === user._id.toString()) {
    const updatedBlog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
    }

    const returnedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      updatedBlog,
      {
        new: true,
      }
    )
    response.json(returnedBlog)
  } else {
    response.status(401).json({ error: 'token invalid' })
  }
})

module.exports = blogsRouter
