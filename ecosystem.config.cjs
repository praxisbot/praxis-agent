module.exports = {
  apps: [
    {
      name: "praxis-ai",
      script: "src/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production"
      },
      error_file: "logs/praxis-error.log",
      out_file: "logs/praxis-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "500M",
      autorestart: true,
      watch: false,
      ignore_watch: [
        "node_modules",
        "logs"
      ],
      max_restarts: 10,
      min_uptime: "10s",
      listen_timeout: 5000,
      kill_timeout: 5000
    }
  ]
};
