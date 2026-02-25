# Step-by-Step: How to Push Code to GitHub

Since your project is not yet a Git repository, follow these steps to securely push your code to GitHub for hosting.

## 1. Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `nexus-management-system`).
3. Keep it **Public** (or Private if you prefer).
4. **DO NOT** initialize with a README, license, or gitignore (we already have code).
5. Click **Create repository**.
6. Copy the repository URL (it looks like `https://github.com/your-username/repo-name.git`).

## 2. Initialize Git Locally
Open your terminal in the `e:\Nexus` folder and run these commands one by one:

```powershell
# Initialize git
git init

# Add all files (this will respect .gitignore)
git add .

# Create first commit
git commit -m "Initial commit: Nexus Management System ready for hosting"
```

## 3. Connect to GitHub and Push
Replace `YOUR_REPOSITORY_URL` with the URL you copied in Step 1.

```powershell
# Link to GitHub
git remote add origin YOUR_REPOSITORY_URL

# Rename branch to main (standard)
git branch -M main

# Push the code
git push -u origin main
```

## Important Notes
- **Environment Variables:** Make sure your `.env` files are NOT pushed. The `.gitignore` should handle this, but double-check.
- **Large Files:** If you have very large files, Git might take a moment.
- **Auth:** If GitHub asks for a password, use a Personal Access Token (PAT) or log in via the browser pop-up.

Once pushed, you can proceed to **Render** and link this repository!
