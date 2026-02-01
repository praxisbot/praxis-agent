#!/bin/bash

# Praxis-AI Systemd Service Setup
# Usage: sudo ./install-service.sh

if [ "$EUID" -ne 0 ]; then 
  echo "This script must be run as root (use sudo)"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_FILE="/etc/systemd/system/praxis-ai.service"
USER="${SUDO_USER:-praxis}"

echo "📦 Installing Praxis-AI systemd service..."

# Create service user if doesn't exist
if ! id -u "$USER" &>/dev/null; then
  echo "Creating user: $USER"
  useradd -r -s /bin/bash -d "$PROJECT_DIR" "$USER"
fi

# Set ownership
chown -R "$USER:$USER" "$PROJECT_DIR"

# Create systemd service file
cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Praxis-AI Autonomous Agent
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/env node $PROJECT_DIR/src/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chmod 644 "$SERVICE_FILE"

# Reload systemd
systemctl daemon-reload

echo "✅ Service file created: $SERVICE_FILE"
echo ""
echo "Available commands:"
echo "  systemctl start praxis-ai     - Start agent"
echo "  systemctl stop praxis-ai      - Stop agent"
echo "  systemctl restart praxis-ai   - Restart agent"
echo "  systemctl enable praxis-ai    - Auto-start on boot"
echo "  systemctl disable praxis-ai   - Disable auto-start"
echo "  systemctl status praxis-ai    - Check status"
echo "  journalctl -u praxis-ai -f    - View logs (follow)"
echo ""
echo "To enable auto-start on boot:"
echo "  sudo systemctl enable praxis-ai"
echo ""
echo "To start the service:"
echo "  sudo systemctl start praxis-ai"
echo ""
echo "To check logs:"
echo "  sudo journalctl -u praxis-ai -f"
