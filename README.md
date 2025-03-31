# Chatty - React Chat Application

A real-time chat application built with React, Node.js, Express, Socket.IO, and MongoDB.

## Features

- User authentication (login/register)
- Profile management with profile picture upload
- Real-time messaging
- Online/offline status indicators
- File sharing
- Message history
- Responsive design

## Screenshots

- Login page
- Chat interface
- Profile management

## Tech Stack

### Frontend
- React
- React Router
- Socket.IO Client
- Axios
- CSS

### Backend
- Node.js
- Express
- Socket.IO
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Setup

1. Clone the repository:
```
git clone https://github.com/yourusername/chatty.git
cd chatty
```

2. Install dependencies for both frontend and backend:
```
# Install backend dependencies
cd Server
npm install

# Install frontend dependencies
cd ../FrontEnd
npm install
```

3. Create a `.env` file in the Server directory with the following variables:
```
PORT=7859
MONGODB_URI=mongodb://localhost:27017/chatApp
JWT_SECRET=your_jwt_secret
```

4. Start the MongoDB server:
```
mongod
```

5. Start the backend server:
```
cd Server
npm run dev
```

6. Start the frontend development server:
```
cd FrontEnd
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Register a new account
2. Log in with your credentials
3. Update your profile information and profile picture
4. Start chatting with other users
5. Share files and images

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login a user

### User Management
- `PUT /update-profile/:userId` - Update user profile

### Chat
- `GET /contacts/:userId` - Get all contacts
- `GET /messages/:senderId/:recipientId` - Get messages between two users
- `POST /upload` - Upload a file

## Socket.IO Events

### Client to Server
- `userConnected` - User connects to the server
- `sendMessage` - Send a message to another user
- `disconnect` - User disconnects from the server

### Server to Client
- `userStatusUpdate` - Update user status (online/offline)
- `newMessage` - Receive a new message

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Socket.IO](https://socket.io/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/) 