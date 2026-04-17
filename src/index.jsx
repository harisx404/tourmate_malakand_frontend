//--- [ CORE DEPENDENCIES ] ---//
import React from "react";
import ReactDOM from "react-dom/client";

//--- [ MAIN COMPONENT ] ---//
import App from "./App";

//--- [ GLOBAL STYLESHEETS ] ---//
/* Import order ensures library overrides are handled correctly. 
  Third-party libraries (Bootstrap, RemixIcon, Slick) load first, 
  followed by custom overrides (glass-alert).
*/
import "bootstrap/dist/css/bootstrap.min.css";
import "remixicon/fonts/remixicon.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./styles/glass-alert.css";

//--- [ ROUTING & CONTEXT ] ---//
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { AuthContextProvider } from "./context/AuthProvider";

//--- [ APPLICATION ENTRY POINT ] ---//
/* Provider Stack Architecture:
  1. StrictMode: Enforces best practices during development.
  2. ErrorBoundary: Catches rendering errors in the component tree below.
  3. AuthContextProvider: Wraps Router to provide user state to all routes (and route guards).
  4. BrowserRouter: Enables client-side routing.
  5. ScrollToTop: Utility to reset scroll position on route transitions.
*/
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthContextProvider>
        <BrowserRouter>
          <ScrollToTop />
          <App />
        </BrowserRouter>
      </AuthContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);