const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) =>
  blogs.reduce((total, blog) => total + blog.likes, 0)

const favoriteBlog = (blogs) => {
  if (_.isEmpty(blogs)) {
    return undefined
  }

  return blogs.reduce(
    (favoriteBlog, blog) => {
      if (blog.likes > favoriteBlog.likes) {
        return {
          title: blog.title,
          author: blog.author,
          likes: blog.likes,
        }
      }
      return favoriteBlog
    },
    { likes: 0 }
  )
}

const mostBlogs = (blogs) => {
  if (_.isEmpty(blogs)) {
    return undefined
  }

  const authorCounts = _.countBy(blogs, 'author')
  const topAuthor = _.maxBy(
    _.keys(authorCounts),
    (author) => authorCounts[author]
  )
  const blogCount = authorCounts[topAuthor]
  return { author: topAuthor, blogs: blogCount }
}

const mostLikes = (blogs) => {
  if (_.isEmpty(blogs)) {
    return undefined
  }

  const authorLikes = _.mapValues(
    _.groupBy(blogs, 'author'),
    (blogsByAuthor) => {
      return _.sumBy(blogsByAuthor, 'likes')
    }
  )

  const topAuthor = _.maxBy(
    _.keys(authorLikes),
    (author) => authorLikes[author]
  )
  const totalLikes = authorLikes[topAuthor]

  return { author: topAuthor, likes: totalLikes }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
