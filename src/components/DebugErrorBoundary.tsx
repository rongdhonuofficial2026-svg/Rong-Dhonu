'use client'

import React from 'react'

export class DebugErrorBoundary extends React.Component<{id: string, children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary] Caught error in ${this.props.id}:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'rgba(255,0,0,0.1)', border: '2px solid red', margin: '10px' }}>
          <h3>Crash in {this.props.id}</h3>
          <p>{this.state.error?.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
