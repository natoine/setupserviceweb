import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

const TOKEN_EXPIRY = '7d';

export interface JwtPayload {
	userId: number;
	email: string;
}

export function signToken(payload: JwtPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch {
		return null;
	}
}
