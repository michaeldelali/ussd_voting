module.exports = {
  apps: [
    {
      name: 'borbor-carnival-voting',
      script: 'npm',
      args: 'start',
      cwd: '/root/voting-ussd', // Update this to your actual production path
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Add other environment variables that don't contain secrets
      },
      
      // Production environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Set production-specific variables here
        // Secrets should be set via .env file or server environment
      },
      
      // PM2 Configuration
      watch: false, // Don't watch files in production
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Memory management
      max_memory_restart: '1G',
      
      // Health check
      health_check_grace_period: 3000,
      
      // Advanced settings
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
      
      // Auto restart on file changes (disabled for production)
      autorestart: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'ubuntu', // Update with your server username
      host: ['141.136.35.33'], // Update with your server IP/domain
      ref: 'origin/main',
      repo: 'https://github.com/michaeldelali/ussd_voting.git',
      path: '/var/www/borbor-carnival-voting',
      
      // Pre-deploy commands
      'pre-deploy-local': '',
      
      // Post-deploy commands
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      
      // Pre-setup commands
      'pre-setup': '',
      
      // Environment variables for deployment
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
