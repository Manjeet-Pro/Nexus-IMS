# Koyeb Deployment Guide (Backend)

Koyeb is a great option for "always-on" free hosting in specific regions.

## 1. Prepare your backend
- Ensure your `backend/package.json` has a `"start"` script.
- Ensure your app listens on the port provided by the environment: `process.env.PORT`.

## 2. Deployment on Koyeb
1. Sign up at [Koyeb](https://app.koyeb.com/).
2. Click **Create App**.
3. Select **GitHub** as the deployment method.
4. Select your repository.
5. Set the following:
   - **App Name**: `nexus-backend`
   - **Instance Type**: `Nano` (Free Tier)
   - **Region**: Select `Frankfurt (Germany)` or `Washington, D.C. (USA)` for the free tier.
   - **Work Dir**: `backend`
6. **Environment Variables**:
   Add your `.env` variables in the Koyeb dashboard.

## 3. Advantages
- **No Sleep**: Unlike Render, Koyeb instances do not sleep on the free tier in supported regions.
- **Fast Performance**: Once deployed, your API will respond instantly.
