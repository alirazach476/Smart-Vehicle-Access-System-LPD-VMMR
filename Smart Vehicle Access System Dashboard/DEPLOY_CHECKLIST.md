# Pre-Deployment Checklist

## ✅ Before Deploying

### 1. Code Ready
- [ ] All features tested locally
- [ ] No console errors
- [ ] Build succeeds: `npm run build`
- [ ] Backend starts: `cd server && npm start`

### 2. Environment Variables
- [ ] Backend `.env` configured (or use platform env vars)
- [ ] Frontend `.env` configured (or use platform env vars)
- [ ] `JWT_SECRET` is a strong random string
- [ ] `VITE_API_URL` points to your backend

### 3. Security
- [ ] `.env` files in `.gitignore`
- [ ] No secrets committed to Git
- [ ] CORS configured for production domains
- [ ] JWT_SECRET is unique and secure

### 4. Dependencies
- [ ] All dependencies in `package.json`
- [ ] No missing imports
- [ ] Node.js version compatible (18+)

### 5. Files Created
- [ ] `vercel.json` for frontend
- [ ] `railway.json` or `render.yaml` for backend
- [ ] `.gitignore` includes sensitive files
- [ ] `README.md` updated

## 🚀 Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy Backend First**
   - Railway or Render
   - Get the backend URL
   - Test: `https://your-backend.com/api/health`

3. **Deploy Frontend**
   - Vercel
   - Set `VITE_API_URL` to backend URL
   - Deploy

4. **Verify**
   - [ ] Frontend loads
   - [ ] Can register/login
   - [ ] API calls work
   - [ ] No CORS errors
   - [ ] Images load correctly

## 🔍 Post-Deployment Testing

- [ ] Home page loads
- [ ] Can register new user
- [ ] First user is admin
- [ ] Can login
- [ ] Dashboard displays
- [ ] Live Feed works
- [ ] Admin features work (if admin)
- [ ] User features work (if user)
- [ ] Weather page loads
- [ ] Image upload works (admin only)

## 📊 Monitoring

- [ ] Check deployment logs
- [ ] Monitor error rates
- [ ] Check API response times
- [ ] Verify environment variables

## 🔧 Common Issues

### CORS Error
- Add frontend URL to `CORS_ORIGINS` in backend
- Format: `https://your-app.vercel.app`

### API Not Found
- Check `VITE_API_URL` includes `/api`
- Verify backend is running
- Check backend logs

### Build Fails
- Check Node.js version
- Verify all dependencies
- Check build logs

### 401/403 Errors
- Check JWT_SECRET is set
- Verify token in localStorage
- Check backend auth middleware

