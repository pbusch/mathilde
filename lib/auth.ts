import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import pool from './db';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface User {
  id: number;
  username: string;
  email: string;
  isTeacher: boolean;
}

export interface JWTPayload {
  userId: number;
  username: string;
  isTeacher: boolean;
}

/**
 * Create a JWT token for a user
 */
export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    username: user.username,
    isTeacher: user.isTeacher,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get the current user from the session cookie
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  // Fetch full user data from database
  try {
    const [rows]: any = await pool.execute(
      'SELECT id, username, email, is_teacher FROM users WHERE id = ?',
      [payload.userId]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isTeacher: user.is_teacher,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Get user's progress for all islands
 */
export async function getUserProgress(userId: number) {
  try {
    const [rows]: any = await pool.execute(
      'SELECT island_id, completed, score, completed_at FROM user_progress WHERE user_id = ? ORDER BY island_id',
      [userId]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }
}

/**
 * Update user's progress for an island
 */
export async function updateUserProgress(
  userId: number,
  islandId: number,
  completed: boolean,
  score: number
) {
  try {
    await pool.execute(
      `INSERT INTO user_progress (user_id, island_id, completed, score, completed_at) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       completed = VALUES(completed), 
       score = GREATEST(score, VALUES(score)),
       completed_at = IF(VALUES(completed) = TRUE AND completed = FALSE, VALUES(completed_at), completed_at)`,
      [userId, islandId, completed, score, completed ? new Date() : null]
    );
    return true;
  } catch (error) {
    console.error('Error updating user progress:', error);
    return false;
  }
}
