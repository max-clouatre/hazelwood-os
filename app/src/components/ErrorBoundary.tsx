import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { logError } from "../lib/errlog";

/** If something crashes, show a friendly screen with a way out instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode; onExit?: () => void; label?: string }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error, info: ErrorInfo) { logError(err.message, `${err.stack ?? ""}\n${info.componentStack ?? ""}`); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-night p-6 text-center">
        <span className="emoji text-7xl">🙈</span>
        <p className="text-3xl font-bold">Oops! Something got mixed up.</p>
        <p className="text-xl">Don't worry, your friends and stars are safe.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => { this.setState({ err: null }); this.props.onExit?.(); }} className="rounded-2xl bg-mustard px-6 py-3 text-2xl font-bold text-black">Go back</button>
          <button onClick={() => location.reload()} className="rounded-2xl bg-white px-6 py-3 text-2xl font-bold text-black">Restart</button>
        </div>
        <p className="max-w-md break-words text-xs text-white/60">{this.props.label ?? ""} {this.state.err.message}</p>
      </div>
    );
  }
}
