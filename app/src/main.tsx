import "./lib/shims";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { installGlobalErrorLogging } from "./lib/errlog";
import "@fontsource/fredoka/latin-500.css";
import "@fontsource/fredoka/latin-600.css";
import "@fontsource/fredoka/latin-700.css";
import "./index.css";

installGlobalErrorLogging();
createRoot(document.getElementById("root")!).render(<React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>);
