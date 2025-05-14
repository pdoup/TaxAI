# Tax Filer Frontend (React)

Frontend application for the Intelligent Tax Filing Assistant, built with React.

## Features

- Responsive home page with application description.
- User-friendly form for inputting basic tax information (income, expenses, deductions).
- Integration with the backend to submit tax data and display AI-generated advice.
- Client side cookie storage to improve user experience for minor, non-sensitive preferences is stored (`lastSelectedCountry`).

## Available Scripts

In the project directory, you can run:

### `npm start`

Starts Webpack Dev Server under the hood - any changes to the source code will trigger a reload (default).
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

- Builds the app for production to the `build` folder.
- It correctly bundles React in production mode and optimizes the build (minified) for the best performance.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Environment Variables

-   `REACT_APP_API_BASE_URL`: The base URL for the backend API. Defaults to `http://localhost:8000/api/v1` if not set.

## Running with Docker

Refer to the main project `README.md` and `Dockerfile` in this directory for instructions on building and running the frontend with Docker.
