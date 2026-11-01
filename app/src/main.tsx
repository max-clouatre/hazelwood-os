import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource/fredoka/latin-500.css";
import "@fontsource/fredoka/latin-600.css";
import "@fontsource/fredoka/latin-700.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
