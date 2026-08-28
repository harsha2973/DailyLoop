import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Signs a JWT containing the user's id. The token is verified by the
 * `protect` middleware on every subsequent authenticated request.
 */
export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '30d') as SignOptions['expiresIn'];

  return jwt.sign({ id: userId }, secret, { expiresIn });
};
