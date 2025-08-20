# Coin Watchr 🪙

A modern, real-time cryptocurrency dashboard built with React, TypeScript, and Supabase. Track your favorite cryptocurrencies, manage your watchlist, and stay updated with live market data.

![Coin Watchr Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.55.0-green)

## ✨ Features

### 🔐 **Authentication & User Management**
- **Secure Sign-up/Sign-in** - Email-based authentication with Supabase
- **Demo Mode** - Try all features without creating an account
- **User Profiles** - Personalized experience with saved preferences
- **Session Management** - Automatic login persistence

### 📊 **Real-time Crypto Data**
- **Live Price Updates** - Real-time cryptocurrency prices from CoinGecko API
- **Market Statistics** - Market cap, volume, 24h changes, and more
- **Trending Coins** - Discover hot cryptocurrencies
- **Comprehensive Data** - Supply info, ATH/ATL, and market rankings

### 📈 **Interactive Charts**
- **Bitcoin Price Chart** - Featured chart with multiple timeframes (1D, 7D, 1M, 3M, 1Y)
- **Interactive Tooltips** - Hover for detailed price information
- **Responsive Design** - Charts adapt to any screen size
- **Beautiful Visualizations** - Gradient-filled area charts with smooth animations

### ⭐ **Watchlist Management**
- **Add/Remove Coins** - One-click watchlist management
- **Demo Mode Support** - Preloaded demo items for guest users
- **Real-time Sync** - Instant updates across all devices
- **Persistent Storage** - Watchlist saved to Supabase database

### 🎨 **Modern UI/UX**
- **Dark SaaS Theme** - Professional dark theme with Bitcoin gold accents
- **Glass Morphism** - Beautiful backdrop blur effects
- **Smooth Animations** - Hover effects, transitions, and micro-interactions
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Accessibility** - WCAG compliant with proper contrast and focus states

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Query (TanStack Query)** - Server state management

### **UI Components**
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components
- **Recharts** - Interactive chart library
- **Lucide React** - Beautiful icons

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Secure data access
- **Real-time Subscriptions** - Live data updates

### **APIs & Data**
- **CoinGecko API** - Cryptocurrency market data
- **Supabase Auth** - User authentication
- **Supabase Database** - User data and watchlists

### **Deployment**
- **Netlify** - Static site hosting
- **Environment Variables** - Secure configuration
- **CI/CD** - Automatic deployments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd coin-watchr
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run the Supabase migrations:
```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist table
CREATE TABLE watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own watchlist" ON watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist items" ON watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist items" ON watchlist
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Start Development
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## 📱 How It Works

### **Authentication Flow**
1. **Sign Up** - Users create accounts with email/password
2. **Email Verification** - Supabase sends verification emails
3. **Sign In** - Secure authentication with session management
4. **Demo Mode** - Guest users can try features without registration

### **Data Flow**
1. **CoinGecko API** - Fetches real-time cryptocurrency data
2. **React Query** - Manages server state with caching and background updates
3. **Supabase** - Stores user data and watchlists
4. **Real-time Updates** - Live price updates every 30 seconds

### **Watchlist System**
1. **Add to Watchlist** - Click star icon on any coin
2. **Database Storage** - Watchlist saved to Supabase
3. **Demo Mode** - Preloaded demo items for guests
4. **Real-time Sync** - Changes reflect immediately across devices

### **Chart System**
1. **Timeframe Selection** - Choose from 1D to 1Y views
2. **Data Fetching** - Historical price data from CoinGecko
3. **Interactive Charts** - Hover for tooltips, responsive design
4. **Performance** - Optimized with React Query caching

## 🏗️ Project Structure

```
src/
├── components/
│   ├── crypto/           # Crypto-specific components
│   │   ├── CoinOverviewCard.tsx
│   │   ├── CryptoSearch.tsx
│   │   └── PriceChart.tsx
│   ├── layout/           # Layout components
│   │   └── DashboardLayout.tsx
│   └── ui/              # Reusable UI components
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── hooks/
│   ├── useWatchlist.ts  # Watchlist management
│   └── use-toast.ts     # Toast notifications
├── integrations/
│   └── supabase/        # Supabase configuration
├── lib/
│   ├── api.ts          # API functions
│   └── utils.ts        # Utility functions
├── pages/              # Page components
└── main.tsx           # App entry point
```

## 🔧 Configuration

### **Supabase Setup**
1. Create a new Supabase project
2. Enable Authentication in the dashboard
3. Create the required database tables (see above)
4. Copy your project URL and anon key to environment variables

### **CoinGecko API**
- Free tier with rate limits
- No API key required for basic usage
- Real-time cryptocurrency data

### **Environment Variables**
```env
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
VITE_APP_NAME=Coin Watchr
VITE_APP_VERSION=1.0.0
```

## 🚀 Deployment

### **Netlify Deployment**
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Netlify**
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables in Netlify dashboard

3. **Custom Domain** (Optional)
   - Add custom domain in Netlify settings
   - Configure DNS records

### **Manual Deployment**
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🎯 Key Features Explained

### **Demo Mode**
- Preloaded with Bitcoin, Ethereum, and Cardano
- No authentication required
- Full feature access
- Perfect for trying the app

### **Real-time Data**
- 30-second refresh intervals
- Background updates
- Optimistic UI updates
- Error handling and retries

### **Watchlist Management**
- One-click add/remove
- Duplicate prevention
- Real-time synchronization
- Cross-device persistence

### **Responsive Design**
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔒 Security Features

- **Row Level Security** - Database-level access control
- **Environment Variables** - Secure configuration management
- **Input Validation** - Client and server-side validation
- **CORS Protection** - Cross-origin request security
- **HTTPS Only** - Secure connections in production

## 📊 Performance Optimizations

- **React Query Caching** - Intelligent data caching
- **Code Splitting** - Lazy-loaded components
- **Image Optimization** - Optimized crypto logos
- **Bundle Optimization** - Tree shaking and minification
- **CDN Delivery** - Fast global content delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use conventional commits
- Add tests for new features
- Update documentation
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CoinGecko](https://coingecko.com) for cryptocurrency data
- [Supabase](https://supabase.com) for backend services
- [shadcn/ui](https://ui.shadcn.com) for beautiful components
- [Recharts](https://recharts.org) for chart components
- [Tailwind CSS](https://tailwindcss.com) for styling

## 📞 Support

- **Documentation**: [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**Made with ❤️ for the crypto community**

*Track your favorite cryptocurrencies with style and precision! 🪙✨*
