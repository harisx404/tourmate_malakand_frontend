import React, { useEffect, useReducer } from "react";
import { BASE_URL } from "../utils/config";
// Import the context and state we created in the other file
import { AuthContext, initial_state } from "./AuthContext";


/**
 * Reducer function to manage authentication state transitions.
 * 
 * @param {Object} state - Current state.
 * @param {Object} action - Dispatched action with type and optional payload.
 */
const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return {
                user: null,
                loading: true,
                error: null,
            };
        case "LOGIN_SUCCESS":
            return {
                user: action.payload,
                loading: false,
                error: null,
            };
        case "LOGIN_FAILURE":
            return {
                user: null,
                loading: false,
                error: action.payload,
            };
        case "REGISTER_SUCCESS":
            return {
                user: null,
                loading: false,
                error: null,
            };
        case "LOGOUT":
            return {
                user: null,
                loading: false,
                error: null,
            };
        default:
            return state;
    }
};

/**
 * Provider component for the AuthContext.
 * Manages user lifecycle, local storage persistence, and exposes dispatch.
 * 
 * @component
 */
export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, initial_state);

    useEffect(() => {
        //===== Persistence & Security Logic =====//
        if (state.user) {
            localStorage.setItem("user", JSON.stringify(state.user));

            // Prevent Split-Brain: Verify if the HttpOnly cookie is still valid
            const checkAuth = async () => {
                try {
                    const res = await fetch(`${BASE_URL}/auth/me`, { credentials: "include" });

                    // 1. Server answered, but said "Token Invalid" (401)
                    // ACTION: Logout immediately. The token is definitely bad.
                    if (!res.ok) {
                        dispatch({ type: "LOGOUT" });
                    }

                } catch (err) {
                    // 2. Server did NOT answer (Network Error / Server Offline)
                    // ACTION: Do nothing. Keep the user logged in locally.
                    // This allows you to start Frontend first without losing the session.
                    console.warn("Server unreachable (Offline or Restarting). Keeping local session active.");
                }
            };
            checkAuth();

        } else {
            localStorage.removeItem("user");
        }
    }, [state.user]);

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                loading: state.loading,
                error: state.error,
                dispatch,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};