import mongoose, { Schema } from 'mongoose';

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
			owner: {
				type: Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
		},
		{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
	),
);

export default Comment;
