# Nutrilas

A comprehensive nutrition consultation and client management platform for nutritionists and their clients.

## Features

### For Nutritionists (Admin)
- 📊 **Client Management** - Track and manage all clients in one place
- 📝 **Intake Assessment** - Comprehensive client health and nutrition assessment
- 🍽️ **Meal Planning** - Create personalized meal plans based on client goals
- 📈 **Progress Tracking** - Monitor client weight and BMI trends with charts
- 📅 **Appointment Scheduling** - Manage consultations and follow-ups
- 💬 **Real-time Chat** - Communicate with clients instantly
- 📧 **Email Notifications** - Automated appointment reminders and updates
- 📊 **Analytics Dashboard** - Overview of practice metrics

### For Clients
- 📋 **Health Profile** - Complete intake questionnaire
- 🎯 **Goal Setting** - Set and track nutrition goals
- ⚖️ **Weight Tracking** - Log weight with visual progress charts
- 🍴 **Meal Plans** - Access personalized nutrition plans
- 📅 **Appointments** - Book and manage consultations
- 💬 **Chat Support** - Direct communication with nutritionist
- 📱 **Responsive Design** - Access from any device

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.IO
- **Email:** Nodemailer
- **Validation:** Joi
- **Charts:** Chart.js
- **Payments:** Stripe, PayPal
- **Security:** Helmet, CORS, Rate Limiting

## 🚀 Quick Start (Docker)
The recommended way to run this project is via Docker:

```bash
docker-compose up --build
```
This starts both the web application (port 5001) and the PostgreSQL database.

## 🛠 Manual Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
 >= 13
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Nutrilas
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables))

4. **Setup database**
```bash
npm run migrate
npm run seed
```

5. **Start the server**
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

6. **Access the application**
```
http://localhost:5001
```

### Default Credentials
After seeding the database:
- **Admin:** admin@nutri.com / admin123
- **Client:** client@nutri.com / client123

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nutriconsult
DATABASE_SSL=false

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5001
API_URL=http://localhost:5001

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Nutrilas <noreply@nutrilas.com>

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Logging
LOG_LEVEL=info
```

## Project Structure

```
Nutrilas/
├── assets/           # Frontend assets (CSS, JS, images)
├── config/           # Configuration files
├── middleware/       # Express middleware
├── routes/           # API routes
├── scripts/          # Database scripts and tests
├── utils/            # Utility functions
├── docs/             # Documentation
├── server.js         # Application entry point
└── package.json      # Dependencies
```

## Available Scripts

### Development
```bash
npm run dev          # Start with hot reload (nodemon)
npm start            # Start production server
```

### Database
```bash
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
```

### Testing
```bash
npm run test:phase1  # Run all Phase 1 tests
npm run test:security # Run security tests
npm run test:database # Run database tests
npm run test:errors   # Run error handling tests
```

### Code Quality
```bash
npm run lint         # Check code style
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

### Quick API Reference

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

**Clients:**
- `GET /api/clients` - List all clients (admin)
- `GET /api/clients/:id` - Get client details
- `POST /api/clients/:id/intake` - Save intake data
- `DELETE /api/clients/:id` - Delete client (admin)

**Weight Tracking:**
- `POST /api/clients/:id/weight` - Log weight
- `GET /api/clients/:id/weight` - Get weight history

**Appointments:**
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id` - Update appointment

## Security Features

- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **XSS Protection** - Input sanitization
- ✅ **Password Strength** - Enforced requirements
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Rate Limiting** - Prevent brute force attacks
- ✅ **CORS Protection** - Configured allowed origins
- ✅ **Helmet Security** - HTTP headers protection
- ✅ **Error Handling** - Centralized with no stack trace leaks
- ✅ **Request ID Tracking** - For debugging and auditing
- ✅ **Sensitive Data Redaction** - In logs

## Development Guide

See [docs/DEVELOPER.md](docs/DEVELOPER.md) for detailed development guidelines.

### Code Style

We use ESLint and Prettier for consistent code style:
- Single quotes
- Semicolons required
- 4-space indentation
- 100 character line width

### Adding New Features

1. Create feature branch
2. Follow code style guide
3. Add JSDoc comments
4. Write tests
5. Update documentation
6. Submit pull request

## Testing

### Running Tests

```bash
# All Phase 1 tests
npm run test:phase1

# Individual test suites
npm run test:security
npm run test:database
npm run test:errors
```

### Test Coverage

- Security: SQL injection, XSS, rate limiting
- Database: Transactions, rollback, timeouts
- Error Handling: Standardized responses, request IDs

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret (256+ bits)
- [ ] Enable database SSL
- [ ] Configure production CORS origins
- [ ] Set up HTTPS
- [ ] Configure email service
- [ ] Set up payment gateways
- [ ] Enable monitoring and logging
- [ ] Set up automated backups

### Recommended Services

- **Hosting:** Railway, Heroku, DigitalOcean
- **Database:** Railway PostgreSQL, Heroku Postgres, AWS RDS
- **Monitoring:** Sentry, New Relic, Datadog
- **Email:** SendGrid, Mailgun, AWS SES

## Performance

- Database connection pooling (max: 20 connections)
- Query timeout protection (10 seconds)
- Slow query logging (>1000ms)
- Performance indexes on frequently queried columns
- Chart instance cleanup to prevent memory leaks

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For questions or issues:
- Check [documentation](docs/)
- Review [API docs](docs/API.md)
- Contact development team

## Changelog

### Phase 1 (Completed)
- ✅ Security hardening (SQL injection, XSS, rate limiting)
- ✅ Centralized error handling
- ✅ Structured logging with redaction
- ✅ Database transactions and connection pooling
- ✅ Request ID tracking
- ✅ Comprehensive test suites

### Phase 2 (In Progress)
- ✅ ESLint and Prettier setup
- ✅ Modular frontend structure
- ✅ Utility modules (constants, formatters, DOM helpers)
- ✅ State management system
- ✅ Chart management with cleanup
- ✅ API documentation
- ✅ Developer guide
- 🔄 JSDoc comments
- 🔄 Unit tests with Jest

## Acknowledgments

- Chart.js for beautiful charts
- Express.js community
- PostgreSQL team
- All contributors

---

**Built with ❤️ for nutritionists and their clients**
