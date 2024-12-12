# Real-Time Location Tracking System

This project demonstrates a real-time location tracking system using Node.js, Express, MongoDB, Redis, and Socket.IO. It allows users to send their location updates, which are stored in Redis for quick access and optionally saved to MongoDB for persistence. Admins can view user details and location logs through RESTful APIs.

## Features
- User registration and authentication using JWT.
- Real-time location tracking using Socket.IO.
- Caching of location data in Redis for quick access.
- Location data persistence in MongoDB.
- Admin APIs to view users and their location logs.

## Prerequisites
- Node.js and npm
- MongoDB
- Redis
- A running instance of the Socket.IO server.

## Installation
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <repository_folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the project root and configure the following:
     ```
     PORT=5000
     MONGODB_URI=<your_mongo_connection_string>
     JWT_SECRET=<your_secret_key>
     ```

4. Start the server:
   ```bash
   npm start
   ```

## Client Setup
- Ensure the `client.js` script is properly configured to connect to the server and emit location updates.
- To test the client, run the following:
   ```bash
   node client.js
   ```

## API Endpoints
- `POST /register`: Register a new user.
- `POST /login`: Authenticate and get a JWT token.
- `GET /admin/users`: View all registered users (Admin).
- `GET /admin/user/:userId/locations`: View location logs of a specific user (Admin).

## Socket.IO Events
- `locationPing`: Emit user location updates to the server.

## Example Usage
- Start the server and run the client script.
- Monitor location updates in the logs or access them via admin APIs.
