const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@nodeexpressprojects.xfwck2p.mongodb.net/bloglist?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Blog = mongoose.model('Blog', noteSchema)

const blog = new Blog({
  title: 'The Art of War',
  author: 'John Wick',
  url: 'https://www.bestblogs.com/1134',
  likes: 1084,
})

blog.save().then(() => {
  console.log('blog saved!')
  mongoose.connection.close()
})

// Blog.find({}).then((result) => {
//   result.forEach((blog) => {
//     console.log(blog)
//   })
//   mongoose.connection.close()
// })
