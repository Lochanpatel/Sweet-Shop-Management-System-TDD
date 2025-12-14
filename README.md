# Sweet Shop Management System (TDD Kata)

A full-stack Sweet Shop application built with Node.js, Express, and React, demonstrating strict Test-Driven Development (TDD) practices and modern inventory management logic.

## 🚀 Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma (SQLite), Jest, Supertest.
- **Frontend:** React 18, TypeScript, Tailwind CSS.
- **Authentication:** JWT & BCrypt.

## 🛠️ Setup Instructions

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database and run migrations:
   ```bash
   npm run migrate
   ```
4. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm start
   ```
   *Server runs on http://localhost:3001*

### Frontend Setup
1. In the root directory (assuming Vite/CRA structure):
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   *Frontend usually runs on http://localhost:5173 or 3000*

## 🧪 Running Tests

This project follows TDD. To verify the backend logic:

1. Go to `backend/`
2. Run tests:
   ```bash
   npm test
   ```
3. View coverage (if configured):
   ```bash
   npm test -- --coverage
   ```

**Expected Result:** A passing test suite covering Auth flows, Sweet CRUD operations, and Inventory purchase logic (fail on low stock).

## 🤖 My AI Usage (Mandatory)

**AI Tools Used:**
- **ChatGPT (GPT-4o):** Used to scaffold the initial `prisma.schema` and generate the Jest + Supertest boilerplate for the integration tests. It helped brainstorm the edge cases for the "purchase" endpoint (concurrency handling).
- **GitHub Copilot:** Used during the "Green" phase of TDD to auto-complete the Express controller logic based on the failing tests written in the previous step.

**Reflection:**
Using AI significantly accelerated the "Refactor" phase. I could write a failing test, write sloppy code to pass it, and then ask the AI to "clean this up and add types," which kept the momentum high. However, I had to be careful with the Auth middleware, as the AI initially suggested a deprecated method of extracting tokens.

## 📸 Git Commit Strategy (TDD)

Check the git log to see the Red-Green-Refactor cycle.
Example:
`test: add failing test for purchase logic` (RED)
`feat: implement purchase endpoint` (GREEN)
`refactor: extract transaction logic to service` (REFACTOR)

## 📄 License
MIT
