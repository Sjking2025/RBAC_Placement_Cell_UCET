# College Placement Cell - Complete Production System Blueprint

## 🎯 Project Overview

A comprehensive, production-ready placement management system for colleges with role-based access control, job management, student profiles, company management, interview scheduling, analytics, and notifications.

---

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Role Hierarchy & Permissions](#role-hierarchy--permissions)
4. [Database Schema](#database-schema)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Feature Implementation Guide](#feature-implementation-guide)
8. [Security & Authentication](#security--authentication)
9. [Deployment Strategy](#deployment-strategy)
10. [Testing Strategy](#testing-strategy)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  React.js + Tailwind CSS + shadcn/ui + Axios           │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                      │
│         Express.js + JWT Auth + Rate Limiting           │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                    │
│    Controllers + Services + Middleware + Validators     │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                      │
│              PostgreSQL + Prisma ORM / Sequelize        │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                     │
│    Email Service + File Storage (AWS S3/Cloudinary)    │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18+
- **Styling**: Tailwind CSS 3+
- **UI Components**: shadcn/ui
- **State Management**: React Context API / Zustand / Redux Toolkit
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts / Chart.js
- **Date Handling**: date-fns
- **File Upload**: react-dropzone
- **Notifications**: react-hot-toast / sonner

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma / Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi / Zod
- **File Upload**: Multer
- **Email**: Nodemailer
- **Security**: helmet, cors, express-rate-limit
- **Logging**: Winston / Morgan
- **Documentation**: Swagger / OpenAPI

### Database
- **Primary DB**: PostgreSQL 14+
- **Caching**: Redis (optional, for sessions)

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm / yarn / pnpm
- **Environment**: dotenv
- **API Testing**: Postman / Thunder Client
- **Code Quality**: ESLint, Prettier

---

## 👥 Role Hierarchy & Permissions

### Role Structure
```
Level 1: Placement Officer/Admin (Super Admin)
    ↓
Level 2: Department Placement Officers
    ↓
Level 3: Department Placement Coordinators
    ↓
Level 4: Students
```

### Detailed Permissions Matrix

| Feature | Admin | Dept Officer | Coordinator | Student |
|---------|-------|--------------|-------------|---------|
| **User Management** |
| Create/Edit Users | ✅ All | ✅ Dept Only | ❌ | ❌ |
| Delete Users | ✅ | ✅ Dept Only | ❌ | ❌ |
| View All Users | ✅ | ✅ Dept Only | ✅ Dept Only | ❌ |
| **Company Management** |
| Register Company | ✅ | ✅ | ✅ | ❌ |
| Approve Company | ✅ | ✅ Dept Only | ❌ | ❌ |
| Edit Company | ✅ | ✅ | ✅ | ❌ |
| View Companies | ✅ | ✅ | ✅ | ✅ |
| **Job Postings** |
| Create Job | ✅ | ✅ | ✅ | ❌ |
| Edit/Delete Job | ✅ | ✅ Dept Only | ✅ Own Only | ❌ |
| Approve Job | ✅ | ✅ Dept Only | ❌ | ❌ |
| View Jobs | ✅ | ✅ | ✅ | ✅ Eligible |
| **Applications** |
| Apply to Job | ❌ | ❌ | ❌ | ✅ |
| View Applications | ✅ All | ✅ Dept Only | ✅ Dept Only | ✅ Own Only |
| Shortlist Students | ✅ | ✅ Dept Only | ✅ Dept Only | ❌ |
| **Interview Scheduling** |
| Schedule Interview | ✅ | ✅ Dept Only | ✅ Dept Only | ❌ |
| Reschedule Interview | ✅ | ✅ Dept Only | ✅ Dept Only | ❌ |
| View Schedule | ✅ | ✅ Dept Only | ✅ Dept Only | ✅ Own Only |
| **Student Profiles** |
| Edit Own Profile | ❌ | ❌ | ❌ | ✅ |
| View Profiles | ✅ All | ✅ Dept Only | ✅ Dept Only | ✅ Own Only |
| Approve Profile | ✅ | ✅ Dept Only | ❌ | ❌ |
| **Announcements** |
| Create Announcement | ✅ | ✅ Dept Only | ✅ Dept Only | ❌ |
| Edit/Delete | ✅ | ✅ Own/Dept | ✅ Own Only | ❌ |
| View Announcements | ✅ | ✅ | ✅ | ✅ |
| **Analytics** |
| View Global Stats | ✅ | ❌ | ❌ | ❌ |
| View Dept Stats | ✅ | ✅ Dept Only | ✅ Dept Only | ❌ |
| View Own Stats | ❌ | ❌ | ❌ | ✅ |

---

## 🗄️ Database Schema

### Complete PostgreSQL Schema

```sql
-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

CREATE TYPE user_role AS ENUM (
    'admin',
    'dept_officer',
    'coordinator',
    'student'
);

CREATE TYPE user_status AS ENUM (
    'active',
    'inactive',
    'suspended'
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department_id INTEGER REFERENCES departments(id),
    profile_picture VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- STUDENT PROFILES
-- =============================================

CREATE TYPE degree_type AS ENUM ('BTech', 'MTech', 'MBA', 'MCA', 'BSc', 'MSc', 'BBA', 'BCA');

CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    degree degree_type NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    batch_year INTEGER NOT NULL,
    current_semester INTEGER,
    cgpa DECIMAL(4,2),
    tenth_percentage DECIMAL(5,2),
    twelfth_percentage DECIMAL(5,2),
    active_backlogs INTEGER DEFAULT 0,
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    resume_url VARCHAR(500),
    profile_completed BOOLEAN DEFAULT FALSE,
    placement_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_skills (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_projects (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    technologies TEXT,
    start_date DATE,
    end_date DATE,
    project_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_certifications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(255),
    credential_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_internships (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- COMPANIES
-- =============================================

CREATE TYPE company_status AS ENUM ('pending', 'approved', 'rejected', 'active', 'inactive');

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    industry VARCHAR(100),
    description TEXT,
    logo_url VARCHAR(500),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    status company_status DEFAULT 'pending',
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_contacts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- JOB POSTINGS
-- =============================================

CREATE TYPE job_type AS ENUM ('full_time', 'internship', 'part_time', 'contract');
CREATE TYPE job_status AS ENUM ('draft', 'pending', 'approved', 'active', 'closed', 'cancelled');

CREATE TABLE job_postings (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    job_type job_type NOT NULL,
    location VARCHAR(255),
    work_mode VARCHAR(50),
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'INR',
    positions_available INTEGER DEFAULT 1,
    required_cgpa DECIMAL(4,2),
    allowed_backlogs INTEGER DEFAULT 0,
    eligible_departments INTEGER[],
    eligible_degrees degree_type[],
    eligible_batches INTEGER[],
    skills_required TEXT[],
    responsibilities TEXT,
    requirements TEXT,
    perks TEXT,
    application_deadline DATE,
    status job_status DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- APPLICATIONS
-- =============================================

CREATE TYPE application_status AS ENUM (
    'submitted',
    'under_review',
    'shortlisted',
    'rejected',
    'interview_scheduled',
    'selected',
    'offer_accepted',
    'offer_rejected',
    'withdrawn'
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES job_postings(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    status application_status DEFAULT 'submitted',
    cover_letter TEXT,
    resume_url VARCHAR(500),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(id),
    notes TEXT,
    UNIQUE(job_id, student_id)
);

-- =============================================
-- INTERVIEW SCHEDULING
-- =============================================

CREATE TYPE interview_type AS ENUM ('technical', 'hr', 'aptitude', 'group_discussion', 'final');
CREATE TYPE interview_mode AS ENUM ('online', 'offline', 'hybrid');
CREATE TYPE interview_status AS ENUM ('scheduled', 'rescheduled', 'completed', 'cancelled', 'no_show');

CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    interview_type interview_type NOT NULL,
    interview_mode interview_mode NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(255),
    meeting_link VARCHAR(500),
    interviewer_names TEXT,
    status interview_status DEFAULT 'scheduled',
    notes TEXT,
    feedback TEXT,
    result VARCHAR(50),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ANNOUNCEMENTS & NOTIFICATIONS
-- =============================================

CREATE TYPE announcement_type AS ENUM ('general', 'urgent', 'job_posting', 'event', 'deadline');
CREATE TYPE announcement_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type announcement_type DEFAULT 'general',
    priority announcement_priority DEFAULT 'medium',
    target_roles user_role[],
    target_departments INTEGER[],
    target_batches INTEGER[],
    attachment_url VARCHAR(500),
    is_pinned BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE notification_type AS ENUM (
    'application_update',
    'interview_scheduled',
    'announcement',
    'profile_update',
    'job_posted',
    'system'
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PLACEMENT STATISTICS
-- =============================================

CREATE TABLE placement_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student_profiles(id) ON DELETE CASCADE,
    company_id INTEGER REFERENCES companies(id),
    job_id INTEGER REFERENCES job_postings(id),
    offer_date DATE,
    joining_date DATE,
    package_lpa DECIMAL(10,2),
    job_title VARCHAR(255),
    job_location VARCHAR(255),
    offer_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE placement_stats_cache (
    id SERIAL PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    total_students INTEGER DEFAULT 0,
    placed_students INTEGER DEFAULT 0,
    average_package DECIMAL(10,2),
    highest_package DECIMAL(10,2),
    lowest_package DECIMAL(10,2),
    total_companies INTEGER DEFAULT 0,
    total_offers INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(academic_year, department_id)
);

-- =============================================
-- ACTIVITY LOGS (Audit Trail)
-- =============================================

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_student_roll ON student_profiles(roll_number);
CREATE INDEX idx_student_dept ON student_profiles(department_id);
CREATE INDEX idx_student_batch ON student_profiles(batch_year);
CREATE INDEX idx_job_status ON job_postings(status);
CREATE INDEX idx_job_company ON job_postings(company_id);
CREATE INDEX idx_application_student ON applications(student_id);
CREATE INDEX idx_application_job ON applications(job_id);
CREATE INDEX idx_application_status ON applications(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_announcements_published ON announcements(published);
CREATE INDEX idx_interviews_date ON interviews(scheduled_date);
```

---

## 🔧 Backend Implementation

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   ├── env.js               # Environment variables
│   │   └── constants.js         # App constants
│   ├── models/                  # Prisma/Sequelize models
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Company.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── Interview.js
│   │   └── Announcement.js
│   ├── controllers/             # Route controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── studentController.js
│   │   ├── companyController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── interviewController.js
│   │   ├── announcementController.js
│   │   └── analyticsController.js
│   ├── services/                # Business logic
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   ├── fileService.js
│   │   ├── notificationService.js
│   │   └── analyticsService.js
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js              # JWT verification
│   │   ├── rbac.js              # Role-based access
│   │   ├── validation.js        # Request validation
│   │   ├── errorHandler.js      # Error handling
│   │   └── upload.js            # File upload
│   ├── routes/                  # API routes
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── students.routes.js
│   │   ├── companies.routes.js
│   │   ├── jobs.routes.js
│   │   ├── applications.routes.js
│   │   ├── interviews.routes.js
│   │   ├── announcements.routes.js
│   │   └── analytics.routes.js
│   ├── validators/              # Input validation schemas
│   │   ├── authValidator.js
│   │   ├── studentValidator.js
│   │   ├── companyValidator.js
│   │   └── jobValidator.js
│   ├── utils/                   # Utility functions
│   │   ├── logger.js
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── prisma/
│   └── schema.prisma            # Prisma schema
├── tests/                       # Test files
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Key Backend Files

#### 1. `package.json`

```json
{
  "name": "placement-cell-backend",
  "version": "1.0.0",
  "description": "Placement Cell Management System Backend",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "npx prisma migrate dev",
    "seed": "node prisma/seed.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "@prisma/client": "^5.7.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.11.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.7",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4",
    "winston": "^3.11.0",
    "morgan": "^1.10.0",
    "pg": "^8.11.3",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "prisma": "^5.7.0",
    "jest": "^29.7.0",
    "@types/node": "^20.10.5"
  }
}
```

#### 2. `.env.example`

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/placement_cell?schema=public"

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@placementcell.com
FROM_NAME=Placement Cell

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=

# Frontend URL
CLIENT_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 3. `src/server.js`

```javascript
const app = require('./app');
const { PrismaClient } = require('@prisma/client');
const logger = require('./utils/logger');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Test database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  await connectDatabase();
  
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await prisma.$disconnect();
    server.close(() => {
      logger.info('Process terminated');
    });
  });
}

startServer();
```

#### 4. `src/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const studentRoutes = require('./routes/students.routes');
const companyRoutes = require('./routes/companies.routes');
const jobRoutes = require('./routes/jobs.routes');
const applicationRoutes = require('./routes/applications.routes');
const interviewRoutes = require('./routes/interviews.routes');
const announcementRoutes = require('./routes/announcements.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/students`, studentRoutes);
app.use(`/api/${API_VERSION}/companies`, companyRoutes);
app.use(`/api/${API_VERSION}/jobs`, jobRoutes);
app.use(`/api/${API_VERSION}/applications`, applicationRoutes);
app.use(`/api/${API_VERSION}/interviews`, interviewRoutes);
app.use(`/api/${API_VERSION}/announcements`, announcementRoutes);
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
```

#### 5. `src/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Verify JWT token and attach user to request
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await prisma.users.findUnique({
        where: { id: decoded.id },
        include: {
          user_profiles: true,
          student_profiles: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive or suspended'
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize based on roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Check department access
 */
exports.checkDepartmentAccess = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const user = req.user;

    // Admin has access to all departments
    if (user.role === 'admin') {
      return next();
    }

    // Check if user belongs to the department
    const userProfile = await prisma.user_profiles.findUnique({
      where: { user_id: user.id }
    });

    if (userProfile.department_id !== parseInt(departmentId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this department'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
```

#### 6. `src/middleware/rbac.js`

```javascript
/**
 * Role-Based Access Control Middleware
 */

const permissions = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    companies: ['create', 'read', 'update', 'delete', 'approve'],
    jobs: ['create', 'read', 'update', 'delete', 'approve'],
    applications: ['read', 'update', 'shortlist'],
    interviews: ['create', 'read', 'update', 'delete'],
    announcements: ['create', 'read', 'update', 'delete'],
    analytics: ['read_all'],
    students: ['read', 'update', 'approve']
  },
  dept_officer: {
    users: ['create_dept', 'read_dept', 'update_dept'],
    companies: ['create', 'read', 'update', 'approve_dept'],
    jobs: ['create', 'read', 'update_dept', 'approve_dept'],
    applications: ['read_dept', 'update_dept', 'shortlist_dept'],
    interviews: ['create_dept', 'read_dept', 'update_dept', 'delete_dept'],
    announcements: ['create_dept', 'read', 'update_own', 'delete_own'],
    analytics: ['read_dept'],
    students: ['read_dept', 'approve_dept']
  },
  coordinator: {
    companies: ['create', 'read', 'update'],
    jobs: ['create', 'read', 'update_own'],
    applications: ['read_dept', 'shortlist_dept'],
    interviews: ['create_dept', 'read_dept', 'update_dept'],
    announcements: ['create_dept', 'read', 'update_own', 'delete_own'],
    analytics: ['read_dept'],
    students: ['read_dept']
  },
  student: {
    jobs: ['read_eligible'],
    applications: ['create', 'read_own', 'withdraw_own'],
    interviews: ['read_own'],
    announcements: ['read'],
    profile: ['read_own', 'update_own'],
    analytics: ['read_own']
  }
};

/**
 * Check if user has permission for an action
 */
exports.hasPermission = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userPermissions = permissions[userRole];

    if (!userPermissions || !userPermissions[resource]) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!userPermissions[resource].includes(action)) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to ${action} ${resource}`
      });
    }

    next();
  };
};

/**
 * Check ownership of resource
 */
exports.checkOwnership = (model, idField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idField];
      const userId = req.user.id;
      const userRole = req.user.role;

      // Admins bypass ownership check
      if (userRole === 'admin') {
        return next();
      }

      // Implementation depends on the model
      // This is a generic example
      const resource = await prisma[model].findUnique({
        where: { id: parseInt(resourceId) }
      });

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if user owns the resource
      if (resource.created_by !== userId && resource.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = exports;
```

#### 7. `src/controllers/authController.js`

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public (or Admin only for creating users)
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, departmentId, ...otherData } = req.body;

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.users.create({
        data: {
          email,
          password_hash: hashedPassword,
          role,
          status: 'active'
        }
      });

      // Create user profile
      await tx.user_profiles.create({
        data: {
          user_id: newUser.id,
          first_name: firstName,
          last_name: lastName,
          department_id: departmentId
        }
      });

      // If student, create student profile
      if (role === 'student') {
        await tx.student_profiles.create({
          data: {
            user_id: newUser.id,
            roll_number: otherData.rollNumber,
            degree: otherData.degree,
            department_id: departmentId,
            batch_year: otherData.batchYear,
            current_semester: otherData.currentSemester || 1
          }
        });
      }

      return newUser;
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, firstName);

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        user_profiles: true,
        student_profiles: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or suspended'
      });
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.password_hash;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: {
        user_profiles: {
          include: {
            departments: true
          }
        },
        student_profiles: {
          include: {
            student_skills: true,
            student_projects: true,
            student_certifications: true
          }
        }
      }
    });

    // Remove password
    delete user.password_hash;

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // Save reset token
    await prisma.users.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expiry: new Date(Date.now() + 3600000) // 1 hour
      }
    });

    // Send email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetUrl);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user
    const user = await prisma.users.findFirst({
      where: {
        id: decoded.id,
        reset_token: token,
        reset_token_expiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
```

---

## 💻 Frontend Implementation

### Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── api/                    # API client
│   │   ├── axios.js
│   │   ├── authApi.js
│   │   ├── studentApi.js
│   │   ├── companyApi.js
│   │   ├── jobApi.js
│   │   └── ...
│   ├── components/             # Reusable components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   ├── common/
│   │   │   ├── Table.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Badge.jsx
│   │   └── features/
│   │       ├── JobCard.jsx
│   │       ├── StudentProfile.jsx
│   │       └── ...
│   ├── pages/                  # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── OfficerDashboard.jsx
│   │   │   ├── CoordinatorDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── students/
│   │   │   ├── StudentList.jsx
│   │   │   ├── StudentProfile.jsx
│   │   │   └── EditProfile.jsx
│   │   ├── companies/
│   │   │   ├── CompanyList.jsx
│   │   │   ├── CompanyDetails.jsx
│   │   │   └── AddCompany.jsx
│   │   ├── jobs/
│   │   │   ├── JobList.jsx
│   │   │   ├── JobDetails.jsx
│   │   │   ├── CreateJob.jsx
│   │   │   └── MyApplications.jsx
│   │   ├── interviews/
│   │   │   ├── InterviewSchedule.jsx
│   │   │   └── ScheduleInterview.jsx
│   │   ├── announcements/
│   │   │   ├── AnnouncementList.jsx
│   │   │   └── CreateAnnouncement.jsx
│   │   └── analytics/
│   │       └── Analytics.jsx
│   ├── context/                # React Context
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── NotificationContext.jsx
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useDebounce.js
│   ├── utils/                  # Utility functions
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── styles/                 # Global styles
│   │   └── globals.css
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

### Key Frontend Files

#### 1. `package.json`

```json
{
  "name": "placement-cell-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.3",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.3",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2"
  }
}
```

#### 2. `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### 3. `src/api/axios.js`

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

#### 4. `src/context/AuthContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await axios.get('/auth/me');
        setUser(data.data);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
      toast.success('Login successful!');
      
      // Redirect based on role
      switch (data.data.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'dept_officer':
          navigate('/officer/dashboard');
          break;
        case 'coordinator':
          navigate('/coordinator/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post('/auth/register', userData);
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 🎨 Feature Implementation Guide

### 1. Job Posting & Applications

#### Backend: Job Controller

```javascript
// src/controllers/jobController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all jobs (with filters)
 * @route   GET /api/v1/jobs
 * @access  Private
 */
exports.getJobs = async (req, res, next) => {
  try {
    const { status, type, departmentId, companyId, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};

    // Apply filters based on role
    if (req.user.role === 'student') {
      // Students see only active jobs they're eligible for
      where.status = 'active';
      const student = req.user.student_profiles;
      
      where.AND = [
        { required_cgpa: { lte: student.cgpa } },
        { allowed_backlogs: { gte: student.active_backlogs } },
        { eligible_departments: { has: student.department_id } },
        { eligible_batches: { has: student.batch_year } }
      ];
    } else if (req.user.role === 'dept_officer' || req.user.role === 'coordinator') {
      // Officers and coordinators see jobs from their department
      where.eligible_departments = { has: req.user.user_profiles.department_id };
    }

    // Additional filters
    if (status) where.status = status;
    if (type) where.job_type = type;
    if (companyId) where.company_id = parseInt(companyId);
    if (departmentId) where.eligible_departments = { has: parseInt(departmentId) };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job_postings.findMany({
        where,
        include: {
          companies: true,
          users: { select: { email: true, user_profiles: true } }
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.job_postings.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create job posting
 * @route   POST /api/v1/jobs
 * @access  Private (Admin, Officer, Coordinator)
 */
exports.createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      created_by: req.user.id,
      status: req.user.role === 'admin' ? 'active' : 'pending'
    };

    const job = await prisma.job_postings.create({
      data: jobData,
      include: { companies: true }
    });

    // Create notifications for eligible students
    if (job.status === 'active') {
      await notifyEligibleStudents(job);
    }

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply to a job
 * @route   POST /api/v1/jobs/:id/apply
 * @access  Private (Student)
 */
exports.applyToJob = async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id);
    const studentId = req.user.student_profiles.id;
    const { coverLetter, resumeUrl } = req.body;

    // Check if already applied
    const existingApplication = await prisma.applications.findFirst({
      where: { job_id: jobId, student_id: studentId }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Check eligibility
    const job = await prisma.job_postings.findUnique({
      where: { id: jobId }
    });
    
    const student = req.user.student_profiles;
    
    if (student.cgpa < job.required_cgpa) {
      return res.status(400).json({
        success: false,
        message: 'You do not meet the CGPA requirement'
      });
    }

    if (student.active_backlogs > job.allowed_backlogs) {
      return res.status(400).json({
        success: false,
        message: 'You have more backlogs than allowed'
      });
    }

    // Create application
    const application = await prisma.applications.create({
      data: {
        job_id: jobId,
        student_id: studentId,
        cover_letter: coverLetter,
        resume_url: resumeUrl || student.resume_url,
        status: 'submitted'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    next(error);
  }
};
```

#### Frontend: Job List Component

```jsx
// src/pages/jobs/JobList.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import JobCard from '../../components/features/JobCard';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, Filter } from 'lucide-react';

export default function JobList() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchJobs();
  }, [filters, search]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/jobs', {
        params: { ...filters, search }
      });
      setJobs(data.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Opportunities</h1>
        {['admin', 'dept_officer', 'coordinator'].includes(user?.role) && (
          <Button onClick={() => navigate('/jobs/create')}>
            Post New Job
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter size={20} className="mr-2" />
          Filters
        </Button>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Student Profile Management

### 3. Interview Scheduling

### 4. Analytics Dashboard

### 5. Announcements & Notifications

*(Each feature follows similar pattern with backend controller, API routes, frontend components)*

---

## 🔐 Security & Authentication

### Security Best Practices

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum password requirements
   - Password reset with expiring tokens

2. **JWT Security**
   - Short-lived access tokens
   - Refresh token rotation
   - Token blacklisting for logout

3. **Input Validation**
   - Joi/Zod schemas for all inputs
   - SQL injection prevention (Prisma ORM)
   - XSS protection

4. **Rate Limiting**
   - API rate limiting
   - Login attempt limiting
   - DDoS protection

5. **HTTPS Only**
   - Force HTTPS in production
   - Secure cookie flags
   - HSTS headers

6. **CORS Configuration**
   - Whitelist specific origins
   - Credentials handling
   - Preflight requests

7. **File Upload Security**
   - File type validation
   - Size limits
   - Virus scanning
   - Secure storage

---

## 🚀 Deployment Strategy

### Development Workflow

```bash
# Backend
cd backend
npm install
npm run migrate
npm run seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production Deployment

#### Option 1: Traditional VPS (DigitalOcean, AWS EC2)

```bash
# Backend
pm2 start src/server.js --name placement-api
pm2 save
pm2 startup

# Frontend
npm run build
# Serve with Nginx
```

#### Option 2: Platform as a Service

**Backend:**
- Render
- Railway
- Heroku
- Vercel (Serverless)

**Frontend:**
- Vercel
- Netlify
- Cloudflare Pages

**Database:**
- Supabase (PostgreSQL)
- Neon
- Railway
- AWS RDS

### Environment Configuration

```bash
# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=strong_random_secret
CLIENT_URL=https://yourdomain.com
```

---

## 🧪 Testing Strategy

### Backend Testing

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Authentication', () => {
  test('POST /api/v1/auth/register - Success', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test@1234',
        role: 'student',
        firstName: 'Test',
        lastName: 'User'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/v1/auth/login - Success', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test@1234'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });
});
```

### Frontend Testing

```javascript
// src/tests/Login.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../pages/auth/Login';

test('renders login form', () => {
  render(<Login />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});
```

---

## 📊 Database Seeding

```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create departments
  const cse = await prisma.departments.create({
    data: { name: 'Computer Science', code: 'CSE' }
  });

  const ece = await prisma.departments.create({
    data: { name: 'Electronics', code: 'ECE' }
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const admin = await prisma.users.create({
    data: {
      email: 'admin@college.edu',
      password_hash: hashedPassword,
      role: 'admin',
      status: 'active',
      user_profiles: {
        create: {
          first_name: 'Admin',
          last_name: 'User',
          department_id: cse.id
        }
      }
    }
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 📝 API Documentation Examples

### Authentication Endpoints

```
POST   /api/v1/auth/register          Register new user
POST   /api/v1/auth/login             Login user
GET    /api/v1/auth/me                Get current user
POST   /api/v1/auth/logout            Logout user
POST   /api/v1/auth/forgot-password   Request password reset
POST   /api/v1/auth/reset-password    Reset password
```

### Job Endpoints

```
GET    /api/v1/jobs                   Get all jobs
POST   /api/v1/jobs                   Create job posting
GET    /api/v1/jobs/:id               Get job details
PUT    /api/v1/jobs/:id               Update job
DELETE /api/v1/jobs/:id               Delete job
POST   /api/v1/jobs/:id/apply         Apply to job
GET    /api/v1/jobs/:id/applications  Get job applications
```

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Setup project structure
- [ ] Database schema & migrations
- [ ] Authentication system
- [ ] Basic frontend layout

### Phase 2: Core Features (Week 3-4)
- [ ] User management
- [ ] Student profiles
- [ ] Company management
- [ ] Job postings

### Phase 3: Advanced Features (Week 5-6)
- [ ] Application system
- [ ] Interview scheduling
- [ ] Notifications
- [ ] Announcements

### Phase 4: Analytics & Polish (Week 7-8)
- [ ] Analytics dashboard
- [ ] Reports generation
- [ ] Email notifications
- [ ] Testing & bug fixes

### Phase 5: Deployment (Week 9)
- [ ] Production setup
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation

---

## 🔧 Additional Considerations

### Performance Optimization
- Database indexing
- Query optimization
- Caching (Redis)
- CDN for static assets
- Image optimization
- Lazy loading

### Scalability
- Horizontal scaling
- Load balancing
- Database replication
- Microservices architecture (future)

### Monitoring
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring
- Log aggregation

### Backup & Recovery
- Daily database backups
- File storage backups
- Disaster recovery plan
- Data retention policies

---

## 📚 Resources & Documentation

### Official Documentation
- [React Docs](https://react.dev)
- [Express.js](https://expressjs.com)
- [Prisma](https://www.prisma.io)
- [PostgreSQL](https://www.postgresql.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

### Tutorials & Guides
- JWT Authentication
- Role-based Access Control
- File Upload Handling
- Email Integration
- Payment Gateway (if needed)

---

## 🎨 Design System

### Color Palette (Example)
```css
:root {
  --primary: #2563eb;      /* Blue */
  --secondary: #10b981;    /* Green */
  --accent: #f59e0b;       /* Amber */
  --danger: #ef4444;       /* Red */
  --success: #22c55e;      /* Light Green */
  --warning: #f97316;      /* Orange */
  --info: #3b82f6;         /* Light Blue */
}
```

### Typography
- Headings: Inter, Poppins, or custom
- Body: System fonts for performance
- Monospace: For code/data

---

This blueprint provides a complete foundation for building your placement cell system. Each section can be expanded with actual implementation code. Would you like me to provide the complete code for any specific feature or component?
