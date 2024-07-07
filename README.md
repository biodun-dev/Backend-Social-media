
# Backend assessment

## Overview

This project is a backend API built with TypeScript, Express, and MongoDB. The API facilitates user interactions and data management within a basic social media platform and includes comprehensive documentation via Swagger.

## Features

- **TypeScript**: Type-safe development for better code quality and maintenance.
- **Express**: Fast and minimalist web framework for Node.js.
- **MongoDB**: NoSQL database for flexible and scalable data storage.
- **Swagger**: API documentation for easy testing and integration.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance

### Installation

1. Clone the repository:

   ```bash
   cd Backend/
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add the following:

   ```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mydatabase
JWT_SECRET=
REDIS_HOST=localhost
REDIS_PORT=6379  # Default Redis port
REDIS_URL=redis://localhost:6379
   ```

4. Run the application:

   ```bash
   npm run dev
   ```

   The server should now be running on `http://localhost:5000`.

### Scripts

- `npm run dev`: Run the application in development mode.
- `npm run build`: Build the application for production.
- `npm start`: Run the application in production mode.
- `npm run lint`: Lint the TypeScript code.
- `npm test`: Run the tests using Jest.

### Folder Structure

```
/project-root
│
├── /dist               # Compiled JavaScript files
├── /logs               # Log files
├── /node_modules       # Node.js modules
├── /src
│   ├── /config         # Configuration files
│   ├── /controllers    # Express route controllers
│   ├── /middlewares    # Express middlewares
│   ├── /models         # Mongoose models
│   ├── /routes         # Express routes
│   ├── /scripts        # Script files
│   ├── /services       # Service files
│   ├── /types          # TypeScript type definitions
│   ├── /utils          # Utility functions
│   ├── app.ts          # Express app setup
│   ├── index.ts        # Application entry point
│   ├── swagger.json    # Swagger documentation
│   └── validateEnv.ts  # Environment variable validation
├── /test               # Test files
├── /uploads            # Uploaded files
├── .env                # Environment variables
├── .gitignore          # Git ignore rules
├── package-lock.json   # NPM lock file
├── package.json        # NPM package file
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## API Documentation

The API documentation is available via Swagger. To access the Swagger UI, run the application and navigate to:

```
http://localhost:5000/api-docs
```

## Example Endpoints

### User Registration

- **Endpoint**: `/api/users/register`
- **Method**: POST
- **Body**:
  ```json
  {
    "username": "exampleUser",
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### User Login

- **Endpoint**: `/api/users/login`
- **Method**: POST
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Get User Feed

- **Endpoint**: `/api/users/feed`
- **Method**: GET
- **Query Params**: `page`, `limit`

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or suggestions, please contact:

- Abiodun Abdullahi
- Email: biodundev@gmail.com
