const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || '',
  mongoURI: process.env.MONGODB_URI || ''
}

export default config
