# Railway Deployment Guide 🚅

Railway backend ke liye Render se kafi fast aur stable hai. Ye rahe steps:

### Phase 1: Railway par Naya Service Banayein
1. [Railway.app](https://railway.app/) par login karein.
2. **"New Project"** -> **"Deploy from GitHub repo"** par click karein.
3. Apna repo `Nexus-IMS` select karein.
4. **IMPORTANT:** Setup mein **"Root Directory"** ko `/backend` set karein.
5. **"Deploy Now"** par click karein.

### Phase 2: Environment Variables (Copy/Paste)
Railway Dashboard mein **Settings -> Variables** mein jayein aur ye sab add karein:

| Key | Value |
| :--- | :--- |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://nexus_ims:rnU5lUChdc1IFQs4@cluster0.e9kx9z8.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `aaditestsecret123` |
| `EMAIL_USER` | `ms1813403@gmail.com` |
| `EMAIL_PASS` | `wgbaorggakynhmbm` |
| `FRONTEND_URL` | `https://nexus-frontend-mv7v.onrender.com` |

### Phase 3: Frontend Update (Render Dashbaord Par)
Jab Railway aapko ek **Public URL** de de (e.g. `https://nexus-backend-production...railway.app`), toh Render par ja kar apne **Frontend Service** ki environment variables badlein:

1. `VITE_API_URL` = `[Railway_URL]/api`
2. `VITE_SOCKET_URL` = `[Railway_URL]`

---
**Note:** Railway par deploy hote hi, aapka email system STARTTLS (Port 587) use karega jo maine pehle hi code mein set kar diya hai. Ab ye bina atke chalna chahiye! 🚀🛡️
