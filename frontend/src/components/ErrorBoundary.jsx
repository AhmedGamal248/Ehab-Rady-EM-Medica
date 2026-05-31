import { Component } from "react";

/**
 * Route-level error boundary.
 * Catches render errors in any child subtree and shows a friendly fallback
 * instead of a blank white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production hook into Sentry / LogRocket here
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    // Navigate home so the broken route doesn't re-render immediately
    window.location.href = "/";
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="page auth-page">
        <div className="container">
          <div
            className="state-card state-card--error"
            role="alert"
            aria-live="assertive"
            style={{ maxWidth: 480, margin: "0 auto" }}
          >
            {/* Inline SVG — no external dependency */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
              style={{ color: "var(--danger)" }}
            >
              <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5" />
              <path d="M24 14v12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <circle cx="24" cy="33" r="2" fill="currentColor" />
            </svg>

            <h2 style={{ fontSize: "1.25rem" }}>Something went wrong</h2>

            <p style={{ textAlign: "center", maxWidth: 340 }}>
              An unexpected error occurred. Your cart and account data are safe.
              {process.env.NODE_ENV !== "production" && this.state.error && (
                <code
                  style={{
                    display: "block",
                    marginTop: 12,
                    fontSize: "0.75rem",
                    background: "var(--bg-strong)",
                    padding: "8px 12px",
                    borderRadius: "var(--r-sm)",
                    textAlign: "left",
                    wordBreak: "break-all",
                  }}
                >
                  {this.state.error.message}
                </code>
              )}
            </p>

            <button
              className="button button--primary"
              onClick={this.handleReset}
              type="button"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }
}