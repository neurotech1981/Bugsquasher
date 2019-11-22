const config = {
	port: process.env.PORT || 3001,
	jwtSecret: process.env.JWT_SECRET || '<insert secret here>!',
	mongoURI: process.env.MONGODB_URI || 'mongodb://username:password@<host>.mlab.com:27376/bugsquasher'
};

export default config;
