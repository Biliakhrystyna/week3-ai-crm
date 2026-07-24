import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Очікуємо "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret');
    (req as any).user = decoded; // Додаємо дані юзера в об'єкт запиту
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden', message: 'Invalid token' });
  }
};