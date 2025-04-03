# Programming Channels - Q&A Platform

A channel-based tool for programming questions and discussions. This application allows users to create topic-specific channels, post questions with code examples, reply to posts, and vote on content.

## Features

- User registration and authentication
- Channel creation and management
- Posting questions with code blocks and images
- Nested replies with unlimited depth
- Upvote/downvote system for content
- Search functionality
- Admin dashboard for moderation
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: React.js with React Bootstrap
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Containerization**: Docker

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (for development)

## Quick Start

1. Clone the repository:
   ```
   git clone https://github.com/Bamimore-Tomi/channel-tools
   cd channel-tools
   ```

2. Start the application:
   ```
   docker-compose up
   ```

3. Access the application:
   - Web UI: http://localhost:3000
   - API: http://localhost:5000

## Default Admin Account

- **Username**: admin
- **Password**: admin123

## Development Setup

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Channels
- `GET /api/channels` - Get all channels
- `POST /api/channels` - Create a new channel
- `GET /api/channels/:id` - Get channel details
- `DELETE /api/channels/:id` - Delete a channel

### Messages
- `GET /api/messages/channel/:channelId` - Get channel messages
- `POST /api/messages/channel/:channelId` - Post a message
- `DELETE /api/messages/:id` - Delete a message
- `POST /api/messages/:id/rate` - Rate a message

### Replies
- `GET /api/replies/message/:messageId` - Get message replies
- `POST /api/replies/message/:messageId` - Reply to a message
- `POST /api/replies/parent/:replyId` - Reply to another reply
- `DELETE /api/replies/:id` - Delete a reply
- `POST /api/replies/:id/rate` - Rate a reply

### Search
- `GET /api/search?q=query` - Search all content
- `GET /api/search/users?q=query` - Search users
- `GET /api/search/stats/users/most-posts` - Get most active users
- `GET /api/search/stats/users/highest-rated` - Get highest rated users




https://www.loom.com/share/3e5e686232e4426c8eef556f1d8c0cd6?sid=5e4dad56-cc69-4a81-912d-2797ea999805