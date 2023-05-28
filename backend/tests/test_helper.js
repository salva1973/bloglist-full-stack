const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'React is cool',
    author: 'Salva',
    url: 'https://www.example.com/1',
    likes: 5,
  },
  {
    title: 'Express is cool',
    author: 'Salva',
    url: 'https://www.example.com/2',
    likes: 6,
  },
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'MongoDB is cool',
    author: 'Salva',
    url: 'https://www.example.com/3',
    likes: 4,
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
}
