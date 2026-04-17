//--- [ API CONFIGURATION ] ---//
/* Defines the backend entry point.
   Prioritizes the VITE_BASE_URL environment variable (set in .env).
   Falls back to the live Vercel backend for production if the variable is undefined.
*/
export const BASE_URL = import.meta.env.VITE_BASE_URL || "https://tourmate-malakand-backend.vercel.app/api/v1";

/* Safety Check:
   Logs a critical warning if the app is running in Production mode (PROD)
   but lacks the specific API URL configuration. This aids in debugging 
   deployment issues where environment variables might not be loaded.
*/
if (import.meta.env.PROD && !import.meta.env.VITE_BASE_URL) {
   console.log("Notice: VITE_BASE_URL is not set. Using live Vercel fallback URL.");
}