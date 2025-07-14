# Borbor Carnival 25 - USSD Voting System

A complete USSD voting system with live analytics dashboard for Borbor Carnival 25, built with Next.js, TypeScript, and MySQL.

## 🌟 Features

### USSD Voting Flow (*920*922#)
- ✅ Welcome screen with Vote/Donate options
- ✅ Group code entry and validation
- ✅ Candidate selection and vote count input
- ✅ Mobile Money payment integration
- ✅ Real-time transaction processing
- ✅ SMS confirmations

### Donation System
- ✅ USSD donation flow
- ✅ Amount validation and limits
- ✅ Payment processing and tracking

### Live Analytics Dashboard
- ✅ Real-time vote statistics and charts
- ✅ Candidate leaderboard with percentages
- ✅ Transaction history with filtering
- ✅ Donation analytics and trends
- ✅ Revenue tracking (votes + donations)
- ✅ Auto-refreshing data (30-second intervals)

### Security & Authentication
- ✅ JWT-based admin authentication
- ✅ HTTP-only cookie sessions
- ✅ Password hashing with bcrypt
- ✅ Phone number masking for privacy

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: MySQL with Sequelize ORM
- **Charts**: Recharts
- **Authentication**: JWT with bcryptjs
- **Payment**: Mobile Money API integration
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### 1. Clone and Install
```bash
cd /root/voting-ussd
npm install
```

### 2. Database Setup
```bash
# Create database and tables
mysql -u root -p < scripts/create-tables.sql

# Or manually create database:
CREATE DATABASE borbor_carnival_voting;
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=borbor_carnival_voting

# Payment API (from your existing carnival-ussd project)
PAYMENT_API_NAME=your_api_name
PAYMENT_API_KEY_PRO=your_production_api_key
PAYMENT_URL_PROD=https://your-payment-gateway.com/api/payment
PAYMENT_CALLBACK_URL=https://your-domain.com/api/payment/callback
MERCHANT_ID=your_merchant_id

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Seed Database
```bash
# Using TypeScript directly
npx ts-node scripts/seed.ts

# Or compile and run
npm run build
node dist/scripts/seed.js
```

### 5. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## 📱 USSD Flow (*920*922#)

### Main Menu
```
Welcome to Borbor Carnival 25
1. Vote
2. Donate
```

### Vote Flow
1. **Enter Group Code**: User types candidate code (e.g., "013")
2. **Candidate Confirmation**: "You have selected: Elikem Group"
3. **Vote Count**: "Enter number of votes (GH₵1 per vote):"
4. **Payment Confirmation**: Shows candidate, votes, and amount
5. **PIN Entry**: "Enter your Mobile Money PIN"
6. **Success**: "Thank you for voting 5 times for the Elikem Group"

### Donation Flow
1. **Amount Entry**: "Enter donation amount (GH₵):"
2. **Confirmation**: Shows donation amount
3. **Payment**: Direct Mobile Money processing
4. **Success**: "Thank you for your donation!"

## 🖥️ Dashboard Access

- **URL**: http://localhost:3000/dashboard
- **Login**: admin@borbor.com / admin123

### Dashboard Features
- 📊 Live vote analytics and charts
- 🏆 Real-time candidate leaderboard
- 💰 Revenue tracking (votes + donations)
- 📋 Transaction history with filters
- 📈 Visual charts (bar and pie charts)
- 🔄 Auto-refresh every 30 seconds

## 🗄️ Database Schema

### Tables
- `candidates` - Contest participants with unique codes
- `votes` - Vote transactions and payments
- `donations` - Donation transactions
- `ussd_sessions` - USSD session management
- `users` - Dashboard authentication

### Sample Candidates
| Code | Name | Description |
|------|------|-------------|
| 013 | Elikem Group | Popular dance group from Accra |
| 024 | Ashanti Warriors | Traditional performance group |
| 035 | Volta Vibes | Cultural dance ensemble |
| 046 | Northern Stars | Music and dance collective |
| 057 | Western Waves | Contemporary performance team |
| 068 | Eastern Eagles | Acrobatic dance group |

## 🔗 API Endpoints

### USSD Integration
- `POST /api/ussd` - Handle USSD sessions
- `POST /api/payment/callback` - Payment callbacks

### Dashboard APIs
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout
- `GET /api/analytics/votes` - Vote statistics
- `GET /api/analytics/transactions` - Transaction history
- `GET /api/analytics/donations` - Donation analytics

## 💳 Payment Integration

The system integrates with the same payment provider from your `carnival-ussd` project:

- Mobile Money payments via API
- Transaction tracking and callbacks
- Automatic status updates
- Error handling and retries

## 🚀 Production Deployment

### 1. Build Application
```bash
npm run build
```

### 2. Environment Setup
- Update `.env` with production values
- Set `NODE_ENV=production`
- Configure production database
- Update payment callback URLs

### 3. Database Migration
```bash
mysql -u root -p < scripts/create-tables.sql
npx ts-node scripts/seed.ts
```

### 4. Start Production Server
```bash
npm start
```

### 5. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Testing USSD Flow

### Test with Telco Simulator
```bash
curl -X POST http://localhost:3000/api/ussd \
  -H "Content-Type: application/json" \
  -d '{
    "SESSIONID": "12345",
    "MSISDN": "233241234567",
    "USERDATA": "",
    "MSGTYPE": "1",
    "NETWORK": "MTN"
  }'
```

### Expected Response
```
CON Welcome to Borbor Carnival 25
1. Vote
2. Donate
```

## 📊 Analytics Features

### Vote Analytics
- Total votes per candidate
- Vote percentages and rankings
- Revenue from voting (GH₵1 per vote)
- Transaction success/failure rates

### Donation Analytics
- Total donation amount
- Number of unique donors
- Average donation amount
- Daily donation trends

### Real-time Updates
- Dashboard refreshes every 30 seconds
- Live transaction processing
- Instant vote count updates

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- Phone number masking for privacy
- SQL injection prevention with Sequelize
- CORS protection
- Input validation and sanitization

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SHOW DATABASES;"
```

### Payment API Issues
- Verify API credentials in `.env`
- Check payment provider documentation
- Monitor callback endpoint logs

### USSD Testing
- Use telco aggregator test environment
- Check session management logs
- Verify webhook configurations

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Open GitHub issue

---

**🎭 Borbor Carnival 25 - Bringing the carnival to life through technology!**