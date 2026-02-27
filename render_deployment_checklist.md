# 🚀 Render Deployment Final Steps

Follow these steps exactly to put your Nexus system online.

## Step 1: Link Repository
1. Open [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Select `Manjeet-Pro/Nexus-IMS`.
4. Name: `nexus-production`.
5. Click **Apply**.

## Step 2: Fill Environment Variables
Render will ask for these values. **DO NOT LEAVE THEM EMPTY.**

| Variable Name | What to put? |
|--------------|-------------|
| `MONGODB_URI` | Your MongoDB connection string (from Atlas). |
| `GEMINI_API_KEY` | Your Google AI Gemini API key. |
| `JWT_SECRET` | Click the "Generate" button on Render, or type anything random. |
| `EMAIL_USER` | Your gmail address (to send notifications). |
| `EMAIL_PASS` | Your Gmail App Password (NOT your normal password). |

## Step 3: Wait for Build
1. Click **Apply**.
2. Render will show logs for `nexus-backend` and `nexus-frontend`.
3. Wait until both show a status of **"Live"** (Green color).

## Step 4: Access your Site
- Once live, Render will give you a URL like `https://nexus-frontend.onrender.com`.
- **Open that URL!** Your app is now online. 🎉

---
**Note:** If the backend fails, check the `MONGODB_URI` first. If the frontend fails, make sure you have "dist" as the publish directory (should be automatic).
