import React from 'react'

export default class ErrorBoundary extends React.Component {
  state = { error: null }

  componentDidCatch(error) {
    console.error(error)
    this.setState({ error })
  }

  render() {
    if (this.state.error) return <div>ERROR!!</div>
    return this.props.children
  }
}
