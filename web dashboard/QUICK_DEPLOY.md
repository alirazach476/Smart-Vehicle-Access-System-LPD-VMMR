# Quick Deployment Guide

## 🚀 Fastest Way to Deploy

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy Backend (Railway) - 5 minutes

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Click on the service → **Settings**
5. Set **Root Directory** to `server`
6. Add Environment Variables:
   - `PORT` = `3001`
   - `JWT_SECRET` = (generate a random string)
   - `NODE_ENV` = `production`
7. Railway will auto-deploy
8. Copy the **Public URL** (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend (Vercel) - 3 minutes

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = `https://your-app.railway.app/api` (use your Railway URL)
6. Click **"Deploy"**

### Step 4: Update CORS (if needed)

If you get CORS errors:
1. Go to Railway → Your Service → Variables
2. Add: `CORS_ORIGINS` = `https://your-vercel-app.vercel.app`
3. Redeploy

## ✅ Done!

Your app is now live:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`

## 🔧 Alternative: Render (Backend)

If you prefer Render:

1. Go to [render.com](https://render.com)
2. **New** → **Web Service**
3. Connect GitHub repo
4. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as Railway)
6. Use Render URL in Vercel's `VITE_API_URL`

## 📝 Notes

- First user to register becomes **admin**
- All subsequent users are **regular users**
- Backend uses in-memory storage (data resets on restart)
- For persistent data, consider adding a database (MongoDB, PostgreSQL)

## 🆘 Troubleshooting

**CORS Error?**
- Check `CORS_ORIGINS` includes your frontend URL
- Ensure backend URL in `VITE_API_URL` is correct

**API Not Working?**
- Check Railway/Render logs
- Verify environment variables are set
- Test backend directly: `https://your-backend.com/api/health`

**Build Fails?**
- Check Node.js version (should be 18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

