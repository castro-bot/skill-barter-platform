import './commands'

Cypress.on('window:before:load', (win) => {

  const _orig = win.matchMedia?.bind(win)
  Object.defineProperty(win, 'matchMedia', {
    writable: true,
    value: (query) => {
      const base = {
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }
      if (query === '(prefers-reduced-motion: reduce)') {
        return { ...base, matches: true }
      }
      return _orig ? _orig(query) : { ...base, matches: false }
    },
  })

  win.document.addEventListener('DOMContentLoaded', () => {
    const style = win.document.createElement('style')
    style.textContent = '*, *::before, *::after { animation-duration: 0.001s !important; animation-delay: 0s !important; transition-duration: 0.001s !important; }'
    win.document.head.appendChild(style)
  }, { once: true })
})

afterEach(function () {
  const testTitle = this.currentTest.title.replace(/[^a-zA-Z0-9]/g, '_')
  const specName = Cypress.spec.name.replace('.cy.js', '')
  cy.screenshot(`${specName}/${testTitle}`, { capture: 'viewport' })
})