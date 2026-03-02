# Nexus IMS Deployment Guide 🚀

Nexus system ko cloud par deploy karne ke liye ye steps follow karein.

## 1. Database Setup (MongoDB Atlas)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) par login karein.
2. Ek "Shared Cluster" (Free) banayein.
3. **Network Access:** `0.0.0.0/0` (Allow all) add karein taaki hum Render/Vercel se connect kar sakein.
4. **Database Access:** Ek user banayein (username/password yaad rakhein).
5. "Connect" par click karein -> "Drivers" -> Copy the **Connection String**.
   - Ye aisi dikhegi: `mongodb+srv://<username>:<password>@cluster0.abc.mongodb.net/nexus?retryWrites=true&w=majority`

---

## 2. GitHub Push
Pura code GitHub par push hona chahiye:
```bash
git add .
git commit -m "Final consolidation and deployment prep"
git push origin main
```

---

## 3. Backend Deployment (Render.com)
1. [Render.com](https://render.com/) par account banayein.
2. "New" -> "Web Service" select karein.
3. GitHub repo connect karein.
4. Settings:
   - **Name:** `nexus-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Environment Variables** add karein:
   - `MONGODB_URI`: (Aapki Atlas connection string)
   - `JWT_SECRET`: (Koi bhi random strong string)
   - `GEMINI_API_KEY`: (Aapki Google Gemini API key)
   - `PORT`: `5000`
6. Deploy hone ke baad, Render ka **URL** copy kar lein (e.g., `https://nexus-backend.onrender.com`).

---

## 4. Frontend Deployment (Vercel)
1. [Vercel.com](https://vercel.com/) par GitHub se login karein.
2. "Add New" -> "Project".
3. GitHub repo import karein.
4. Settings:
   - **Name:** `nexus-frontend`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
5. **Environment Variables** add karein:
   - `VITE_API_URL`: (Render ka backend URL bina `/api` ke)
   - `VITE_SOCKET_URL`: (Vahi Render URL)
6. "Deploy" par click karein. Done! 🎉
