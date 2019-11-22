const config = {
	port: process.env.PORT || 3001,
	jwtSecret: process.env.JWT_SECRET || '946Dypew!',
	mongoURI: process.env.MONGODB_URI || 'mongodb://neurotech:946Dypew!@ds127376.mlab.com:27376/bugsquasher'
};

export default config;