# Production Deployment Guide

This guide covers how to deploy the Borbor Carnival Voting System to production using PM2.

## Prerequisites

- Node.js 18+ installed
- PM2 process manager
- Database (PostgreSQL or MySQL) configured
- Domain name and SSL certificate (recommended)

## Quick Setup

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Clone the repository:**
   ```bash
   git clone https://github.com/michaeldelali/ussd_voting.git
   cd ussd_voting
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure environment:**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your production values
   ```

5. **Run deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Manual Deployment

If you prefer manual deployment:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Update ecosystem.config.js:**
   - Update the `cwd` path to your application directory
   - Configure environment variables
   - Adjust memory limits and instance count as needed

3. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

## Configuration Files

### ecosystem.config.js
The main PM2 configuration file that defines:
- Application settings
- Environment variables
- Logging configuration
- Process management settings
- Deployment configuration

### .env.production
Production environment variables including:
- Database connection
- Payment gateway configuration
- JWT secrets
- Application URLs

## PM2 Management

Use the provided management script:

```bash
chmod +x pm2-manager.sh

# Available commands:
./pm2-manager.sh start    # Start the application
./pm2-manager.sh stop     # Stop the application
./pm2-manager.sh restart  # Restart the application
./pm2-manager.sh reload   # Graceful reload (zero-downtime)
./pm2-manager.sh logs     # Show application logs
./pm2-manager.sh status   # Show PM2 process status
./pm2-manager.sh monit    # Open PM2 monitoring interface
./pm2-manager.sh deploy   # Deploy from git repository
```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit                    # Real-time monitoring
pm2 status                   # Process status
pm2 logs borbor-carnival-voting  # View logs
```

### Log Files
Logs are stored in the `logs/` directory:
- `logs/combined.log` - All logs
- `logs/out.log` - Standard output
- `logs/error.log` - Error logs

## Security Considerations

1. **Environment Variables:**
   - Never commit `.env.production` to version control
   - Use strong, unique secrets for JWT
   - Rotate API keys regularly

2. **Database:**
   - Use a dedicated production database
   - Enable SSL connections
   - Regular backups

3. **Server:**
   - Use a reverse proxy (Nginx/Apache)
   - Enable SSL/TLS
   - Configure firewall rules
   - Regular security updates

## Performance Optimization

1. **PM2 Configuration:**
   - Adjust `instances` based on CPU cores
   - Set appropriate `max_memory_restart`
   - Monitor and adjust restart policies

2. **Application:**
   - Enable Next.js production optimizations
   - Configure caching strategies
   - Monitor database query performance

## Troubleshooting

### Common Issues

1. **Application won't start:**
   ```bash
   pm2 logs borbor-carnival-voting  # Check logs
   pm2 describe borbor-carnival-voting  # Detailed info
   ```

2. **Memory issues:**
   - Adjust `max_memory_restart` in ecosystem.config.js
   - Monitor with `pm2 monit`

3. **Database connection issues:**
   - Verify DATABASE_URL in .env.production
   - Check database server status
   - Verify network connectivity

### Useful Commands

```bash
# View detailed process information
pm2 describe borbor-carnival-voting

# Restart on code changes
pm2 reload borbor-carnival-voting

# Delete and restart process
pm2 delete borbor-carnival-voting
pm2 start ecosystem.config.js --env production

# View real-time logs
pm2 logs borbor-carnival-voting --lines 100 -f

# Export/Import PM2 configuration
pm2 save
pm2 resurrect
```

## Backup Strategy

1. **Database:**
   - Schedule regular automated backups
   - Test restore procedures
   - Store backups securely off-site

2. **Application:**
   - Use version control (Git)
   - Document configuration changes
   - Maintain rollback procedures

## Updates and Maintenance

1. **Code Updates:**
   ```bash
   ./pm2-manager.sh deploy
   ```

2. **Dependency Updates:**
   ```bash
   npm update
   npm audit fix
   pm2 reload borbor-carnival-voting
   ```

3. **System Maintenance:**
   - Regular security updates
   - Monitor resource usage
   - Log rotation and cleanup

## Support

For issues or questions:
1. Check the application logs first
2. Review this documentation
3. Contact the development team
