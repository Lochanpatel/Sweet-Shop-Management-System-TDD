# 🍬 Sweet Shop Management System (TDD Kata)

A full‑stack **Sweet Shop Management System** built as part of a **TDD Kata**, showcasing backend API design, authentication, inventory management, and a modern React frontend. The application supports both **customer** and **admin** roles with real‑time inventory updates and image‑based product listings.

---

## 🚀 Features

### 👤 Authentication

* User Registration & Login
* JWT‑based authentication (Demo Mode supported)
* Role‑based access (Admin / User)

### 🍭 Sweet Management

* View all available sweets
* Search sweets by name
* Filter sweets by category
* Purchase sweets (stock decreases automatically)
* Sold‑out handling (disabled purchase button)

### 🛠️ Admin Dashboard

* Add new sweets
* Upload sweet images
* Update sweet details
* Delete sweets (with confirmation)
* Restock inventory

### 📦 Inventory

* Real‑time stock updates
* Purchase & restock flows
* Inventory table for admins

---

## 🧑‍💻 Tech Stack

### Frontend

* **React + TypeScript**
* Vite
* Tailwind CSS

### Backend

* **Node.js + TypeScript**
* Express.js
* JWT Authentication

### Database

* SQLite (persistent, non in‑memory)

### Testing

* Jest (Unit & Integration tests – Backend)

---

## 📸 Screenshots

### 🔍 Search & Category Filter

![Search](https://github.com/Lochanpatel/-Sweet-Shop-Management-System/blob/aeb17aff299a7dff1deb45ac5d093c34d22ff37d/Screenshots/Screenshot%202025-12-14%20165946.png)

### 🔐 Login Page

![Login](https://github.com/Lochanpatel/-Sweet-Shop-Management-System/blob/aeb17aff299a7dff1deb45ac5d093c34d22ff37d/Screenshots/Screenshot%202025-12-14%20165959.png)

### 📝 Register Page

![Register](https://github.com/Lochanpatel/-Sweet-Shop-Management-System/blob/aeb17aff299a7dff1deb45ac5d093c34d22ff37d/Screenshots/Screenshot%202025-12-14%20170004.png)

### 🛠️ Admin – Add New Sweet

![Add Sweet](https://github.com/Lochanpatel/-Sweet-Shop-Management-System/blob/aeb17aff299a7dff1deb45ac5d093c34d22ff37d/Screenshots/Screenshot%202025-12-14%20170113.png)

### 📦 Inventory Management

![Inventory](https://github.com/Lochanpatel/-Sweet-Shop-Management-System/blob/aeb17aff299a7dff1deb45ac5d093c34d22ff37d/Screenshots/Screenshot%202025-12-14%20170105.png)

### 🔄 Restock Sweet

![Restock](https://github.com/Lochanpatel/-Sweet-Shop-Management-System/blob/aeb17aff299a7dff1deb45ac5d093c34d22ff37d/Screenshots/Screenshot%202025-12-14%20170139.png)

### 🗑️ Delete Sweet Confirmation

![Delete](https://github.com/Lochanpatel/-Sweet-Shop-Management-System/blob/aeb17aff299a7dff1deb45ac5d093c34d22ff37d/Screenshots/Screenshot%202025-12-14%20170148.png)

### 🏠 Update Sweet

![Dashboard](https://github.com/Lochanpatel/-Sweet-Shop-Management-System/blob/151a8229a8cee6e6472df1fb16d8d27afa104ce1/Screenshots/Screenshot%202025-12-14%20172923.png)


### 🛒 Purchase Sweet

![Purchase](https://github.com/Lochanpatel/-Sweet-Shop-Management-System/blob/e7fa1e25274570c07acd6f6bcdb6b1f2bda8cb7f/Screenshots/Screenshot%202025-12-14%20165902.png)

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Lochanpatel/Sweet-Shop-Management-System.git
cd Sweet-Shop-Management-System
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

### ✅ Test Report

* Unit tests for services
* Integration tests for API routes
* Authentication & inventory logic covered

(Test output screenshots included in `screenshots/` folder)

---

## 🤖 My AI Usage

I actively used **AI tools (ChatGPT)** during this project to improve productivity and code quality.

### Tools Used

* **ChatGPT**

### How I Used AI

* Generated initial backend boilerplate (controllers, routes, services)
* Assisted in writing Jest test cases following TDD
* Helped debug API and frontend integration issues
* Assisted in writing clean documentation (README)

### Reflection

AI significantly accelerated development and helped me follow best practices. However, I carefully reviewed, modified, and understood all generated code to ensure correctness and originality. AI acted as a **coding assistant**, not a replacement for my own understanding.

---

## 📂 Project Structure

```
Sweet-Shop-Management-System/
├── backend/
│   ├── src/
│   ├── tests/
│   └── prisma/
├── frontend/
│   ├── src/
│   └── public/
├── screenshots/
└── README.md
```

---

## 🌐 Demo Mode

* Any credentials work for login
* Admin access: `admin@test.com`

---

## 🏁 Status

✅ Frontend complete
✅ Backend API complete
✅ Authentication & Inventory
✅ Admin features

---

## 🙌 Author

**Lochan Patel**
---

⭐ If you like this project, feel free to star the repository!
