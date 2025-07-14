import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma, type User } from '../database/models';

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
}

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';

  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      const user = await prisma.user.findFirst({
        where: { 
          email, 
          isActive: true
        }
      });
      console.log('User found:', user);

      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      console.log('Password valid:', isValidPassword);
      if (!isValidPassword) {
        return null;
      }

      const token = this.generateToken({
        userId: user.id,
        email: user.email,
        name: user.name
      });
      console.log('Generated token:', token);

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async createUser(email: string, password: string, name: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    return await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        isActive: true
      }
    });
  }

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  async getUserFromToken(token: string): Promise<User | null> {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    return await prisma.user.findFirst({
      where: { 
        id: payload.userId, 
        isActive: true 
      }
    });
  }
}

export const authService = new AuthService();