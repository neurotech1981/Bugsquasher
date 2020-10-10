const config = {
	port: process.env.PORT || 3001,
	jwtSecret: process.env.JWT_SECRET || '<Password here>',
	mongoURI: process.env.MONGODB_URI || '<MongoDB Connection string (mongodb://localhost:27017/bugsquasher>'
};

export default config;