# Finance Tracker Frontend

This is the frontend for the Finance Tracker application, built with Vue.js. It provides a user interface to interact with the [Finance Tracker Django API](http://127.0.0.1:8000/) for managing personal finances, including budgets, categories, and transactions.

## Features

- User registration and authentication.
- Dashboard overview.
- CRUD operations for:
  - Budgets
  - Categories
  - Transactions

## Technologies Used

- **[Vue.js](https://vuejs.org/)**: A progressive JavaScript framework for building user interfaces.
- **[Vite](https://vitejs.dev/)**: A modern frontend build tool that provides an extremely fast development experience.
- **[Vue Router](https://router.vuejs.org/)**: The official router for Vue.js.
- **[Pinia](https://pinia.vuejs.org/)**: The recommended state management library for Vue.js.
- **[Axios](https://axios-http.com/)**: A promise-based HTTP client for making API requests.
- **[ESLint](https://eslint.org/)** & **[Prettier](https://prettier.io/)**: For code linting and formatting.

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or higher is recommended).
- The [Finance Tracker Django backend](http://127.0.0.1:8000/) must be running.

### Installation

1.  Clone the repository to your local machine:

    ```sh
    git clone <repository-url>
    ```

2.  Navigate into the project directory:

    ```sh
    cd financetracker-frontend
    ```

3.  Install the dependencies:
    ```sh
    npm install
    ```

### Running the Application

1.  **Start the Backend Server**: Before you can run the frontend, make sure your Django backend server is running, typically with:

    ```sh
    python manage.py runserver
    ```

2.  **Compile and Hot-Reload for Development**: Start the frontend development server:
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Creating a User

User registration is handled through the application's UI. Navigate to the `/register` page to create a new account.

Alternatively, you can create a superuser directly from the Django backend:

```sh
python manage.py createsuperuser
```

## Available Scripts

- **`npm run build`**: Compiles and minifies the application for production.
- **`npm run lint`**: Lints and fixes files.
- **`npm run format`**: Formats files with Prettier.
- **`npm run preview`**: Serves the production build locally for previewing.
