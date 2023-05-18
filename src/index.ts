import userRoutes from './routes/user';
import express from 'express';
import dotenv from 'dotenv';
// import Joi from 'joi';
// Joi.objectId from 'joi-objectid'(Joi);
import mongoose from 'mongoose';
// import { Db, MongoClient } from 'mongodb';
import User from './models/user';
import { MongoClient } from 'mongodb';
dotenv.config();
const app = express();

// const client = new MongoClient(process.env.MONGO_DB_URL || '', {
// 	serverApi: {
// 		version: ServerApiVersion.v1,
// 		strict: true,
// 		deprecationErrors: true,
// 	},
// });

const start = async () => {
	let client;
	try {
		console.log('tryung', process.env.MONGD_URL_ENCODED);

		// client = await mongoose.connect(process.env.MONGD_URL_ENCODED || '', { autoCreate: true });

		// await client.connect();
		// client = await MongoClient.connect(process.env.MONGO_DB_URL!);
		await mongoose.connect(process.env.MONGO_DB_URL!);
		console.log('connected');
		// const collection = await client.db('node-back-end').collection('User').findOne({ email: 'aa' });
		// console.log('col', collection);
	} catch (err) {
		return console.error('Mongo DB connection error', err);
	}

	app.use(express.json());
	app.use('/api/users', userRoutes);
	const users = await User.findOne({ email: 'dasds÷/' });
	console.log('users', users);
	const port = process.env.PORT || 4000;
	app.listen(port, () => console.log(`Listening on port ${port}...`));
};

start();
