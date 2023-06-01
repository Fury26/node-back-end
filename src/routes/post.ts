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
			return res.status(404).json({ error: `Can't get user information` });
		}
		const post = new Post({ title: req.body.title, body: req.body.body, owner: user, comments: [] });
		await post.save();
		res.status(201).json({ post });
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
			return res.status(404).json({ error: `Can't get user information` });
		}
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: `Can't get post information` });
		}
		switch (type) {
			case 'like': {
				const { error } = PostController.likePost(post, user);
				if (error) {
					return res.status(400).json({ error });
				}
				break;
			}
			case 'dislike': {
				const { error } = PostController.dislikePost(post, user);
				if (error) {
					return res.status(400).json({ error });
				}
				break;
			}
			default: {
				return res.status(400).json({ error: 'Passed type is not supported!' });
			}
		}
		await post.save();
		await user.save();
		res.status(201).json({ post: { ...post.toObject(), owner: user }, user });
	} catch {
		res.status(400).json({ error: `Can't like post: ${req.params.id}!` });
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
			return res.status(404).json({ error: `Can't get user information` });
		}
		const post = await Post.findById(req.params.postId).populate('owner');
		if (!post) {
			return res.status(404).json({ error: `Can't get post information` });
		}
		const comment = new Comment({ text: req.body.text, creator: user, post });
		await comment.save();
		res.status(201).json({ comment });
	} catch {
		res.status(400).json({ error: `Can't add comment for post: ${req.params.postId}!` });
	}
	return;
});

router.delete('/comment/:commentId', async (req: Request, res: Response) => {
	try {
		await Comment.findByIdAndDelete(req.params.commentId);
		res.status(204).json('ok');
	} catch {
		res.status(400).json({ error: `Can't delete comment: ${req.params.commentId}!` });
	}
	return;
});

router.delete('/:postId', async (req: Request, res: Response) => {
	try {
		await Post.findByIdAndDelete(req.params.postId);
		res.status(204).json('ok');
	} catch {
		res.status(400).json({ error: `Can't delete post: ${req.params.commentId}!` });
	}
	return;
});

router.get('/feed', async (req: Request, res: Response) => {
	const page = +(req.query.page || 1);
	const perPage = +(req.query.perPage || 30);

	try {
		const user = await User.findById(req.authUser.id);
		if (!user) {
			return res.status(404).json({ error: `Unauthorized user. You need to be loged in to see other peoples posts!` });
		}
		const posts = await Post.find(
			{},
			{},
			{ limit: perPage, skip: perPage * (page - 1), sort: { created_at: '-1' } },
		).populate('owner');
		const count = await Post.count();
		res.json({ posts, metadata: { count, perPage, page } });
	} catch {
		res.status(400).json({ error: 'Something went wrong. Try update your feed later.' });
	}
	return;
});

router.get('/:postId', async (req: Request, res: Response) => {
	try {
		const post = await Post.findById(req.params.postId).populate('owner');
		res.status(200).json({ post });
	} catch {
		res.status(400).json({ error: `Can't get post: ${req.params.postId}!` });
	}
	return;
});

router.get('/:postId/comments', async (req: Request, res: Response) => {
	const page = +(req.query.page || 1);
	const perPage = +(req.query.perPage || 30);

	try {
		const user = await User.findById(req.authUser.id);
		if (!user) {
			return res.status(404).json({ error: `Unauthorized user. You need to be loged in to see other peoples posts!` });
		}
		const post = await Post.findById(req.params.postId).populate('owner');
		if (!post) {
			return res.status(404).json({ error: `Can't get post information` });
		}
		const comments = await Comment.find(
			{ post },
			{},
			{ limit: perPage, skip: perPage * (page - 1), sort: { created_at: '-1' } },
		).populate('creator');
		const count = await Comment.count({ post });
		res.json({ comments, metadata: { count, perPage, page } });
	} catch {
		res.status(400).json({ error: 'Something went wrong. Try update your feed later.' });
	}
	return;
});

router.get('/me', async (req: Request, res: Response) => {
	const page = +(req.query.page || 1);
	const perPage = +(req.query.perPage || 30);
	try {
		const user = await User.findById(req.authUser.id);
		if (!user) {
			return res.status(404).json({ error: `Unknown user.` });
		}
		const posts = await Post.find(
			{ owner: user },
			{},
			{ limit: perPage, skip: perPage * (page - 1), sort: { created_at: '-1' } },
		).populate('owner');
		const count = await Post.count({ owner: user });
		res.json({ posts, metadata: { count, perPage, page } });
	} catch {
		res.status(400).json({ error: 'Something went wrong. Try update your feed later.' });
	}
	return;
});

export default router;
