# Twin Rivers Contact System

Complete contact form and admin dashboard system for Twin Rivers LLC website.

## System Components

### 1. Backend API Server
- **Location**: `/var/www/twinrivers/server/`
- **Technology**: Node.js + Express + SQLite
- **Port**: 3001

### 2. Frontend Contact Form
- **Location**: `/var/www/twinrivers/index.html`
- **Submits to**: `http://localhost:3001/api/submit-quote`

### 3. Admin Dashboard
- **Location**: `/var/www/twinrivers/admin/index.html`
- **Access**: `http://localhost/admin/` or `http://yourdomain.com/admin/`
- **Default Password**: `twinrivers2024`

## Installation Complete ✓

All files have been created and dependencies installed.

## Starting the Server

### Option 1: Manual Start
```bash
cd /var/www/twinrivers/server
node server.js
```

### Option 2: Background Process (recommended)
```bash
cd /var/www/twinrivers/server
nohup node server.js > server.log 2>&1 &
```

### Option 3: Using PM2 (production recommended)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start server
cd /var/www/twinrivers/server
pm2 start server.js --name twinrivers-api

# Make it start on system boot
pm2 startup
pm2 save
```

## Nginx Configuration

Add this to your Nginx configuration to proxy API requests:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/twinrivers;
    index index.html;
    
    # Serve static files
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

After adding the configuration:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## API Endpoints

### POST /api/submit-quote
Submit a contact form
```json
{
  "name": "John Doe",
  "phone": "916-555-1234",
  "email": "john@example.com",
  "description": "Need fence installation"
}
```

### POST /api/login
Admin login
```json
{
  "password": "twinrivers2024"
}
```

### GET /api/submissions
Get all submissions (requires Bearer token)
```
Authorization: Bearer <token>
```

## Database

- **Type**: SQLite
- **Location**: `/var/www/twinrivers/server/data/submissions.db`
- **Auto-created**: Yes (on first server start)

## Security Notes

1. **Change the admin password** in `/var/www/twinrivers/server/server.js`:
   ```javascript
   const ADMIN_PASSWORD = 'your-secure-password-here';
   ```

2. **For production**, consider:
   - Using environment variables for passwords
   - Implementing JWT tokens
   - Adding rate limiting
   - Using HTTPS only
   - Adding CSRF protection

## Testing

1. **Start the server**:
   ```bash
   cd /var/www/twinrivers/server
   node server.js
   ```

2. **Test the contact form**:
   - Visit `http://localhost/` or your domain
   - Click "Contact" button
   - Fill out and submit the form

3. **Access admin dashboard**:
   - Visit `http://localhost/admin/`
   - Login with password: `twinrivers2024`
   - View submissions

## Troubleshooting

### Server won't start
```bash
# Check if port 3001 is already in use
sudo lsof -i :3001

# Kill existing process if needed
sudo kill -9 <PID>
```

### Form submission fails
- Ensure server is running
- Check browser console for errors
- Verify CORS is enabled in server.js

### Admin dashboard won't load submissions
- Check server is running
- Verify you're logged in
- Check browser console for errors

## File Structure

```
/var/www/twinrivers/
├── index.html              # Main website with contact form
├── admin/
│   └── index.html         # Admin dashboard
├── server/
│   ├── server.js          # Express API server
│   ├── package.json       # Dependencies
│   ├── node_modules/      # Installed packages
│   └── data/
│       └── submissions.db # SQLite database (auto-created)
└── README.md              # This file
```

## Support

For issues or questions, contact the system administrator.
