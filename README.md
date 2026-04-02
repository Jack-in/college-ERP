# 🎓 College ERP Dashboard

A modern, full-stack Enterprise Resource Planning (ERP) application engineered to manage comprehensive academic hierarchies, student admissions, and programmatic quotas with a beautiful data-driven user interface.

## 🚀 Tech Stack

### Frontend (`/edumerge`)
*   **Framework:** React 18 & Vite
*   **Routing:** React Router v6
*   **Styling:** Tailwind CSS & standard CSS
*   **Components:** Custom internal component library (Shadcn UI inspired)
*   **State & Fetching:** TanStack React Query & Axios
*   **Form Management:** React Hook Form & Zod Validation
*   **Deployment:** Vercel

### Backend (`/edumerge-backend`)
*   **Runtime:** Node.js & Express.js
*   **Database ORM:** Prisma
*   **Database:** SQLite (Easily configurable to PostgreSQL for production)
*   **Language:** TypeScript
*   **Deployment:** Render

---

## 🛠️ Key Features

*   **Multi-Tier Academic Hierarchy:** Dynamically manage Institutions > Campuses > Departments > Branches > Programs natively.
*   **Admission Officer Stepper:** A seamless 6-step wizard using `@stepperize/react` for student document collection, programmatic quota verification, and seat allocation.
*   **Live Dashboard Analytics:** Top-level metrics outlining application statuses, document verifications, quota limits, and performance KPI charts.

---

## 💻 Local Development Setup

To run this monorepo locally, you will need to open two separate terminal windows — one for the backend and one for the frontend.

### 1. Start the Backend API
Navigate to the backend directory, install the required dependencies, spin up the Prisma database, and start the development server.
```bash
cd edumerge-backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```
*The backend server will live-reload on `http://localhost:3000`.*

### 2. Start the Frontend UI
In a new terminal window, navigate to the frontend directory and start the Vite development server.
```bash
cd edumerge
npm install
npm run dev
```
*The frontend will natively proxy requests to your local backend.*

---

## 🌐 Production Deployment

live: https://college-erp-teal.vercel.app/
---
