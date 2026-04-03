# 🚀 Smart Complaint Management System

A **Smart Complaint Management System** is an intelligent civic-tech platform designed to automate and streamline public issue reporting and resolution.

---

## 📌 Project Overview

This system allows users to report public issues such as:

- Electricity problems ⚡
- Water leakage 💧
- Road damage 🛣️
- Garbage issues 🗑️
- Traffic signal failures 🚦

The system automatically routes complaints to the correct department, assigns workers, and tracks progress until resolution.

---

## 🎯 Key Objectives

- Automate complaint routing
- Reduce manual work
- Improve response time
- Ensure transparency
- Provide real-time tracking

---

## 🧠 Core Features

### 1️⃣ Auto Department Routing
Complaints are automatically assigned to the correct department based on category.

```
Street Light → Electricity Department
Water Leakage → Water Department
Road Damage → Road Department
```

---

### 2️⃣ Smart Worker Auto Assignment
System assigns the **least busy worker** automatically.

- Based on department
- Based on workload
- Faster resolution

---

### 3️⃣ Priority Based Routing
Complaints are prioritized:

- 🔴 Critical (Traffic Signal Failure)
- 🟠 High (Road Damage)
- 🟡 Medium (Street Light)
- 🟢 Low (Minor Issues)

---

### 4️⃣ Fake Complaint Prevention
- Duplicate complaint detection
- Photo verification
- User reputation tracking

---

### 5️⃣ User Approval System
- User approves → Complaint closed
- User rejects → Rework assigned

---

### 6️⃣ Permission Request Module (Unique)
Users can request permissions for:

- Road digging
- Water connection
- Electric line work

---

### 7️⃣ Heatmap Analytics
- Area-wise complaint analysis
- Department performance tracking
- Smart decision making

---

## 👥 Roles

| Role | Description |
|------|------------|
| Super Admin | Full system control |
| Department Admin | Manages department complaints |
| Worker | Executes tasks |
| User | Submits complaints |
| Analyzer | Views analytics |

---

## 🏗️ Tech Stack

### Frontend
- React.js
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- JWT
- Google OAuth

---

## 📂 Project Structure

```
backend/
│
├── config/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── services/
└── server.js
```

---

## 🔄 Complaint Lifecycle

```
Submitted
↓
Under Review
↓
Worker Assigned
↓
In Progress
↓
Completed
↓
User Approval
↓
Closed
```

---

## ⚙️ Installation

```bash
git clone https://github.com/your-username/project-name.git
cd project-name
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
```



---

### 4️⃣ Fake Complaint Prevention
- Duplicate complaint detection
- Photo verification
- User reputation tracking

---

### 5️⃣ User Approval System
- User approves → Complaint closed
- User rejects → Rework assigned

---

### 6️⃣ Permission Request Module (Unique)
Users can request permissions for:

- Road digging
- Water connection
- Electric line work

---

### 7️⃣ Heatmap Analytics
- Area-wise complaint analysis
- Department performance tracking
- Smart decision making

---

## 👥 Roles

| Role | Description |
|------|------------|
| Super Admin | Full system control |
| Department Admin | Manages department complaints |
| Worker | Executes tasks |
| User | Submits complaints |
| Analyzer | Views analytics |

---

## 🏗️ Tech Stack

### Frontend
- React.js
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- JWT
- Google OAuth

---

## 📂 Project Structure

```

backend/
│
├── config/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── services/
└── server.js

```

---

## 🔄 Complaint Lifecycle

```

Submitted
↓
Under Review
↓
Worker Assigned
↓
In Progress
↓
Completed
↓
User Approval
↓
Closed

````

---

## ⚙️ Installation

```bash
git clone https://github.com/your-username/project-name.git
cd project-name
npm install
npm run dev
````

---

## 🔑 Environment Variables

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
```

---




