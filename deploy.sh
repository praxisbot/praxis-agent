#!/bin/bash

# Praxis-AI Deployment Script
# Usage: ./deploy.sh [start|stop|restart|logs|status]

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION_NAME="praxis-ai"
LOG_FILE="$PROJECT_DIR/logs/praxis.log"

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

case "${1:-start}" in
  start)
    echo "🚀 Starting Praxis-AI..."
    
    # Check if already running
    if tmux list-sessions -F '#{session_name}' | grep -q "^${SESSION_NAME}$"; then
      echo "⚠️  Agent already running in tmux session: $SESSION_NAME"
      echo "Attach with: tmux attach-session -t $SESSION_NAME"
      exit 0
    fi
    
    # Start new tmux session
    tmux new-session -d -s "$SESSION_NAME" \
      -c "$PROJECT_DIR" \
      "npm start >> $LOG_FILE 2>&1"
    
    echo "✅ Praxis-AI started in tmux session: $SESSION_NAME"
    echo "View logs: tmux attach-session -t $SESSION_NAME"
    echo "Or: tail -f $LOG_FILE"
    ;;
    
  stop)
    echo "⏹️  Stopping Praxis-AI..."
    if tmux list-sessions -F '#{session_name}' | grep -q "^${SESSION_NAME}$"; then
      tmux kill-session -t "$SESSION_NAME"
      echo "✅ Praxis-AI stopped"
    else
      echo "⚠️  Agent not running"
    fi
    ;;
    
  restart)
    echo "🔄 Restarting Praxis-AI..."
    if tmux list-sessions -F '#{session_name}' | grep -q "^${SESSION_NAME}$"; then
      tmux kill-session -t "$SESSION_NAME"
      sleep 1
    fi
    
    tmux new-session -d -s "$SESSION_NAME" \
      -c "$PROJECT_DIR" \
      "npm start >> $LOG_FILE 2>&1"
    
    echo "✅ Praxis-AI restarted"
    ;;
    
  logs)
    if [ -f "$LOG_FILE" ]; then
      echo "📄 Recent logs (last 50 lines):"
      tail -50 "$LOG_FILE"
    else
      echo "No logs found yet. Start the agent with: ./deploy.sh start"
    fi
    ;;
    
  status)
    if tmux list-sessions -F '#{session_name}' | grep -q "^${SESSION_NAME}$"; then
      echo "✅ Praxis-AI is running"
      echo "Sessions:"
      tmux list-sessions | grep "$SESSION_NAME"
      echo ""
      echo "Windows:"
      tmux list-windows -t "$SESSION_NAME"
    else
      echo "❌ Praxis-AI is not running"
    fi
    ;;
    
  *)
    echo "Usage: ./deploy.sh [start|stop|restart|logs|status]"
    echo ""
    echo "Commands:"
    echo "  start     Start Praxis-AI in background (tmux)"
    echo "  stop      Stop Praxis-AI"
    echo "  restart   Restart Praxis-AI"
    echo "  logs      View recent logs"
    echo "  status    Check if running"
    exit 1
    ;;
esac
