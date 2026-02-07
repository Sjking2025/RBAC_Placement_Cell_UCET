# 🎓 College Placement Cell (CPC) Platform

![Status](https://img.shields.io/badge/Status-Development-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![License](https://img.shields.io/badge/License-MIT-purple)

## 🚀 Overview

The **College Placement Cell (CPC) Platform** is a next-generation, enterprise-grade web application designed to streamline the entire campus recruitment process. Built with a modern tech stack, it bridges the gap between **Students**, **Department Officers**, **Placement Coordinators**, and **Recruiters**.

This platform digitizes manual workflows, ensuring real-time data synchronization, role-based security, and seamless communication for high-stakes placement drives.

---

## 🛠️ Tech Stack

### **Frontend** (Client-Side)
- **Framework:** [React 18](https://react.dev/) (Vite)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + `clsx` + `tailwind-merge`
- **UI Components:** [Radix UI](https://www.radix-ui.com/) (Headless accessibility)
- **State Management:** React Context API
- **Forms:** React Hook Form + Zod (Schema Validation)
- **Data Visualization:** Recharts
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast

### **Backend** (Server-Side)
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** JWT (JSON Web Tokens) + Bcrypt
- **Security:** Helmet, CORS, Express Rate Limit
- **Logging:** Winston + Morgan

---

## ✨ Key Features

### 🔐 Role-Based Access Control (RBAC)
- **Admin:** Full system control, global student/staff management.
- **Department Officer:** Restricted access to *own* department students only. Can add/edit/delete students within their jurisdiction.
- **Student:** View profile, apply for jobs, track status.
- **Coordinator:** Assist in drive management (limited access).

### 📂 Bulk Data Management
- **One-Click Import:** Upload CSV files to bulk register students.
- **Auto-Mapping:** Intelligent header mapping for various CSV formats.
- **Validation:** Server-side checks for duplicates (Email/Roll No) and valid Department codes.
- **Error Reporting:** Detailed feedback on success/failure counts per import.

### 📊 Real-Time Dashboard
- **Analytics:** Placement stats, company insights, and student progress tracking.
- **Visuals:** Interactive charts for placement trends.

### 🛡️ Security First
- **Department Isolation:** Backend enforcement ensuring Officers cannot modify data outside their department.
- **Data Integrity:** Cascading deletes (User + Profile) to prevent orphaned records.
- **Secure Auth:** HttpOnly cookies and protected routes.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Git

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/college-placement-cell.git
    cd college-placement-cell
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Set up .env file (DB URL, JWT Secret)
    npx prisma migrate dev
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access App**
    Open `http://localhost:5173` in your browser.

---

## 🤝 Contribution

We welcome contributions! Please fork the repo and submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ for the Future of Campus Recruitment.*
