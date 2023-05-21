import { Request, Response, Router } from 'express';
import User from '../models/user';
import { authorizationMiddleware } from '../middleware/auth';
import Post, { validatePost } from '../models/post';
import PostController from '../controllers/post';
import Comment, { validateComment } from '../models/comment';
const router = Router();

router.use(authorizationMiddleware);
router.post('/', async (req: Request, res: Response) => {
	const { error } = validatePost(req.body);
	if (error) {
		return res.status(400).send({ error: error.details[0].message });
	}
	try {
		const user = await User.findById(req.authUser.id);
		if (!user) {
			return res.json({ error: `Can't get user information` }).status(404);
		}
		const post = new Post({ title: req.body.title, body: req.body.body, owner: user, comments: [] });
		await post.save();
		res.json({ post }).status(201);
	} catch {
		res.json({ error: `Can't create your post!` }).status(400);
	}
	return;
});

router.get('/me', async (req: Request, res: Response) => {
	try {
		const user = await User.findById(req.authUser.id).populate('Post');
		if (!user) {
			return res.json({ error: `Can't get user information` }).status(404);
		}
		const post = new Post({ title: req.body.title, body: req.body.body, creator: user, comments: [] });
		await post.save();
		res.json({ post }).status(201);
	} catch {
		res.json({ error: `Can't create your post!` }).status(400);
	}
	return;
});

router.patch('/:id/statistics', async (req: Request, res: Response) => {
	const { type } = req.body;
	try {
		const user = await User.findById(req.authUser.id);

		if (!user) {
			return res.json({ error: `Can't get user information` }).status(404);
		}
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.json({ error: `Can't get post information` }).status(404);
		}
		switch (type) {
			case 'like': {
				const { error } = PostController.likePost(post, user);
				if (error) {
					return res.json({ error }).status(400);
				}
				break;
			}
			case 'dislike': {
				const { error } = PostController.dislikePost(post, user);
				if (error) {
					return res.json({ error }).status(400);
				}
				break;
			}
			default: {
				return res.json({ error: 'Passed type is not supported!' }).status(400);
			}
		}
		await post.save();
		await user.save();
		res.json({ post }).status(201);
	} catch {
		res.json({ error: `Can't like post: ${req.params.id}!` }).status(400);
	}
	return;
});

router.post('/:postId/comment', async (req: Request, res: Response) => {
	const { error } = validateComment(req.body);
	if (error) {
		return res.status(400).send({ error: error.details[0].message });
	}
	try {
		const user = await User.findById(req.authUser.id);

		if (!user) {
			return res.json({ error: `Can't get user information` }).status(404);
		}
		const post = await Post.findById(req.params.postId);
		if (!post) {
			return res.json({ error: `Can't get post information` }).status(404);
		}
		const comment = new Comment({ text: req.body.text, creator: user });
		await comment.save();
		res.json({ comment }).status(201);
	} catch {
		res.json({ error: `Can't add comment for post: ${req.params.postId}!` }).status(400);
	}
	return;
});

router.delete('/comment/:commentId', async (req: Request, res: Response) => {
	const { error } = validateComment(req.body);
	if (error) {
		return res.status(400).send({ error: error.details[0].message });
	}
	try {
		console.log('before delete', req.params.commentId);

		await Comment.findByIdAndDelete(req.params.commentId);
		console.log('after');

		res.json('ok').status(204);
	} catch {
		res.json({ error: `Can't delete comment: ${req.params.commentId}!` }).status(400);
	}
	return;
});

router.delete('/:postId', async (req: Request, res: Response) => {
	try {
		await Post.findByIdAndDelete(req.params.postId);
		res.json('ok').status(204);
	} catch {
		res.json({ error: `Can't delete post: ${req.params.commentId}!` }).status(400);
	}
	return;
});

export default router;