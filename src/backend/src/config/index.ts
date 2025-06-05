const config = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/yt-tutorial',
    jwtSecret: process.env.JWT_SECRET || 'Baactcbj1981!'
}

export default config