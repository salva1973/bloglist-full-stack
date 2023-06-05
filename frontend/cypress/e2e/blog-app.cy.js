describe('Blog app', function () {
  beforeEach(function () {
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)
    const user = {
      name: 'Salvatore Vivolo',
      username: 'salvatore',
      password: 'Secret1.',
    }
    cy.request('POST', `${Cypress.env('BACKEND')}/users`, user)
    cy.visit('')
  })

  it('Login form is shown', function () {
    cy.contains('Login').click()
  })

  describe('Login', function () {
    it('succeeds with correct credentials', function () {
      cy.contains('Login').click()
      cy.get('#username').type('salvatore')
      cy.get('#password').type('Secret1.')
      cy.get('#login-button').click()

      cy.contains('Salvatore Vivolo logged in')
    })

    it('fails with wrong credentials', function () {
      cy.contains('Login').click()
      cy.get('#username').type('salvatore')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.get('.error')
        .should('contain', 'Wrong credentials')
        .and('have.css', 'color', 'rgb(255, 0, 0)')
        .and('have.css', 'border-style', 'solid')

      cy.get('html').should('not.contain', 'Salvatore Vivolo logged in')
    })
  })

  describe('When logged in', function () {
    beforeEach(function () {
      cy.login({ username: 'salvatore', password: 'Secret1.' })
    })

    it('A blog can be created', function () {
      cy.contains('New blog').click()
      cy.get('#title').type('React is cool')
      cy.get('#author').type('Salvatore Vivolo')
      cy.get('#url').type('https://www.example.com/1437')
      cy.contains('Create').parent().find('button').as('createButton')
      cy.get('@createButton').click()
      cy.contains('React is cool')
    })

    describe('And a blog exists', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'React is cool',
          author: 'Salvatore Vivolo',
          url: 'https://www.example.com/1437',
        })
      })

      it('The user can like that blog', function () {
        cy.contains('React is cool').parent().find('button').as('viewButton')
        cy.get('@viewButton').click()
        cy.get('.blog-likes-value').then(($likesElement) => {
          const initialLikes = parseInt($likesElement.text())

          cy.get('.blog-like-button').click()

          cy.get('.blog-likes-value').should(($updatedLikesElement) => {
            const updatedLikes = parseInt($updatedLikesElement.text())

            expect(updatedLikes).to.be.greaterThan(initialLikes)
          })
        })
      })

      it('The user can delete that blog', function () {
        cy.get('.blog-view-button').click()
        cy.get('.blog-delete-button').click()
        cy.get('html').should('not.contain', 'React is cool')
      })

      it('Another user cannot see the delete button', function () {
        cy.get('.logout-button').click()
        const user = {
          name: 'John Wick',
          username: 'john',
          password: 'Secret2.',
        }
        cy.request('POST', `${Cypress.env('BACKEND')}/users`, user)
        cy.login({ username: 'john', password: 'Secret2.' })

        cy.get('.blog-view-button').click()
        cy.get('.blog-delete-button').should('not.exist')
      })
    })
    describe('And several blogs exist', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'React is cool',
          author: 'Salvatore Vivolo',
          url: 'https://www.example.com/1437',
        })
        cy.createBlog({
          title: 'MongoDB is cool',
          author: 'Salvatore Vivolo',
          url: 'https://www.example.com/1438',
        })
        cy.createBlog({
          title: 'Express is cool',
          author: 'Salvatore Vivolo',
          url: 'https://www.example.com/1439',
        })
      })

      it('Blogs are ordered accordingly to the likes', function () {
        cy.contains('Express is cool').parent().find('button').click() // disclose details with view button
        cy.likeBlog()
        cy.likeBlog()
        cy.likeBlog()
        cy.likeBlog()
        cy.get('.blog-hide-button').click() // hide details

        cy.contains('React is cool').parent().find('button').click() // disclose details with view button
        cy.likeBlog()
        cy.likeBlog()
        cy.likeBlog()
        cy.get('.blog-hide-button').click() // hide details

        cy.contains('MongoDB is cool').parent().find('button').click() // disclose details with view button
        cy.likeBlog()
        cy.likeBlog()
        cy.get('.blog-hide-button').click() // hide details

        cy.get('.blog-container').eq(0).should('contain', 'Express is cool')
        cy.get('.blog-container').eq(1).should('contain', 'React is cool')
        cy.get('.blog-container').eq(2).should('contain', 'MongoDB is cool')
      })
    })
  })
})
