module.exports = {
  apps: [
    {
      name: 'my-next',
      script: '.next/standalone/server.js',
      cwd: '/var/www/x-blog',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'prisma-studio',
      script: 'npx',
      args: 'prisma studio --port 5555 --hostname 0.0.0.0',
      cwd: '/var/www/x-blog',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
}; 