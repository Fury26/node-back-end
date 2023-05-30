import { Request, Response } from 'express';
import User, { validateUser } from '../models/user';
import { Router } from 'express';
import * as argon from 'argon2';
import jwt from 'jsonwebtoken';

const router = Router();

const generateToken = (id: string) => {
	const payload = { id };
	return jwt.sign(payload, process.env.JWT_SECRET_KEY!, { expiresIn: '24h' });
};

router.post('/', async (req: Request, res: Response) => {
	const { error } = validateUser(req.body);
	if (error) {
		return res.status(400).send({ error: error.details[0].message });
	}

	let user = await User.findOne({ email: req.body.email });
	if (user) {
		return res.status(400).send({ error: 'That user already exisits!' });
	} else {
		const hashed = await argon.hash(req.body.password, { hashLength: 7, secret: Buffer.from(process.env.ARGON_SECRET_KEY!) });
		user = new User({
			name: req.body.name,
			email: req.body.email,
			password: hashed,
		});
		await user.save();
		const token = generateToken(user.id);
		return res.status(201).json({ token });
	}
});

router.post('/login', async (req: Request, res: Response) => {
	const user = await User.findOne({ email: req.body.email }).select('password');
	console.log('user', user);

	if (!user) {
		return res.status(400).json({ error: 'Incorrect email or password!' });
	}
	const isValidPassword = await argon.verify(user.password, req.body.password, {
		secret: Buffer.from(process.env.ARGON_SECRET_KEY!),
	});
	if (!isValidPassword) {
		return res.status(400).json({ error: 'Incorrect email or password!' });
	}
	const token = generateToken(user.id);
	return res.json({ token });
});

router.get('/about', async (_req: Request, res: Response) => {
	const logo = `${process.env.DOMAIN_NAME}/static/images/logo.png`;
	const name = 'Твітер для бідних';
	const about = `Ця платформа для людей, які хочуть щось тут побалакати і не платити Ілону 8 баксів за верифікацію.`;
	res.json({ logo, about, name, relativeLogo: '/static/images/logo.png' });
});

export default router;
