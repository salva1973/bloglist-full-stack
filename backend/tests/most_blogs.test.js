const listHelper = require('../utils/list_helper')

describe('mostBlogs', () => {
  it('should return the author with the largest amount of blogs', () => {
    const blogs = [
      { title: 'Blog 1', author: 'Author 1' },
      { title: 'Blog 2', author: 'Author 2' },
      { title: 'Blog 3', author: 'Author 1' },
      { title: 'Blog 4', author: 'Author 3' },
      { title: 'Blog 5', author: 'Author 2' },
      { title: 'Blog 6', author: 'Author 2' },
    ]
    const result = listHelper.mostBlogs(blogs)
    expect(result).toEqual({ author: 'Author 2', blogs: 3 })
  })

  it('should return undefined for an empty array', () => {
    const blogs = []
    const result = listHelper.mostBlogs(blogs)
    expect(result).toBeUndefined()
  })
})
