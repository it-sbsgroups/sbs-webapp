module.exports = {
  apps: [
    {
      name: "sbsnewapp-frontend",
      script: "npm",
      args: "run start -- -p 3000 -H 127.0.0.1",
      cwd: "/var/www/sbs-webapp/my-app",

      env: {
        NODE_ENV: "production",
        PORT: "3000",
        // MUST stay 127.0.0.1, not the server's public IP. PM2's `env` block
        // takes priority over .env, so this was silently overriding the
        // correct internal value with the public IP on port 4000 — a port
        // that's deliberately firewalled off from the outside. Every
        // server-to-server call (login, SSR data fetches, sitemap) was
        // therefore hitting a blocked port and hanging with no error
        // instead of connecting locally.
        API_URL: "http://127.0.0.1:4000/api",
        NEXT_PUBLIC_API_URL: "https://sbsgroups.co.in/api",
      },

      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
