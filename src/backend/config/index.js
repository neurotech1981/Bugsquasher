const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || "946Dypew!",
  mongoURI: process.env.MONGODB_URI || "mongodb://localhost/bugsquasher"
};

export default config;
