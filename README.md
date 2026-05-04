# personal-tracker
A personal analytics dashboard to track financial data and health metrics with manual inputs, historical insights, and trend visualization.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Dev tooling: nodemon

## Setup

### Backend
1. Open a terminal in `/workspaces/personal-tracker/backend`
2. Run `npm install`
3. Copy `.env.example` to `.env` and update `MONGO_URI` if needed
4. Run `npm run dev`

### Frontend
1. Open a terminal in `/workspaces/personal-tracker/frontend`
2. Run `npm install`
3. Run `npm run dev`

The frontend is configured with a proxy so `/api` requests are forwarded to `http://localhost:5000`.

## Notes
- Backend endpoint: `http://localhost:5000/api/entries`
- Frontend app: `http://localhost:3000`
- Use MongoDB locally or update the connection string in `backend/.env`
