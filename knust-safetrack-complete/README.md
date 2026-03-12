# KNUST SafeTrack — Full Stack App

## 📁 Project Structure
```
knust-safetrack-complete/
├── frontend/
│   ├── landing.html      ← Landing page
│   ├── index.html        ← React app (Vite entry)
│   ├── src/              ← React components & pages
│   └── package.json
└── backend/
    ├── server.js
    └── package.json
```

## ▶️ How to Run

### Terminal 1 — Backend
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3001
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:5173/landing.html automatically
```

The landing page opens **automatically** in your browser.  
Clicking **"Launch App"** takes you to the Sign In page.

## 🔑 Demo Credentials
| Role     | Email                           | Password    |
|----------|---------------------------------|-------------|
| Student  | kofi.mensah@st.knust.edu.gh     | password123 |
| Security | admin@security.knust.edu.gh     | password123 |

## 🌐 URLs
| Page         | URL                                      |
|--------------|------------------------------------------|
| Landing page | http://localhost:5173/landing.html       |
| Sign In      | http://localhost:5173/index.html#signin  |
| App (Map)    | http://localhost:5173/index.html#map     |
| Dashboard    | http://localhost:5173/index.html#dashboard |
| API Health   | http://localhost:3001/api/health         |
