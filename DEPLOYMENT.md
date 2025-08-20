# 🚀 Netlify Deployment Guide

## Quick Deploy Steps

### 1. Prepare Your Code

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Deploy from Git (Recommended)

1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select your `coin-watchr` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

#### Option B: Drag & Drop

1. Run `npm run build` locally
2. Go to [Netlify](https://netlify.com)
3. Drag the `dist` folder to the deploy area

### 3. Configure Environment Variables

In your Netlify dashboard:

1. Go to **Site settings** > **Environment variables**
2. Add these variables:
   ```
   VITE_SUPABASE_URL=https://ppavmwnoutcirtggtwbv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYXZtd25vdXRjaXJ0Z2d0d2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDgzMjYsImV4cCI6MjA3MTI4NDMyNn0.bBrlIqxXyUc49quEYhjCu2j8LN3-VBpWdjbKP_AYVSo
   ```
3. Trigger a new deployment

### 4. Custom Domain (Optional)

1. Go to **Site settings** > **Domain management**
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## ✅ What's Included

- ✅ **netlify.toml** - Build configuration
- ✅ **SPA routing** - Handles React Router routes
- ✅ **Environment variables** - Supabase configuration
- ✅ **Production build** - Optimized for deployment

## 🔧 Troubleshooting

### Build Fails

- Check that Node.js version is 18+
- Verify all dependencies are in `package.json`
- Check build logs in Netlify dashboard

### Environment Variables Not Working

- Make sure variables start with `VITE_`
- Redeploy after adding environment variables
- Check browser console for errors

### Routing Issues

- The `netlify.toml` includes SPA redirect rules
- All routes redirect to `index.html`

## 🎉 Success!

Your Coin Watchr app should now be live at your Netlify URL!

**Features available:**

- ✅ User authentication
- ✅ Real-time crypto data
- ✅ Watchlist management
- ✅ Interactive charts
- ✅ Demo mode
- ✅ Responsive design
