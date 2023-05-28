const listHelper = require('../utils/list_helper')
describe('mostLikes', () => {
  it('should return the author with the largest amount of likes', () => {
    const blogs = [
      { title: 'Blog 1', author: 'Author 1', likes: 10 },
      { title: 'Blog 2', author: 'Author 2', likes: 5 },
      { title: 'Blog 3', author: 'Author 1', likes: 15 },
      { title: 'Blog 4', author: 'Author 3', likes: 8 },
      { title: 'Blog 5', author: 'Author 2', likes: 20 },
      { title: 'Blog 6', author: 'Author 2', likes: 12 },
    ]
    const result = listHelper.mostLikes(blogs)
    expect(result).toEqual({ author: 'Author 2', likes: 37 })
  })

  it('should return undefined for an empty array', () => {
    const blogs = []
    const result = listHelper.mostLikes(blogs)
    expect(result).toBeUndefined()
  })
})
