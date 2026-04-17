import { createContext } from "react";


//===== GLOBAL AUTH STATE MANAGEMENT =====//
export const initial_state = {
    // Initialize state from localStorage to persist sessions across refreshes.
    // Handles potential parsing errors by resetting corrupted data.
    /*
      Hydration Strategy:
      Uses an IIFE (Immediately Invoked Function Expression) to safely parse JSON.
      If localStorage data is malformed (e.g. manual tampering), it defaults to null
      instead of crashing the entire application. 
    */
    user: (() => {
        try {
            return localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
        } catch (error) {
            // Failed to parse user from localStorage
            localStorage.removeItem("user");
            return null;
        }
    })(),
    loading: false,
    error: null,
};

/**
 * Context to provide authentication state globally.
 */
export const AuthContext = createContext(initial_state);