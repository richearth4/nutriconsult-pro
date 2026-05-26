# Nutrilas - Project Handover

## 🚀 Project Status
- **Version:** 1.0.0 (Production Ready)
- **Node.js:** v18+ (LTS)
- **Database:** PostgreSQL 15+

## 🐳 Quick Start (Recommended)
The easiest way to run the application is using Docker. This avoids all local environment issues.

```bash
# Start App and Database
docker-compose up --build
```
- App will be running at `http://localhost:5001`
- Database will be automatically provisioned.

## 🛠 Manual Setup
If you prefer running without Docker:
1. **Requirements:** Node.js v18+, PostgreSQL.
2. **Install:** `npm install`
3. **Env Vars:** Copy `.env.example` to `.env` and fill in DB credentials.
4. **Run:** `npm start`

## 🛡️ Key Features Implemented
1. **Security:**
   - Rate limiting (Brute-force protection).
   - XSS sanitization & HPP protection.
   - Strong password policies.
2. **Performance:**
   - Gzip compression.
   - Caching for static assets.
   - Pagination for large datasets.
3. **Reliability:**
   - Graceful shutdown logic.
   - Docker containerization.

## ⚠️ Known Limitations
- **Email:** Currently uses a real Nodemailer transport logic but requires valid SMTP credentials in `.env` to actually send emails.
- **SSL:** Production deployments require an SSL certificate (handled by reverse proxy like Nginx or Cloudflare).
