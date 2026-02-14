#!/bin/bash

echo "🚀 NutriConsult Pro - Production Deployment Script"
echo "=================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables."
    exit 1
fi

# Load environment variables
source .env

echo ""
echo "📦 Step 1: Installing dependencies..."
cd backend
npm install
cd ..

echo ""
echo "🗄️  Step 2: Running database migrations..."
cd backend
npm run migrate
cd ..

echo ""
echo "🌱 Step 3: Seeding initial data (optional)..."
read -p "Do you want to seed sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    cd backend
    npm run seed
    cd ..
fi

echo ""
echo "🔧 Step 4: Building frontend..."
# If using a build tool, add build command here
# npm run build

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to your hosting service (Heroku, Railway, etc.)"
echo "2. Deploy frontend to Netlify/Vercel"
echo "3. Update frontend API_URL to point to your backend"
echo "4. Test the application thoroughly"
echo ""
echo "To start the backend locally:"
echo "  cd backend && npm start"
