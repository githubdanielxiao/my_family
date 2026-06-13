# 🏠 Family Relationship Management System

A comprehensive web-based family relationship management system with role-based access control, built for GitHub Codespaces.

## ✨ Features

- 👥 **Family Tree Management**: Inverted tree structure showing family relationships
- 🔐 **Role-Based Access Control**: Granular permission management at node level
- 📱 **Phone-Based Authentication**: Login with phone number
- 🔒 **Password Management**: Force password change on first login
- 📋 **Member Information**: Manage personal details, addresses, and contacts
- 👪 **Relationship Tracking**: Track parents, children relationships
- 🎨 **Modern UI**: Built with Ant Design for responsive interface

## 🛠️ Technology Stack

**Backend:**
- Node.js + Express.js
- SQLite Database
- JWT Authentication
- Role-Based Access Control (RBAC)

**Frontend:**
- React 18
- Ant Design (antd)
- Axios for API calls
- React Router for navigation

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- GitHub Codespaces (or local development environment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/githubdanielxiao/my_family.git
cd my_family
```

### 2. Run Setup Script

```bash
bash setup.sh
```

This script will:
- Install backend dependencies
- Initialize the database
- Seed demo data
- Install frontend dependencies

### 3. Start Development Server

```bash
npm run dev
```

Or individually:

```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
cd client && npm start
```

## 🎯 Demo Credentials

After setup, use these credentials to login:

- **Phone**: 13800138000
- **Password**: 13800138000

> ⚠️ **Important**: You'll be prompted to change the password on first login.

## 📚 API Endpoints

### Authentication

```
POST   /api/auth/login              - User login
POST   /api/auth/register           - User registration (admin only)
POST   /api/auth/change-password    - Change user password
```

### Members

```
GET    /api/members/tree            - Get family tree
GET    /api/members/:id             - Get member details
POST   /api/members                 - Create new member
PUT    /api/members/:id             - Update member info
```

### Permissions

```
GET    /api/permissions/member/:id  - Get member permissions
POST   /api/permissions/grant       - Grant permission
DELETE /api/permissions/:id         - Revoke permission
```

## 📁 Project Structure

```
.
├── server.js                 # Express server entry point
├── package.json              # Backend dependencies
├── .env                      # Environment configuration
├── config/
│   └── database.js          # Database initialization
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── members.js           # Member management routes
│   └── permissions.js       # Permission management routes
├── scripts/
│   ├── init-db.js           # Database initialization script
│   └── seed-data.js         # Demo data seeding script
└── client/                  # React frontend
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js
    │   ├── App.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   └── MainPage.js
    │   └── styles/
    │       ├── LoginPage.css
    │       └── MainPage.css
    └── package.json
```

## 🔑 Environment Variables

Create `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
DB_PATH=./data/family.db
CLIENT_URL=http://localhost:3000
```

## 👤 User Roles & Permissions

### Permission Levels

- **can_view**: View member information
- **can_edit**: Edit member information
- **can_manage_permissions**: Grant/revoke permissions to other users

### Permission Scope

Permissions are inherited from parent nodes. When you grant permission on a node, the user gets access to that node and all its descendants.

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change port in .env file
PORT=5001
```

### Database Error

```bash
# Reinitialize database
rm -f data/family.db
node scripts/init-db.js
node scripts/seed-data.js
```

### Dependencies Issue

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🌐 Deploying to GitHub Codespaces

1. Open your repository in GitHub Codespaces
2. Run the setup script:
   ```bash
   bash setup.sh
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Forward the ports:
   - Backend: 5000 (public)
   - Frontend: 3000 (public)

## 📝 Features Coming Soon

- [ ] Permission inheritance settings
- [ ] Photo attachments for members
- [ ] Family events and milestones
- [ ] Export family tree as PDF
- [ ] Mobile app integration
- [ ] Multi-language support
- [ ] Dark mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created by [githubdanielxiao](https://github.com/githubdanielxiao)

## 📞 Support

For issues and questions, please open an GitHub issue in the repository.
