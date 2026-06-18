# 家族关系管理系统

## 项目概述
一个倒型树形的家族成员关系管理网站，具有完整的权限控制系统。

## 核心功能

### 1. 用户认证
- 手机号码登录（明文显示）
- 初次登录强制修改密码
- JWT令牌认证

### 2. 家族树管理
- 树形结构展示
- 支持多级家族成员
- 父亲、母亲、自己、孩子等关系

### 3. 权限管理
- 基于节点的权限控制
- 节点及子树权限继承
- 管理员权限配置
- 节点信息修改权限

### 4. 成员信息
每个节点包含：
- 姓名
- 出生日期
- 性别
- 家庭住址
- 手机号码
- 新世界地址信息

## 项目结构

```
.
├── src/
│   ├── server.js              # Express服务器
│   ├── db/                    # 数据库相关
│   │   ├── schema.sql         # 数据库架构
│   │   └── init.js            # 数据库初始化
│   ├── routes/                # API路由
│   │   ├── auth.js            # 认证相关
│   │   ├── family.js          # 家族树相关
│   │   └── permissions.js     # 权限相关
│   ├── middleware/            # 中间件
│   │   ├── auth.js            # 认证中间件
│   │   └── permission.js      # 权限检查中间件
│   ├── controllers/           # 业务逻辑
│   └── utils/                 # 工具函数
├── public/
│   ├── index.html             # 主HTML
│   └── assets/
├── src-ui/
│   ├── App.jsx                # React主应用
│   ├── pages/
│   │   ├── Login.jsx          # 登录页
│   │   └── Dashboard.jsx      # 主仪表板
│   ├── components/
│   │   ├── FamilyTree.jsx     # 树形组件
│   │   ├── MemberInfo.jsx     # 成员信息面板
│   │   └── PermissionManager.jsx # 权限管理器
│   └── styles/
├── package.json
└── README.md
```

## 快速开始

```bash
npm install
npm run dev
```

## 安全注意

⚠️ **本系统使用明文显示密码，仅用于演示和家族内部使用。生产环境应采用更安全的方案。**
