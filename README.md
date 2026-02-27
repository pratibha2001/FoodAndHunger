# FoodAndHunger
FoodAndHunger connects restaurants, shops, and households with nearby NGOs to donate surplus food using a smart, location-based platform. It reduces food waste while ensuring fresh meals reach people in need quickly and safely.

## Features

- **Donation Management**: Donors can list available food items.
- **Request Management**: Individuals or organizations can request food.
- **Volunteer Dashboard**: Volunteers can view and accept delivery tasks.
- **Admin Panel**: Manage users, donations, requests, and verify documents.
- **Real-time Tracking**: Track donations and deliveries (integrated with maps).
- **Responsive Design**: Built for both desktop and mobile users.

## Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Maps**: Leaflet / React-Leaflet

### Backend
- **Framework**: [Spring Boot](https://spring.io/projects/spring-boot) (v3.5.7)
- **Language**: Java 17
- **Database**: MySQL
- **ORM**: Hibernate / Spring Data JPA
- **Security**: Spring Security, JWT (JSON Web Tokens)

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) & **npm** (or pnpm)
- **Java Development Kit (JDK)** 17
- **MySQL Server** (v8.0 recommended)
- **Maven** (optional, as `mvnw` wrapper is included)

## Configuration & Setup

### 1. Database Setup

The application uses MySQL. You need to have a MySQL server running locally.

1.  Open your MySQL client (Workbench, CLI, etc.).
2.  Create a database named `foodandhunger` (optional, the app is configured to create it if it doesn't exist).
    ```sql
    CREATE DATABASE IF NOT EXISTS foodandhunger;
    ```
3.  **Important**: The application is configured to use the following credentials by default:
    - **Username**: `root`
    - **Password**: `root`
    - **Port**: `3306`

    If your MySQL configuration differs, update the `backend/src/main/resources/application.properties` file:
    ```properties
    spring.datasource.username=YOUR_USERNAME
    spring.datasource.password=YOUR_PASSWORD
    ```

### 2. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies and build the project:
    ```bash
    ./mvnw clean install
    ```
    *(On Windows, use `mvnw.cmd clean install`)*
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```
    Or if you have Maven installed globally:
    ```bash
    mvn spring-boot:run
    ```
    The backend server will start on `http://localhost:8080`.

### 3. Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # OR if you use pnpm
    pnpm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` (or the port shown in the terminal).

## API Documentation

A Postman collection is included in the repository to help you test the API endpoints.
- File: `backend/foodandhunger.postman_collection.json` (or check root directory)
- Import this file into [Postman](https://www.postman.com/) to see all available endpoints and example requests.

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1.  **Fork** the repository.
2.  Create a new **branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/amazing-feature
    ```
3.  **Commit** your changes:
    ```bash
    git commit -m "Add some amazing feature"
    ```
4.  **Push** to the branch:
    ```bash
    git push origin feature/amazing-feature
    ```
5.  Open a **Pull Request**.


