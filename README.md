# Authentication Learning Project

This project demonstrates a complete authentication system built with Express.js, Passport.js, and PostgreSQL.

## Features

- User registration with secure password hashing
- User login with session management
- Protected routes requiring authentication
- PostgreSQL database integration
- Secure password handling with bcrypt

## Technologies Used

- Express.js - Web framework
- Passport.js - Authentication middleware
- PostgreSQL - Database
- bcrypt - Password hashing
- express-session - Session management
- EJS - Templating engine

## Project Structure

- `app.js` - Main application file
- `views/` - EJS templates for the UI
- `public/` - Static assets (CSS, images)

## Setup Instructions

1. Create a `.env` file with the following variables:
   ```
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_PORT=5432
   DB_PASSWORD=your_password
   DB_NAME=your_db_name
   SESSION_SECRET=your_secret_key
   PORT=3000
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create the PostgreSQL database table:
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(100) UNIQUE NOT NULL,
     passwords VARCHAR(200) NOT NULL
   );
   ```

4. Run the application:
   ```
   node app.js
   ```

## Learning Outcomes

This project demonstrates:
- How to implement authentication in an Express application
- Password hashing and security best practices
- Session management with Passport.js
- PostgreSQL database integration
- Protected routes and authentication middleware
