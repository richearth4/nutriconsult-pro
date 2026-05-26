# Nutrilas - Developer Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Style Guide](#code-style-guide)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 13
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

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/nutriconsult
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:5001
```

4. **Setup database**
```bash
npm run migrate
npm run seed
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5001`

---

## Architecture Overview

### Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Real-time:** Socket.IO
- **Email:** Nodemailer
- **Validation:** Joi
- **Charts:** Chart.js
- **Payments:** Stripe, PayPal

### Architecture Pattern
```
Client (Browser)
    ↓
Express Server
    ↓
Middleware (Auth, Validation, Error Handling)
    ↓
Route Handlers
    ↓
Database (PostgreSQL)
```

### Key Features
- Role-based access control (Admin/Client)
- Client intake and assessment
- Meal plan generation
- Weight tracking with charts
- Appointment scheduling
- Real-time chat
- Email notifications
- Payment processing

---

## Project Structure

```
Nutrilas/
├── assets/
│   ├── css/              # Stylesheets
│   ├── js/
│   │   ├── modules/      # Frontend modules
│   │   │   ├── state.js  # State management
│   │   │   └── charts.js # Chart management
│   │   ├── utils/        # Utility functions
│   │   │   ├── constants.js
│   │   │   ├── formatters.js
│   │   │   └── dom.js
│   │   ├── app.js        # Main application
│   │   ├── api.js        # API client
│   │   └── auth.js       # Authentication
│   └── images/           # Static images
├── config/
│   └── database.js       # Database configuration
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── validation.js     # Input validation
│   ├── errorHandler.js   # Error handling
│   └── requestId.js      # Request tracking
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── clients.js        # Client management
│   ├── appointments.js   # Appointments
│   ├── analytics.js      # Analytics
│   └── payments.js       # Payment processing
├── scripts/
│   ├── migrate.js        # Database migrations
│   ├── seed.js           # Seed data
│   └── test_*.js         # Test suites
├── utils/
│   ├── logger.js         # Logging utility
│   ├── email.js          # Email service
│   └── stripe.js         # Stripe integration
├── docs/
│   ├── API.md            # API documentation
│   └── DEVELOPER.md      # This file
├── .eslintrc.json        # ESLint config
├── .prettierrc.json      # Prettier config
├── server.js             # Entry point
└── package.json          # Dependencies
```

---

## Development Workflow

### Running the Application

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Database Management

**Run migrations:**
```bash
npm run migrate
```

**Seed database:**
```bash
npm run seed
```

### Testing

**Run all Phase 1 tests:**
```bash
npm run test:phase1
```

**Run specific test suites:**
```bash
npm run test:security
npm run test:database
npm run test:errors
```

### Code Quality

**Lint code:**
```bash
npm run lint
```

**Auto-fix linting issues:**
```bash
npm run lint:fix
```

**Format code:**
```bash
npm run format
```

**Check formatting:**
```bash
npm run format:check
```

---

## Code Style Guide

### JavaScript Style

We use ESLint and Prettier for consistent code style.

**Key conventions:**
- Use single quotes for strings
- Semicolons required
- 4-space indentation
- 100 character line width
- Use `const` by default, `let` when reassignment needed
- Never use `var`

**Example:**
```javascript
const calculateBMI = (weight, height) => {
    if (!weight || !height) {
        return null;
    }
    return weight / Math.pow(height / 100, 2);
};
```

### JSDoc Comments

All functions should have JSDoc comments:

```javascript
/**
 * Calculate BMI from weight and height
 * @param {number} weight - Weight in kilograms
 * @param {number} height - Height in centimeters
 * @returns {number|null} BMI value or null if invalid
 */
function calculateBMI(weight, height) {
    // implementation
}
```

### Naming Conventions

- **Variables/Functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Classes:** PascalCase
- **Files:** kebab-case or camelCase
- **Database:** snake_case

### Error Handling

Always use the centralized error handler:

```javascript
const { AppError } = require('../middleware/errorHandler');

// Throw custom error
throw new AppError('Resource not found', 404, 'NOT_FOUND');

// Or use next() in async routes
router.get('/example', async (req, res, next) => {
    try {
        // route logic
    } catch (error) {
        next(error);
    }
});
```

### Database Queries

Always use parameterized queries:

```javascript
// ✅ Good
const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
);

// ❌ Bad - SQL injection risk
const result = await db.query(
    `SELECT * FROM users WHERE email = '${email}'`
);
```

### Async/Await

Prefer async/await over callbacks:

```javascript
// ✅ Good
async function getUser(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
}

// ❌ Avoid
function getUser(id, callback) {
    db.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
        callback(err, result.rows[0]);
    });
}
```

---

## Testing

### Test Structure

Tests are organized by feature:
- `test_security.js` - Security tests
- `test_database.js` - Database tests
- `test_errors.js` - Error handling tests

### Writing Tests

Example test structure:

```javascript
async function testFeature() {
    console.log('--- Test: Feature Name ---');

    try {
        const result = await performAction();

        testResult(
            'Feature works correctly',
            result.status === 200,
            `Got status ${result.status}`
        );
    } catch (error) {
        testResult('Feature works correctly', false, error.message);
    }
}
```

### Test Coverage Goals

- Critical paths: 100%
- Utilities: >80%
- Routes: >70%
- Overall: >60%

---

## Deployment

### Environment Variables

Required environment variables for production:

```env
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=https://your-domain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

### Database Setup

1. Create production database
2. Run migrations: `npm run migrate`
3. Create admin user manually or via seed script

### Security Checklist

- [ ] Strong JWT secret (256+ bits)
- [ ] HTTPS enabled
- [ ] Database SSL enabled
- [ ] Environment variables secured
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Error stack traces disabled in production

### Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Enable database connection pooling
- Implement caching where appropriate
- Monitor slow queries

### Monitoring

Recommended monitoring:
- Application logs (Winston)
- Error tracking (Sentry)
- Performance monitoring (New Relic/Datadog)
- Database monitoring
- Uptime monitoring

---

## Common Tasks

### Adding a New Route

1. Create route file in `routes/`
2. Add validation schema in `middleware/validation.js`
3. Import and use in `server.js`
4. Document in `docs/API.md`
5. Write tests

### Adding a New Database Table

1. Create migration script
2. Update seed data if needed
3. Add queries in appropriate route
4. Test with `npm run migrate`

### Adding a New Frontend Module

1. Create file in `assets/js/modules/`
2. Export functions/classes
3. Import in `app.js`
4. Add JSDoc comments
5. Test functionality

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL
```

### Port Already in Use

```bash
# Find process using port 5001
netstat -ano | findstr :5001

# Kill process
taskkill /PID <pid> /F
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

---

## Contributing

1. Create feature branch from `main`
2. Make changes following code style guide
3. Run linter and tests
4. Update documentation
5. Submit pull request

---

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Support

For questions or issues:
- Check documentation
- Review existing issues
- Contact development team
