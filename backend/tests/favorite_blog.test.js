const listHelper = require('../utils/list_helper')

describe('favoriteBlog', () => {
  describe('when given an empty array', () => {
    it('should return undefined', () => {
      const blogs = []
      const result = listHelper.favoriteBlog(blogs)
      expect(result).toBeUndefined()
    })
  })

  describe('when given an array of blogs', () => {
    it('should return the blog with the most likes', () => {
      const blogs = [
        { title: 'Blog 1', author: 'Author 1', likes: 10 },
        { title: 'Blog 2', author: 'Author 2', likes: 5 },
        { title: 'Blog 3', author: 'Author 3', likes: 15 },
        { title: 'Blog 4', author: 'Author 4', likes: 8 },
      ]
      const result = listHelper.favoriteBlog(blogs)
      expect(result).toEqual({ title: 'Blog 3', author: 'Author 3', likes: 15 })
    })
  })

  describe('when multiple blogs have the same number of likes', () => {
    it('should return the first blog with the most likes', () => {
      const blogs = [
        { title: 'Blog 1', author: 'Author 1', likes: 10 },
        { title: 'Blog 2', author: 'Author 2', likes: 10 },
        { title: 'Blog 3', author: 'Author 3', likes: 15 },
        { title: 'Blog 4', author: 'Author 4', likes: 10 },
      ]
      const result = listHelper.favoriteBlog(blogs)
      expect(result).toEqual({ title: 'Blog 3', author: 'Author 3', likes: 15 })
    })
  })
})
