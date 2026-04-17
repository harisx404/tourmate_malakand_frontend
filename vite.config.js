import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

//--- [ VITE CONFIGURATION ] ---//
/* Main configuration entry point.
  Defines the build toolchain, local development server settings, 
  and plugin integration (React) for the application environment.
*/
export default defineConfig({
    plugins: [react()],

    /* Development Server Settings */
    server: {
        port: 3000,
        open: true, // Automatically opens the browser on server start
    },

    resolve: {
        alias: {
            // Add any aliases here if you have them, e.g. '@': '/src'
        }
    },

    /* Production Build Output */
    build: {
        outDir: 'dist',
    },
});