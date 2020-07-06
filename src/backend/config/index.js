const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || "<secret here>",
  mongoURI: process.env.MONGODB_URI || "mongodb://localhost/bugsquasher"
};

export default config;
