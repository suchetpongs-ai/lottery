#!/bin/bash

# Configuration
DOMAIN="hauythai.com"
APP_PORT=3000
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"

echo "🚀 Starting Nginx Setup for $DOMAIN..."

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run as root (use sudo)"
  exit 1
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Nginx not found. Installing..."
    apt-get update
    apt-get install -y nginx
fi

# Create Nginx Configuration
echo "📝 Creating Nginx configuration..."
cat > "$NGINX_CONFIG" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable Site
if [ ! -f "$NGINX_ENABLED" ]; then
    echo "🔗 Enabling site..."
    ln -s "$NGINX_CONFIG" "$NGINX_ENABLED"
fi

# Remove default config if it exists (to avoid conflicts)
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "🗑️ Removing default Nginx config..."
    rm /etc/nginx/sites-enabled/default
fi

# Test Configuration
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "🔄 Restarting Nginx..."
    systemctl restart nginx
    echo "✅ Success! $DOMAIN should now be accessible."
else
    echo "❌ Nginx configuration failed verification."
    exit 1
fi
