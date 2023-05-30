import Joi from 'joi';
import mongoose, { Schema } from 'mongoose';

export interface IComment extends mongoose.Document {
	text: string;
	creator: Schema.Types.ObjectId;
}

const Comment = mongoose.model(
	'Comment',
	new mongoose.Schema(
		{
			text: {
				type: String,
				required: true,
				minlength: 1,
				maxlength: 100,
			},
			creator: {
				type: Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
			post: {
				type: Schema.Types.ObjectId,
				ref: 'Post',
				required: true,
			},
		},
		{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
	),
);

function validateComment(comment: IComment) {
	const schema = Joi.object({
		text: Joi.string().min(1).max(100).required(),
	});
	return schema.validate(comment);
}
export { validateComment };
export default Comment;
