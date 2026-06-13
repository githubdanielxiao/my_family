# Family Management System - Development Guide

## 🎯 Project Overview

This is a family relationship management system designed to maintain genealogical information with role-based access control.

## 📁 Directory Structure

```
.
├── server.js                 # Main backend server
├── config/
│   └── database.js          # Database setup & schema
├── middleware/
│   └── auth.js              # Authentication & authorization
├── routes/
│   ├── auth.js              # Login, registration, password change
│   ├── members.js           # CRUD operations for family members
│   └── permissions.js       # Permission management
├── scripts/
│   ├── init-db.js           # Initialize empty database
│   └── seed-data.js         # Add demo data
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.js     # Login interface
│   │   │   └── MainPage.js      # Main application interface
│   │   └── styles/
│   └── package.json
└── README.md
```

## 🔐 Authentication Flow

1. User enters phone number and password on login page
2. Backend validates credentials against database
3. JWT token is issued on successful authentication
4. Token is stored in localStorage
5. All API requests include the token in Authorization header
6. If `force_password_change` is true, user is prompted to change password

## 👥 Permission System

### Permission Structure

```
Permission {
  can_view: boolean,              // Can see member info
  can_edit: boolean,              // Can modify member info
  can_manage_permissions: boolean // Can grant/revoke permissions
}
```

### Permission Inheritance

When a user is granted permission on a member node, they can:
- View that member's information
- View all children (descendants) based on granted permissions
- Edit information only if `can_edit` is true
- Manage permissions for children if `can_manage_permissions` is true

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT 0,
  force_password_change BOOLEAN DEFAULT 1
);
```

### Members Table
```sql
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  user_id TEXT,                    -- Family admin or creator
  name TEXT NOT NULL,
  gender TEXT,
  birth_date DATE,
  phone TEXT,
  address TEXT,
  xinshijie_address TEXT,
  father_id TEXT,                  -- Parent relationship
  mother_id TEXT,                  -- Parent relationship
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Permissions Table
```sql
CREATE TABLE permissions (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,         -- Which member
  user_id TEXT NOT NULL,           -- Which user
  can_view BOOLEAN DEFAULT 1,
  can_edit BOOLEAN DEFAULT 0,
  can_manage_permissions BOOLEAN DEFAULT 0,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🚀 Development Workflow

### 1. Setup Environment

```bash
# Install dependencies
bash setup.sh

# Or manually:
npm install
node scripts/init-db.js
node scripts/seed-data.js
cd client && npm install
```

### 2. Start Development

```bash
# Run both backend and frontend
npm run dev

# Or separately:
node server.js          # Terminal 1
cd client && npm start  # Terminal 2
```

### 3. Make Changes

- Backend changes: Hot reload not enabled (restart server)
- Frontend changes: Hot reload enabled (auto-refresh)

### 4. Test

```bash
# Use demo credentials
Phone: 13800138000
Password: 13800138000
```

## 🔌 API Examples

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "password": "13800138000"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "phone": "13800138000",
    "is_admin": true,
    "force_password_change": false
  }
}
```

### Get Family Tree

```bash
curl -X GET http://localhost:5000/api/members/tree \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Member Details

```bash
curl -X GET http://localhost:5000/api/members/{member_id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Member

```bash
curl -X PUT http://localhost:5000/api/members/{member_id} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name", "birth_date": "1990-01-01"}'
```

## 🐛 Common Issues & Solutions

### Issue: "Port 5000 already in use"
**Solution**: Change PORT in .env file or kill the process:
```bash
lsof -i :5000
kill -9 <PID>
```

### Issue: "Database locked"
**Solution**: Close other connections and remove old database:
```bash
rm -f data/family.db
node scripts/init-db.js
node scripts/seed-data.js
```

### Issue: "Blank page after login"
**Solution**: Check browser console for errors and ensure API_URL matches:
```javascript
// In client/src/pages/LoginPage.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## 📚 Frontend Component Structure

### LoginPage.js
- Phone number input (pattern: 1[3-9]\d{9})
- Password input (plaintext for demo, masked in UI)
- Auto-redirect to change password if needed

### MainPage.js
- **Header**: Family name, logo, user info, logout
- **Left Sidebar**: Family tree (Tree component)
- **Right Content**: Selected member's information
- **Edit Mode**: Drawer for editing member info

## 🎨 Styling

All components use Ant Design's theming system:

```javascript
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

<ConfigProvider locale={zhCN}>
  {/* Your app */}
</ConfigProvider>
```

## 📝 TODO / Future Features

- [ ] Add photo support
- [ ] Implement permission UI
- [ ] Add family events
- [ ] Export family tree
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile-responsive improvements
- [ ] Add tests

## 🔗 Useful Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Ant Design Components](https://ant.design/components/overview/)
- [SQLite Documentation](https://www.sqlite.org/)
- [JWT Introduction](https://jwt.io/introduction)

---

**Last Updated**: 2024
**Status**: Active Development
