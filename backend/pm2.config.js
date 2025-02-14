module.exports = {
  apps: [
    {
      name: "hydrolink-backend", // Name of your app
      script: "src/app.js", // Entry file
      interpreter: "bun", // Use Bun as interpreter
      env: {
        PORT: 6767,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_KEY: process.env.SUPABASE_KEY,
      },
    },
  ],
};
