import authRoutes from './routes/authorization';
import userRoutes from './routes/user';
import postRoutes from './routes/post';

import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
dotenv.config();
const app = express();

const start = async () => {
	try {
		await mongoose.connect(process.env.MONGO_DB_URL!, { autoCreate: true });
		console.info('MongoClient connected!');
	} catch (err) {
		return console.error('Mongo DB connection error', err);
	}

	app.use(express.json());
	app.use('/static', express.static(path.join(__dirname, '../public')));
	app.use('/api/auth', authRoutes);
	app.use('/api/users', userRoutes);
	app.use('/api/posts', postRoutes);

	const port = process.env.PORT || 4000;
	app.listen(port, () => console.log(`Listening on port ${port}...`));
};

start();
