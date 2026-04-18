# TourMate Malakand - Client/frontend Application 🏔️

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Mapbox](https://img.shields.io/badge/Mapbox_GL_JS-000000?style=for-the-badge&logo=mapbox&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

> **Live Deployment:** [tourmate-malakand.vercel.app](https://tourmate-malakand.vercel.app)

## Overview
TourMate Malakand is a full-stack MERN web application built to solve the regional information gap in the Malakand Division. This client-side application provides tourists and locals with reliable digital guidance, allowing them to travel safely and efficiently without relying on fragmented information. Built as a Single Page Application (SPA) using React.js and Vite, it delivers a highly responsive, component-based user experience across all devices. 

## Key Features
* **Interactive Mapping:** Features a WebGL-powered map canvas using Mapbox GL JS with custom geographic markers and popup cards for tourist spots. Includes selectable base styles such as a 3D Terrain mode with 1.5x elevation exaggeration.
* **Live GPS Routing:** Utilizes the Mapbox Directions API to calculate and draw turn-by-turn driving routes from the user's current live location to selected destinations.
* **Environmental Awareness:** Integrates the OpenWeatherMap API to display real-time weather conditions, feels-like temperatures, wind speed, and 3-day forecasts for specific geographic coordinates.
* **Traveler Safety:** Provides a publicly accessible, district-organized directory of verified emergency contacts including Rescue 1122, police, forest departments, and hospitals.
* **Role-Protected CMS:** Includes a secure administrative dashboard with a persistent sidebar navigation layout, guarded by a React Context `<AdminRoute>` that verifies JWT authentication status and user roles.

## UI/UX & Libraries
* **Routing:** Client-side navigation handled by React Router DOM (v6).
* **Layout & Styling:** Responsive grid system and pre-styled components powered by Bootstrap (v5) and Reactstrap (v9).
* **User Feedback:** Non-blocking toast notifications via `react-toastify` and modal confirmation dialogs for destructive actions via `sweetalert2`.
* **Media Rendering:** Image gallery grid rendered in a masonry layout using `react-responsive-masonry`.

## Performance Optimization
* **Code Splitting:** Utilizes lazy-loaded route-level code splitting via React `Suspense` boundaries to minimize the initial JavaScript bundle size.
* **Client-Side Compression:** Implements the `browser-image-compression` library to significantly reduce image file sizes in the browser prior to server upload, optimizing Cloudinary storage usage.

## Local Setup

1. Clone the repository: 
   `git clone https://github.com/harisx404/tourmate_malakand_frontend.git`

2. Install dependencies: 
   `npm install`

3. Configure Environment Variables (`.env`): 
   Create a `.env` file in the root directory and add the following keys:
   `VITE_BASE_URL=http://localhost:4000/api/v1`
   `VITE_MAPBOX_TOKEN=your_mapbox_public_token`

4. Start the development server: 
   `npm run dev`

## Deployment
This frontend application is configured for static site generation and is deployed globally via the Vercel CDN.

---
*Developed by Muhammad Haris as part of a Final Year BSIT Project at the Department of Computer Science and IT, University of Malakand.*
