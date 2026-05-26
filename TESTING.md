# Phase 1 Testing Guide

## Running the Test Suites

### Prerequisites
1. Ensure the server is running: `npm start`
2. Database should be accessible
3. Admin account should exist (admin@nutri.com / admin123)

### Test Commands

```bash
# Run all tests
npm run test:phase1

# Run individual test suites
node scripts/test_security.js      # Security tests
node scripts/test_database.js      # Database transaction tests
node scripts/test_errors.js        # Error handling tests
```

## Test Coverage

### Security Tests (test_security.js)
- ✅ SQL injection prevention
- ✅ Password strength validation
- ✅ XSS sanitization
- ✅ Request ID tracking
- ✅ Standardized error format
- ✅ Input validation ranges
- ✅ Rate limiting
- ✅ CORS headers

### Database Tests (test_database.js)
- ✅ Transaction rollback
- ✅ Transaction commit
- ✅ Connection pool behavior
- ✅ Query timeout protection
- ✅ Parameterized query safety

### Error Handling Tests (test_errors.js)
- ✅ 404 error format
- ✅ Validation error structure
- ✅ Authentication errors
- ✅ Request ID in errors
- ✅ Production error safety
- ✅ Error message quality
- ✅ Rate limit error format

## Expected Results

All tests should pass with 100% success rate. If any tests fail:

1. Check server logs for errors
2. Verify database connection
3. Ensure environment variables are set correctly
4. Review the specific test output for details

## Manual Testing

### Test SQL Injection Prevention
```bash
# Try to inject SQL in client deletion
curl -X DELETE "http://localhost:5001/api/clients/1';DROP%20TABLE%20users;--" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Should return 404 or 403, not execute SQL
```

### Test Password Strength
```bash
# Weak password should fail
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak","name":"Test"}'
# Should return 400 with VALIDATION_ERROR
```

### Test Rate Limiting
```bash
# Make 6 rapid login attempts
for i in {1..6}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done
# 6th request should return 429
```

### Test Request ID Tracking
```bash
# Check response headers
curl -v http://localhost:5001/health
# Should include X-Request-ID header
```

## Troubleshooting

### Tests Timeout
- Increase timeout in test files
- Check server is running and accessible
- Verify network connectivity

### Database Tests Fail
- Ensure database is running
- Check DATABASE_URL in .env
- Verify database permissions

### Rate Limit Tests Don't Trigger
- Wait 15 minutes for rate limit to reset
- Check rate limit configuration in server.js
- Verify IP address isn't whitelisted

## Next Steps

After all tests pass:
1. Review test output for any warnings
2. Check server logs for any errors
3. Run tests in production environment
4. Document any environment-specific issues
