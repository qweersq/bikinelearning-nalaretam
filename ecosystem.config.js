module.exports = {
  apps: [
    {
      name: "nalaretam",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3003",
      instances: "max", // Runs in cluster mode using all available CPU cores
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3003
      }
    }
  ]
};
