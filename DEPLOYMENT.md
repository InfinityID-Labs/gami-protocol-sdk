# Gami Protocol Deployment Guide

This guide explains how to deploy the Gami Protocol application to a production environment.

## Prerequisites

- Node.js v20.x or higher
- PostgreSQL database
- Solana wallet with GAMI tokens
- Domain name (for production API and frontend)

## Environment Setup

1. Copy the `.env.production` file to your production server
2. Update the environment variables with your production values:
   ```
   NODE_ENV=production
   API_BASE_URL=https://your-api-domain.com
   CORS_ORIGINS=https://your-frontend-domain.com
   SOLANA_ENDPOINT=https://api.mainnet-beta.solana.com
   TOKEN_ADDRESS=your_production_token_address
   DATABASE_URL=your_production_database_url
   SESSION_SECRET=your_secure_random_string_min_32_chars
   ```

3. Ensure your PostgreSQL database is set up and accessible

## Building for Production

Run the following commands to build the application for production:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Optional: Remove development dependencies to reduce size
npm prune --production
```

## Database Setup

1. Push the database schema to your production database:
   ```bash
   npm run db:push
   ```

2. Verify the database schema was created correctly by checking the tables

## Starting the Production Server

```bash
# Start the server using the production environment
NODE_ENV=production node dist/index.js
```

## Production Deployment Best Practices

1. **Use a Process Manager**: It's recommended to use a process manager like PM2 to manage your Node.js application:
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start the application with PM2
   pm2 start dist/index.js --name "gami-protocol"
   
   # Configure PM2 to start on boot
   pm2 startup
   pm2 save
   ```

2. **Set Up HTTPS**: Use a reverse proxy like Nginx to handle HTTPS:
   ```nginx
   server {
       listen 80;
       server_name your-api-domain.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl;
       server_name your-api-domain.com;

       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Set Up Monitoring**: Consider using monitoring services like:
   - PM2 monitoring
   - Datadog
   - New Relic
   - Prometheus + Grafana

4. **Regular Backups**: Implement regular database backups

## Security Considerations

1. **API Keys**: Regenerate all API keys for production
2. **Session Secret**: Use a cryptographically secure random string for SESSION_SECRET
3. **Solana Keys**: Keep production Solana keys secure, preferably using a hardware wallet
4. **Rate Limiting**: The application includes rate limiting, but consider additional DDoS protection
5. **Environment Variables**: Keep your production environment variables secure

## Scaling Considerations

1. **Database Connection Pooling**: Adjust the database connection pool size based on your needs
2. **Horizontal Scaling**: The application can be scaled horizontally behind a load balancer
3. **Caching**: Implement Redis caching for frequently accessed data
4. **CDN**: Use a CDN for static assets

## Maintenance

1. **Updates**: Regularly update dependencies with `npm outdated` and `npm update`
2. **Logs**: Monitor application logs for errors and issues
3. **Backups**: Verify backup integrity regularly

For support, contact the Gami Protocol team at support@gamiprotocol.com.