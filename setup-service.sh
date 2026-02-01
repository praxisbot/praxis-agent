#!/bin/bash

# Praxis-AI Systemd Service Installation
# This script sets up the bot to run forever with auto-restart

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_FILE="praxis-ai.service"
SERVICE_PATH="/etc/systemd/system/praxis-ai.service"
USER=$(whoami)

echo "🤖 Praxis-AI Service Setup"
echo "================================"
echo ""
echo "⚠️  This script requires sudo access"
echo ""

# Create systemd service file with current user
echo "📝 Creating systemd service..."
sudo tee "$SERVICE_PATH" > /dev/null << EOF
[Unit]
Description=Praxis-AI Telegram Bot
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node $PROJECT_DIR/src/index.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"

# Keep the service running even if it crashes
StartLimitInterval=0
StartLimitBurst=0

# Resource limits
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Service file created at $SERVICE_PATH"
echo ""

# Reload systemd daemon
echo "🔄 Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable the service
echo "📌 Enabling service (auto-start on boot)..."
sudo systemctl enable praxis-ai.service

# Start the service
echo "🚀 Starting Praxis-AI service..."
sudo systemctl start praxis-ai.service

echo ""
echo "✅ Praxis-AI is now running forever!"
echo ""
echo "📋 Useful commands:"
echo "   sudo systemctl status praxis-ai          - Check status"
echo "   sudo systemctl restart praxis-ai         - Restart bot"
echo "   sudo systemctl stop praxis-ai            - Stop bot"
echo "   sudo systemctl start praxis-ai           - Start bot"
echo "   journalctl -u praxis-ai -f               - View live logs"
echo "   journalctl -u praxis-ai --tail 50 -f     - Last 50 lines"
echo ""
