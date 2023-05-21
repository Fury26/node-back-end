import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';

export interface IUser extends mongoose.Document {
	name: string;
	email: string;
	password: string;
	likedPosts: Schema.Types.ObjectId[];
	dislikedPosts: Schema.Types.ObjectId[];
}

const User = mongoose.model<IUser>(
	'User',
	new mongoose.Schema({
		name: {
			type: String,
			required: true,
			minlength: 5,
			maxlength: 50,
		},
		email: {
			type: String,
			required: true,
			minlength: 5,
			maxlength: 255,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 5,
			maxlength: 30,
			select: false,
		},
		likedPosts: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Post',
			},
		],
		dislikedPosts: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Post',
			},
		],
	}),
);

function validateUser(user: typeof User) {
	const schema = Joi.object({
		name: Joi.string().min(5).max(50).required(),
		email: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(5).max(30).required(),
	});
	// Joi.te(user, schema);
	return schema.validate(user);
}

export default User;
export { validateUser };
