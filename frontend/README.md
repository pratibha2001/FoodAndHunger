# Food and Hunger - Frontend

A modern web application built to connect donors with those in need, facilitating food donation and distribution. The platform serves three main roles: **Donors**, **Recipients**, and **Volunteers**.

## Features

- **Authentication**: Secure Login and Registration for all user roles.
- **Donor Dashboard**: Manage food donations and track their status.
- **Recipient Dashboard**: Browse available donations and request food.
- **Volunteer Dashboard**: View delivery requests and coordinate food pickup/drop-off.
- **Interactive Maps**: Real-time location services using Leaflet for tracking donations and requests.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Icons**: [Lucide React](https://lucide.dev/) & [Heroicons](https://heroicons.com/)

## Prerequisites

- Node.js (Latest LTS recommended)
- npm or pnpm

## Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:Bugsfounder/foodAndHunger.git
   ```

2. **Navigate to the frontend directory**

   ```bash
   cd foodAndHunger/frontend
   ```

3. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

## Configuration

### API URL

The backend API URL is currently configured in `src/App.jsx`.

```javascript
const publicAxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/', // Update this if your backend runs on a different port/host
  withCredentials: false,
});
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### `npm run build`

Builds the app for production to the `dist` folder.

### `npm run preview`

Locally preview the production build.

### `npm run lint`

Runs ESLint to check for code quality issues.

## Troubleshooting

### Tailwind CSS / Vite Issues

If you encounter an error like:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@tailwindcss/vite'
```

This usually happens because Tailwind CSS v4 uses a specific Vite plugin that might be missing or not linked correctly.

**Fix Steps:**

1.  **Install the missing package:**

    ```bash
    npm install @tailwindcss/vite -D
    ```

2.  **Clean and Reinstall (if issue persists):**

    ```bash
    rm -rf node_modules .vite-temp package-lock.json
    npm install
    npm run dev
    ```

3.  **Verify `vite.config.js`:**

    Ensure your configuration includes the Tailwind plugin:

    ```javascript
    import { defineConfig } from "vite";
    import react from "@vitejs/plugin-react";
    import tailwindcss from "@tailwindcss/vite";

    export default defineConfig({
      plugins: [react(), tailwindcss()],
    });
    ```

## Project Structure

The project is organized as follows:

- **`src/Components`**: Reusable UI components.
- **`src/pages`**: Route components (Auth, Donor, Recipient, Volunteer).
- **`src/assets`**: Static assets like images and icons.
- **`src/Components/utils`**: Utility components and helper functions.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](../CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## License

This project is licensed under the terms of the [LICENSE](../LICENSE) file.

