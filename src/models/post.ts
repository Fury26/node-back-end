import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';

export interface IPost extends mongoose.Document {
	body: string;
	title: string;
	owner: Schema.Types.ObjectId;
	likes: number;
	dislikes: number;
	comments: Schema.Types.ObjectId[];
}

const Post = mongoose.model<IPost>(
	'Post',
	new mongoose.Schema(
		{
			title: {
				type: String,
				required: true,
				minlength: 5,
				maxlength: 50,
			},
			body: {
				type: String,
				required: true,
				minlength: 1,
				maxlength: 255,
			},
			owner: {
				type: Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
			likes: {
				type: Number,
				default: 0,
			},
			dislikes: {
				type: Number,
				default: 0,
			},
			comments: [
				{
					type: Schema.Types.ObjectId,
					ref: 'Comment',
				},
			],
		},
		{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
	),
);

function validatePost(post: typeof Post) {
	const schema = Joi.object({
		title: Joi.string().min(5).max(50).required(),
		body: Joi.string().min(1).max(255).required(),
	});
	// Joi.te(user, schema);
	return schema.validate(post);
}
export { validatePost };
export default Post;
