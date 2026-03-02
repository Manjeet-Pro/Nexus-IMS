# Frontend Deployment Guide (Vercel)

Aapke frontend (Vite + React) ko Vercel par deploy karne ke liye ye steps follow karein.

## 1. Prepare for Deployment
Ensure your `frontend/package.json` has these scripts:
```json
"scripts": {
  "build": "vite build",
  "preview": "vite preview"
}
```

## 2. Deploy via Vercel Dashboard (Recommended)
1. Go to [Vercel](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

## 3. Environment Variables
Agar aapka frontend backend API se connect karta hai, toh aapko `VITE_API_URL` jaisi variables add karni hongi:
1. Vercel dashboard mein **Settings** > **Environment Variables**.
2. Key: `VITE_API_URL`
3. Value: `https://your-backend-url.render.com` (Jo aapne backend deploy karne ke baad milega).

---

> [!IMPORTANT]
> Kyunki aapne frontend `frontend` folder mein rakha hai, isliye **Root Directory** ko `frontend` set karna bahut zaroori hai.
