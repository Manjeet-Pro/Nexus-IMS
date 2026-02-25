# Nexus Institute Management System (Nexus IMS)

This project is now organized into a **MERN Stack** structure with separate folders for Backend and Frontend.

## Project Structure
- `/backend`: Node.js & Express API, MongoDB models, and AI controllers.
- `/frontend`: React & Vite application with Tailwind CSS and Lucide icons.

## How to Run

### 1. Prerequisites
- Node.js installed.
- MongoDB connection string in `/backend/.env`.
- Gemini API Key in `/backend/.env`.

### 2. Quick Start
From the root directory, you can run both servers simultaneously:
```bash
npm install concurrently --save-dev
npm run start
```

### 3. Manual Startup
**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## AI Features
- **Performance Analyzer**: Analyze student results using Gemini AI.
- **AI Chatbot**: Smart academic assistant for FAQs.
