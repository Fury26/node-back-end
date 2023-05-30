import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

export const authorizationMiddleware = (req: Request, res: Response, next: () => void) => {
	try {
		const token = req.headers.authorization?.split(' ')[1];
		if (!token) {
			return res.status(401).json({ error: 'Authorization error' });
		}
		const payload = jwt.verify(token, process.env.JWT_SECRET_KEY!) as { id: string };
		if (!payload.id) {
			return res.status(401).json({ error: 'Authorization error' });
		}
		req.authUser = { id: payload.id };
		next();
	} catch (error) {
		res.status(401).json({ error: 'Authorization error' });
	}
	return;
};
