# Chat App Backend

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express.js](https://img.shields.io/badge/Express.js-5.0.0-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-black)
![MongoDB](https://img.shields.io/badge/MongoDB-6.14.2-green)
![AWS S3](https://img.shields.io/badge/AWS-S3-orange)

A comprehensive real-time chat application backend built with Node.js, Express.js, and Socket.IO. This backend provides a complete messaging platform with support for individual chats, group conversations, file sharing, and real-time features.

## ✨ Features

### Core Messaging
- **Real-time messaging** with Socket.IO
- **Individual and group conversations**
- **Message reactions and replies**
- **Typing indicators** and read receipts
- **Message status tracking** (sent, delivered, read)
- **Message editing and deletion**
- **Rich media support** (images, videos, audio, files)

### User Management
- **JWT-based authentication** and authorization
- **User profiles** with avatar support
- **Contact/friend management system**
- **User presence status** (online/offline)
- **User search functionality**

### Group Chat Features
- **Group creation and management**
- **Role-based permissions** (admin, co-admin, member)
- **Member management** (add, remove, role changes)
- **Group settings** (mute, pin, archive)

### File & Media
- **AWS S3 integration** for file storage
- **Multiple file upload support**
- **File download with presigned URLs**
- **Media optimization and thumbnails**

### Advanced Features
- **Push notifications**
- **Message search and filtering**
- **User activity tracking**
- **Privacy and security settings**
- **Report and moderation system**

## 🛠 Technology Stack

### Backend Framework
- **Node.js** (Runtime environment)
- **Express.js 5.0.0** (Web framework)
- **Socket.IO 4.8.1** (Real-time communication)

### Database & Storage
- **MongoDB 6.14.2** (Primary database)
- **AWS S3** (File storage)

### Authentication & Security
- **JWT** (JSON Web Tokens) with `jose` library
- **bcryptjs** (Password hashing)
- **helmet** (Security headers)
- **CORS** (Cross-origin resource sharing)

### Additional Libraries
- **multer** (File upload handling)
- **compression** (Response compression)
- **morgan** (HTTP request logging)
- **swagger-ui-express** (API documentation)

## 🏗 Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
src/
├── app.js                 # Main application setup
├── controllers/           # Request handlers
├── services/             # Business logic
├── routes/               # API endpoints
├── middlewares/          # Custom middleware
├── constants/            # Application constants
├── utils/                # Utility functions
├── repos/                # Database repositories
├── validations/          # Input validation
└── schema.js            # Database schema documentation
```

### Socket.IO Services
- **Connection Management** - Handle user connections/disconnections
- **Message Service** - Real-time message delivery
- **Presence Service** - User online/offline status
- **Typing Service** - Typing indicators
- **Group Service** - Group chat events
- **Notification Service** - Real-time notifications

## 📡 API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/me` - Get current user info

### Users (`/users`)
- `GET /users/search` - Search users by phone number
- `GET /users/:id` - Get user details
- `POST /users/update-info` - Update user profile
- `POST /users/profile-picture` - Update profile picture

### Contacts (`/contacts`)
- `GET /contacts/list` - Get contacts list
- `POST /contacts/:userId/add` - Send friend request
- `GET /contacts/requests` - Get pending friend requests
- `POST /contacts/:requestId/accept` - Accept friend request
- `POST /contacts/:userId/block` - Block user

### Conversations (`/conversations`)
- `GET /conversations/all` - Get all conversations
- `POST /conversations/new` - Create new conversation
- `GET /conversations/:id` - Get conversation details
- `POST /conversations/:id/add` - Add member to group
- `POST /conversations/:id/leave` - Leave group

### Messages (`/messages`)
- `GET /messages/:conversationId` - Get messages (paginated)
- `POST /messages/:conversationId` - Send new message
- `POST /messages/:conversationId/edit/:messageId` - Edit message
- `POST /messages/:conversationId/reaction/:messageId/add` - Add reaction

### Media (`/media`)
- `POST /media/one-attachment` - Upload single file
- `POST /media/multi-attachments` - Upload multiple files
- `POST /media/download-by-url` - Download file by URL

## 🔌 Socket.IO Events

### Connection Events
- `connection` - User connects to socket
- `disconnect` - User disconnects from socket

### Message Events
- `send message` - Send new message
- `new message` - Receive new message
- `delete message` - Delete message
- `message deleted` - Message deletion notification

### Typing Events
- `typing` - User starts typing
- `stop typing` - User stops typing
- `user typing` - Typing indicator broadcast

### Presence Events
- `online users` - Online users list update

### Group Events
- `create group` - Create new group
- `add member` - Add group member
- `remove member` - Remove group member
- `change role` - Change member role

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** 18.x or higher
- **MongoDB** 6.x or higher
- **AWS Account** with S3 access
- **npm** or **yarn** package manager

### Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/chat-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET=your-s3-bucket-name

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-app-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm start
   ```

6. **Access the application**
   - Server: `http://localhost:3000`
   - API Documentation: `http://localhost:3000/api-docs`

## 📊 Database Schema

The application uses MongoDB with the following main collections:

### Collections Overview
- **users** - User profiles and authentication data
- **contacts** - Friend relationships and contact management
- **friendRequests** - Pending friend requests
- **conversations** - Chat conversations (individual & group)
- **messages** - Chat messages with media support
- **media** - File and media metadata
- **notifications** - User notifications
- **calls** - Call history and metadata
- **reports** - User and content reports

### Key Features
- **Indexed collections** for optimal query performance
- **Rich message types** (text, media, location, files)
- **Comprehensive user activity tracking**
- **Flexible group management** with role-based permissions

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password hashing** using bcryptjs
- **Input validation** and sanitization
- **Rate limiting** and CORS protection
- **File upload security** with type validation
- **Privacy settings** for user profiles
- **Report and moderation system**

## 📁 Project Structure

```
chat-app-backend/
├── bin/
│   └── www.js              # Server entry point
├── src/
│   ├── app.js              # Express app configuration
│   ├── constants/          # Application constants
│   │   ├── api.constant.js # API endpoint definitions
│   │   ├── socket.constant.js # Socket event constants
│   │   └── ...
│   ├── controllers/        # Route controllers
│   ├── services/          # Socket.IO services
│   │   ├── message.socket.service.js
│   │   ├── presence.socket.service.js
│   │   └── ...
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middleware
│   ├── repos/             # Database repositories
│   ├── utils/             # Utility functions
│   ├── validations/       # Input validation schemas
│   └── schema.js          # Database schema documentation
├── package.json
└── README.md
```

## 📖 API Documentation

The application includes comprehensive API documentation using Swagger UI. After starting the server, visit:

```
http://localhost:3000/api-docs
```

This provides interactive documentation for all API endpoints with:
- Request/response schemas
- Authentication requirements  
- Example requests and responses
- Error codes and descriptions

## 🧪 Development Guidelines

### Code Style
- Use **ES6+ features** and modern JavaScript syntax
- Follow **RESTful API** conventions
- Implement **proper error handling** with try-catch blocks
- Use **async/await** for asynchronous operations
- Write **descriptive variable and function names**

### Testing
- Write unit tests for critical business logic
- Test API endpoints with proper authentication
- Validate Socket.IO event handling
- Test file upload and media handling

### Performance
- Implement **database indexing** for frequently queried fields
- Use **connection pooling** for database connections
- Implement **caching strategies** for frequently accessed data
- Optimize **file upload and media processing**

## 🤝 Contributing

### Commit Rules

Một commit message phải đúng format như sau:

```bash
<type>(<scope>): message
```

Trong đó:

- `<type>`: là loại của commit, có thể là:
    - `feat`: Thêm một chức năng mới
    - `fix`: Sửa một lỗi
    - `docs`: Sửa lỗi hoặc thêm mới về tài liệu (ví dụ README.md)
    - `style`: Sửa lỗi hoặc thêm mới về code style frontend
    - `refactor`: Sửa lỗi hoặc thêm mới về code mà không ảnh hưởng đến chức năng
    - `perf`: Sửa lỗi hoặc thêm mới về hiệu suất
    - `test`: Sửa lỗi hoặc thêm mới về test
    - `bug`: Push code có lỗi hoặc chưa hoàn thiện cho người khác hỗ trợ

- `<scope>`: là mô tả về phạm vi các file hoặc module bị ảnh hưởng bởi commit
    - Ví dụ: `login`, `database`, `wiki`, ...

- `message`: là nội dung của commit, mô tả về những thay đổi cụ thể
    - Ví dụ: `fix bug login`, `add new feature login`, `update README.md`, ...

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Follow the commit message format above
4. Write tests for new features
5. Ensure all tests pass
6. Submit a pull request with clear description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running on the specified port
- Check connection string in environment variables
- Verify network connectivity

**AWS S3 Upload Issues**
- Verify AWS credentials and permissions
- Check bucket name and region settings
- Ensure proper IAM policies for S3 access

**Socket.IO Connection Problems**
- Check CORS configuration
- Verify client-server URL matching
- Ensure proper authentication token handling

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team.
