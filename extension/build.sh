#!/bin/bash

# Extension Build Script
# Usage: ./build.sh [production|development]

# Default to development
ENV=${1:-development}

if [ "$ENV" = "production" ]; then
  API_URL="https://your-app.vercel.app"  # CHANGE THIS
  echo "Building for PRODUCTION with API_URL: $API_URL"
else
  API_URL="http://localhost:3000"
  echo "Building for DEVELOPMENT with API_URL: $API_URL"
fi

# Update popup.js
sed -i.bak "s|const API_BASE = .*|const API_BASE = '$API_URL'|" popup/popup.js

# Update background/service-worker.js
sed -i.bak "s|const API_BASE = .*|const API_BASE = '$API_URL'|" background/service-worker.js

# Clean up backup files
rm popup/popup.js.bak background/service-worker.js.bak 2>/dev/null

echo "✓ Extension built for $ENV"
echo ""
echo "Next steps:"
if [ "$ENV" = "production" ]; then
  echo "1. Update manifest.json host_permissions with your production domain"
  echo "2. Zip the extension folder: zip -r extension.zip ."
  echo "3. Upload to Chrome Web Store"
else
  echo "1. Go to chrome://extensions/"
  echo "2. Click 'Load unpacked'"
  echo "3. Select the extension folder"
fi
