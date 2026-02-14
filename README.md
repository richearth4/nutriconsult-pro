# NutriConsult Pro

A modern, AI-powered nutrition consultation platform for nutritionists and their clients.

## 🌟 Features

### For Clients
- **Smart Health Intake**: Comprehensive health assessment with AI-powered risk analysis
- **AI Nutrition Plans**: Personalized daily calorie and macro targets
- **Custom Meal Plans**: Nutritionist-assigned meal plans with dietary preference support
- **Progress Tracking**: Weight history charts and goal progress visualization
- **Educational Resources**: Access to curated nutrition content
- **Profile Management**: Update health metrics and track changes over time

### For Nutritionists
- **Client Dashboard**: Manage all clients in one place
- **AI Recommendations**: Auto-generated nutrition targets based on client data
- **Meal Plan Builder**: Create and assign custom meal plans
- **Resource Library**: Manage and assign educational content
- **PDF Reports**: Generate professional consultation reports
- **Risk Alerts**: Automatic health risk detection and alerts

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Local Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd NutriConsult\ Pro
```

2. **Set up backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run dev
```

3. **Open frontend**
```bash
# Open index.html in your browser or use Live Server
```

4. **Test credentials**
- Admin: `admin@nutri.com` / `password`
- Client: `client@nutri.com` / `password`

## 📦 Production Deployment

See [Quick Start Deployment Guide](quick_start_deployment.md) for detailed instructions.

### Recommended Stack
- **Frontend**: Netlify or Vercel
- **Backend**: Railway or Heroku
- **Database**: Railway PostgreSQL or Supabase

### One-Command Deploy (Railway)
```bash
cd backend
railway login
railway init
railway add postgresql
railway up
```

## 🏗️ Project Structure

```
NutriConsult Pro/
├── assets/
│   ├── css/
│   │   └── style.css          # Main stylesheet
│   ├── js/
│   │   ├── app.js             # Frontend application logic
│   │   ├── db.js              # Mock database (dev only)
│   │   ├── api.js             # Production API client
│   │   ├── auth.js            # Authentication logic
│   │   └── nutrition.js       # AI nutrition engine
│   └── images/
├── backend/
│   ├── config/
│   │   └── database.js        # PostgreSQL connection
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── validation.js      # Input validation
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   ├── clients.js         # Client data endpoints
│   │   ├── mealplans.js       # Meal plan endpoints
│   │   └── resources.js       # Resource endpoints
│   ├── scripts/
│   │   └── migrate.js         # Database migrations
│   ├── server.js              # Express server
│   └── package.json
├── index.html                 # Login page
├── dashboard-admin.html       # Admin dashboard
├── dashboard-client.html      # Client dashboard
├── profile-client.html        # Client profile page
└── README.md
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with 10 rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS Protection**: Configurable origin whitelist
- **Helmet.js**: Security headers

## 🛠️ Tech Stack

### Frontend
- Vanilla JavaScript (ES6+)
- Chart.js for data visualization
- jsPDF for report generation
- Modern CSS with CSS Variables

### Backend
- Node.js + Express
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing

## 📊 API Documentation

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify
```

### Clients
```
GET    /api/clients              # Get all clients (admin)
GET    /api/clients/:userId      # Get client data
POST   /api/clients/:userId/intake  # Save intake data
```

### Meal Plans
```
GET    /api/mealplans/:userId    # Get meal plan
POST   /api/mealplans/:userId    # Save meal plan
```

### Resources
```
GET    /api/resources            # Get all resources
GET    /api/resources/assigned/:userId  # Get assigned
POST   /api/resources/assign     # Assign resource (admin)
POST   /api/resources            # Add resource (admin)
DELETE /api/resources/:id        # Delete resource (admin)
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run linter
npm run lint
```

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [x] Advanced analytics dashboard
- [x] Meal plan templates
- [ ] Integration with fitness trackers
- [ ] Multi-language support
- [x] Stripe payment integration
- [x] Email notifications
- [x] Chat/messaging system

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@nutriconsult.com or open an issue.

## 🙏 Acknowledgments

- Chart.js for beautiful charts
- jsPDF for PDF generation
- The nutrition science community

---

**Built with ❤️ for nutritionists and their clients**
