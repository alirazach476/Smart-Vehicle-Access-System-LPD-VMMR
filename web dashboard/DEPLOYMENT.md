# Deployment Guide

This guide covers deploying the Smart Vehicle Gate System to production.

## Architecture

- **Frontend**: React + Vite (deploy to Vercel/Netlify)
- **Backend**: Node.js + Express (deploy to Railway/Render/Heroku)

## Prerequisites

1. GitHub account
2. Vercel account (for frontend) - [vercel.com](https://vercel.com)
3. Railway account (for backend) - [railway.app](https://railway.app) OR Render account - [render.com](https://render.com)

## Deployment Steps

### Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

#### Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the Node.js project
   - Set root directory to `server`
   - Add environment variables:
     ```
     PORT=3001
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     NODE_ENV=production
     ```
   - Railway will automatically deploy

3. **Get Backend URL**
   - After deployment, Railway provides a URL like: `https://your-app.railway.app`
   - Copy this URL

#### Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Root Directory: `.` (root)
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add Environment Variable:
     ```
     VITE_API_URL=https://your-app.railway.app/api
     ```
   - Click "Deploy"

3. **Update API URL**
   - After deployment, update `VITE_API_URL` in Vercel settings with your Railway backend URL

### Option 2: Vercel (Frontend) + Render (Backend)

#### Backend Deployment (Render)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `smart-gate-backend`
     - Environment: Node
     - Root Directory: `server`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Add Environment Variables:
     ```
     PORT=3001
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     NODE_ENV=production
     ```
   - Click "Create Web Service"

3. **Get Backend URL**
   - Render provides URL like: `https://your-app.onrender.com`
   - Copy this URL

#### Frontend Deployment (Vercel)

Same as Option 1, but use Render backend URL in `VITE_API_URL`

### Option 3: Full Stack on Railway

1. **Deploy Backend** (same as Option 1)
2. **Deploy Frontend as separate service**
   - Create new service in Railway
   - Root directory: `.` (root)
   - Build command: `npm run build`
   - Start command: `npx serve dist -s -l 3000`
   - Add environment variable: `VITE_API_URL=https://your-backend.railway.app/api`

## Environment Variables

### Backend (.env)
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### Frontend (Vercel/Railway)
```env
VITE_API_URL=https://your-backend-url.com/api
```

## Post-Deployment Checklist

- [ ] Backend is accessible and returns API info at `/api`
- [ ] Frontend can connect to backend (check browser console)
- [ ] Authentication works (login/signup)
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] First user registration creates admin account
- [ ] File uploads work (if using persistent storage)

## Troubleshooting

### CORS Issues
- Ensure backend CORS allows your frontend domain
- Check `server/index.js` CORS configuration

### API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check backend logs for errors
- Ensure backend is running and accessible

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

## Custom Domain Setup

### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Railway/Render (Backend)
1. Go to project settings
2. Add custom domain
3. Update CORS settings to allow your custom domain
4. Update `VITE_API_URL` in frontend

## Monitoring

- **Vercel**: Built-in analytics and monitoring
- **Railway**: Built-in logs and metrics
- **Render**: Built-in logs and metrics

## Security Notes

1. **Change JWT_SECRET** to a strong random string in production
2. **Enable HTTPS** (automatic on Vercel/Railway/Render)
3. **Set proper CORS** origins
4. **Review environment variables** - never commit secrets
5. **Regular updates** - keep dependencies updated

## Support

For issues:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for frontend errors

