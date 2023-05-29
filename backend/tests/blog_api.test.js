const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

let token
let user

beforeAll(async () => {
  // Clear all users
  await User.deleteMany({})

  // Make sure the root is available
  const newUser = new User({ username: 'root', password: 'Secret1.' })
  await newUser.save()

  // Login
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'Secret1.' })

  // Obtain token and user, to use for the tests
  token = loginResponse.body.token
  user = await helper.extractUser(token)
})

describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    // Prepare the blogs in the DB attaching also the user property
    await Blog.insertMany(
      helper.initialBlogs.map((blog) => ({ ...blog, user: user._id }))
    )
  })
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map((r) => r.title)

    expect(titles).toContain('Express is cool')
  })

  test('the unique identifier property of blog posts should be named id', async () => {
    const response = await api.get('/api/blogs')
    const post = response.body[0]

    // Verify that the id property is defined
    expect(post.id).toBeDefined()

    // Verify that the _id property is not defined
    expect(post._id).toBeUndefined()
  })

  test('the likes property should default to 0 if missing from the request', async () => {
    // Simulate a request without the likes property
    const newBlog = {
      title: 'MongoDB is cool',
      author: 'Salva',
      url: 'https://www.example.com/3',
    }

    // Create a new blog
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)

    const returnedBlog = response.body.likes

    // Verify that the likes property is set to 0
    expect(returnedBlog).toBe(0)
  })

  describe('viewing a specific blog', () => {
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const blogToView = blogsAtStart[0]

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(resultBlog.body).toEqual(blogToView)
    })

    test('fails with statuscode 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api.get(`/api/blogs/${validNonexistingId}`).expect(404)
    })

    test('fails with statuscode 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api.get(`/api/blogs/${invalidId}`).expect(400)
    })
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const newBlog = {
        title: 'MongoDB is cool',
        author: 'Salva',
        url: 'https://www.example.com/3',
        likes: 4,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map((n) => n.title)
      expect(titles).toContain('MongoDB is cool')
    })

    test('fails with status code 400 if data invalid', async () => {
      const newBlog = {
        title: 'MongoDB is cool',
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })

    test('fails with status code 401 if token is not provided', async () => {
      const newBlog = {
        title: 'MongoDB is cool',
        author: 'Salva',
        url: 'https://www.example.com/3',
        likes: 4,
      }

      await api.post('/api/blogs').send(newBlog).expect(401)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map((r) => r.title)

      expect(titles).not.toContain(blogToDelete.title)
    })

    test('fails with status code 404 if id is not valid', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .delete(`/api/blogs/${validNonexistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
    })

    test('fails with status code 401 if token is not provided', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

      const titles = blogsAtEnd.map((r) => r.title)

      expect(titles).toContain(blogToDelete.title)
    })
  })

  describe('updating of a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const blogToView = blogsAtStart[0]

      let response = await api
        .get(`/api/blogs/${blogToView.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const blogToUpdate = response.body

      blogToUpdate.likes = 15

      response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(blogToUpdate)
        .expect(200)

      const returnedBlog = response.body

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
      expect(returnedBlog.likes).toBe(15)
    })

    test('fails with status code 404 if id is not valid', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const blogToView = blogsAtStart[0]

      let response = await api
        .get(`/api/blogs/${blogToView.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const blogToUpdate = response.body

      blogToUpdate.likes = 15

      const validNonexistingId = await helper.nonExistingId()

      response = await api
        .put(`/api/blogs/${validNonexistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(blogToUpdate)
        .expect(404)
    })

    test('fails with status code 401 if token is not provided', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const blogToView = blogsAtStart[0]

      let response = await api
        .get(`/api/blogs/${blogToView.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const blogToUpdate = response.body

      blogToUpdate.likes = 15

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogToUpdate)
        .expect(401)
    })
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const user = new User({ username: 'root', password: 'Secret1.' })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'Salva',
      name: 'Salvatore Vivolo',
      password: 'Secret2.',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'Secret1.',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails with proper statuscode and message if invalid user', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'sa',
      name: 'Superuser',
      password: 'Secret1.',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain(
      'shorter than the minimum allowed length'
    )

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

afterAll(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await mongoose.connection.close()
})
