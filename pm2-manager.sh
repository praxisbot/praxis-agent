#!/bin/bash

# Praxis-AI PM2 Management Script
# Manages the bot process with automatic restarts and persistence

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMAND="${1:-status}"

case "$COMMAND" in
  start)
    echo "🚀 Starting Praxis-AI with PM2..."
    pm2 start "$PROJECT_DIR/ecosystem.config.cjs"
    pm2 status
    echo ""
    echo "✅ Bot is running!"
    ;;
    
  stop)
    echo "⏹️  Stopping Praxis-AI..."
    pm2 stop praxis-ai
    pm2 status
    ;;
    
  restart)
    echo "🔄 Restarting Praxis-AI..."
    pm2 restart praxis-ai
    sleep 2
    pm2 status
    echo ""
    echo "✅ Bot restarted!"
    ;;
    
  delete)
    echo "❌ Removing Praxis-AI from PM2..."
    pm2 delete praxis-ai
    echo "✅ Removed!"
    ;;
    
  logs)
    echo "📋 Praxis-AI Logs (last 50 lines):"
    pm2 logs praxis-ai --tail 50 --nostream
    ;;
    
  watch)
    echo "👀 Watching Praxis-AI logs live..."
    pm2 logs praxis-ai
    ;;
    
  monit)
    echo "📊 Monitoring Praxis-AI (real-time)..."
    pm2 monit
    ;;
    
  setup)
    echo "🛠️  Setting up PM2 to start on system boot..."
    pm2 startup
    echo ""
    echo "💾 Saving PM2 configuration..."
    pm2 save
    echo ""
    echo "✅ PM2 will auto-start the bot on system reboot!"
    ;;
    
  status)
    pm2 status
    ;;
    
  *)
    echo "Praxis-AI PM2 Manager"
    echo "===================="
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start      - Start the bot"
    echo "  stop       - Stop the bot"
    echo "  restart    - Restart the bot"
    echo "  delete     - Remove from PM2"
    echo "  logs       - View last 50 log lines"
    echo "  watch      - Watch logs in real-time"
    echo "  monit      - Monitor (CPU, memory)"
    echo "  setup      - Auto-start on system boot"
    echo "  status     - Show PM2 status"
    echo ""
esac
