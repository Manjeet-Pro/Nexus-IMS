# Render Deployment Guide (Backend)

Follow these steps to deploy your Node.js backend to Render.

## 1. Prepare your backend
- Ensure your `backend/package.json` has a `"start"` script:
  ```json
  "scripts": {
    "start": "node server.js"
  }
  ```
- Make sure you are using `process.env.PORT` for your server:
  ```javascript
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  ```

## 2. Push to GitHub
- Ensure all changes are committed and pushed to your GitHub repository.

## 3. Deployment on Render
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following:
   - **Name**: `nexus-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   Add your variables (like `MONGO_URI`, `JWT_SECRET`, etc.) in the **Environment** tab.

## 4. Free Tier Note
Render's free tier spins down after 15 minutes of inactivity. The first request after a spin-down will take 30-50 seconds.
