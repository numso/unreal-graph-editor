import React from 'react'
import ReactDOM from 'react-dom'

import './styles.css'
import App from './app'
import ErrorBoundary from './error-boundary'

window.addEventListener('contextmenu', e => {
  e.preventDefault()
  return false
})

const rootElement = document.getElementById('root')
ReactDOM.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  rootElement
)
