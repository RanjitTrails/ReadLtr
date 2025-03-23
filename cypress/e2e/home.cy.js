describe('Home Page', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/')
  })

  it('should display the app title', () => {
    cy.contains('ReadLtr')
    cy.contains('Save Articles for Later')
  })

  it('should have navigation sidebar', () => {
    cy.get('nav').should('be.visible')
    cy.contains('Home')
    cy.contains('My List')
    cy.contains('Favorites')
  })

  it('should navigate to My List page', () => {
    cy.contains('My List').click()
    cy.url().should('include', '/list')
  })

  it('should have a working "Get Started" button', () => {
    cy.contains('button', 'Get Started').click()
    // This should either navigate to sign up or show the list
    cy.url().should('include', '/register').or('include', '/list')
  })
}) 