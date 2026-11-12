import { Component, type ReactNode } from "react";

// catches render errors below it, so one broken component
// doesn't turn the whole page white
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error); // send to Sentry etc. here if you use one
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="page-container page-center">
        <h1 className="page-title">Something went wrong</h1>
        <p className="page-text">Try reloading the page.</p>
        <button
          type="button"
          className="page-button"
          onClick={() => location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }
}
