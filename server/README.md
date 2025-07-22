# Cab Service Backend

This is the backend server for the Cab Service MERN application. It provides RESTful APIs for managing users (admin, customer, driver), bookings, areas, and sessions.

## Features

- User role management: Admin, Customer, Driver
- Booking management
- Area management
- Session management
- Health check endpoint

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Joi for validation
- Bcrypt for password hashing
- Helmet for security
- CORS for cross-origin resource sharing
- Nodemailer for email services
- Moment.js for date/time handling

## Installation

1. Clone the repository and navigate to the `server` directory:

   ```bash
   git clone <repository-url>
   cd cab-service-mern-app/server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory and configure the following environment variables:

   ```
   PORT=3006
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   EMAIL_USER=<your-email-address>
   EMAIL_PASS=<your-email-password>
   ```

## Running the Server

- To start the server:

  ```bash
  npm start
  ```

- To start the server in development mode with auto-reloading:

  ```bash
  npm run dev
  ```

The server will run on the port specified in the `.env` file or default to port 3006.

## API Endpoints

The backend API is prefixed with `/api/v1`. Main routes include:

- `GET /api/v1/healthCheck` - Check server status
- `/api/v1/admin` - Admin related routes
- `/api/v1/customer` - Customer related routes
- `/api/v1/driver` - Driver related routes
- `/api/v1/booking` - Booking management routes
- `/api/v1/area` - Area management routes
- `/api/v1/sessions` - Session management routes

Refer to the route files in the `server/routes` directory for detailed endpoints.

## License

This project is licensed under the ISC License.
