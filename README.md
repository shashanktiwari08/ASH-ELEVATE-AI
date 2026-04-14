# ERP Lite - Company Management System

A premium, full-stack Company Management System for service-based businesses (Hospitality, Catering, Event Management). 

## 🚀 Features
- **Dashboard**: Real-time analytics, revenue/expense trends, and activity feed.
- **Client Management**: Full CRM with booking history and automated invoices.
- **Vendor & Staff Management**: Track work assignments and pending payments.
- **Automated Invoicing**: Professional PDF generation with GST calculations.
- **Ledger System**: Track all incoming and outgoing payments.
- **Role-based Access**: Admin and Manager roles.
- **Premium UI**: Dark/Light mode support, smooth animations (Framer Motion), and responsive design.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, PDFKit.

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or on Atlas)

### 2. Backend Setup
```bash
cd erp-system/server
npm install
node seed.js  # This will create an admin user and dummy data
npm run dev
```
**Admin Credentials:**
- **Email:** `admin@erp.com`
- **Password:** `password123`

### 3. Frontend Setup
```bash
cd erp-system/client
npm install
npm run dev
```
Access the app at `http://localhost:5173`.

## 📂 Project Structure
- `/client`: React frontend with Vite.
- `/server`: Express backend with MongoDB.
- `/server/seed.js`: Database initialization script.

---
Built with ❤️ for High-End Service Management.
