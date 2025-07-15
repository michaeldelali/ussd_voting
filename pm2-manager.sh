#!/bin/bash

# PM2 Management Script for Borbor Carnival Voting System
# Usage: ./pm2-manager.sh [start|stop|restart|reload|logs|status|monit]

APP_NAME="borbor-carnival-voting"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_usage() {
    echo "Usage: $0 [start|stop|restart|reload|logs|status|monit|deploy]"
    echo ""
    echo "Commands:"
    echo "  start    - Start the application"
    echo "  stop     - Stop the application"
    echo "  restart  - Restart the application"
    echo "  reload   - Graceful reload (zero-downtime)"
    echo "  logs     - Show application logs"
    echo "  status   - Show PM2 process status"
    echo "  monit    - Open PM2 monitoring interface"
    echo "  deploy   - Deploy from git repository"
}

case "$1" in
    start)
        echo -e "${GREEN}Starting $APP_NAME...${NC}"
        pm2 start ecosystem.config.js --env production
        ;;
    stop)
        echo -e "${YELLOW}Stopping $APP_NAME...${NC}"
        pm2 stop $APP_NAME
        ;;
    restart)
        echo -e "${YELLOW}Restarting $APP_NAME...${NC}"
        pm2 restart $APP_NAME
        ;;
    reload)
        echo -e "${GREEN}Gracefully reloading $APP_NAME...${NC}"
        pm2 reload $APP_NAME
        ;;
    logs)
        echo -e "${GREEN}Showing logs for $APP_NAME...${NC}"
        pm2 logs $APP_NAME --lines 50
        ;;
    status)
        echo -e "${GREEN}PM2 Status:${NC}"
        pm2 status
        ;;
    monit)
        echo -e "${GREEN}Opening PM2 monitoring interface...${NC}"
        pm2 monit
        ;;
    deploy)
        echo -e "${GREEN}Deploying from repository...${NC}"
        git pull origin main
        npm install
        npm run build
        pm2 reload $APP_NAME
        echo -e "${GREEN}Deployment completed!${NC}"
        ;;
    *)
        print_usage
        exit 1
        ;;
esac
