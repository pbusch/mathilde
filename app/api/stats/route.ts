import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only teachers can access stats
    if (!user.isTeacher) {
      return NextResponse.json(
        { error: 'Unauthorized - teachers only' },
        { status: 403 }
      );
    }

    // Fetch all non-teacher users with their progress
    const [users]: any = await pool.execute(
      `SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.created_at,
        COUNT(DISTINCT up.island_id) as islands_started,
        SUM(CASE WHEN up.completed = 1 THEN 1 ELSE 0 END) as islands_completed,
        SUM(up.score) as total_score,
        MAX(up.updated_at) as last_activity
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE u.is_teacher = 0
      GROUP BY u.id, u.username, u.email, u.created_at
      ORDER BY total_score DESC, u.username ASC`
    );

    // Fetch detailed progress for each user
    const [detailedProgress]: any = await pool.execute(
      `SELECT 
        user_id,
        island_id,
        completed,
        score,
        completed_at
      FROM user_progress
      WHERE user_id IN (SELECT id FROM users WHERE is_teacher = 0)
      ORDER BY user_id, island_id`
    );

    // Organize progress by user
    const progressByUser: { [key: number]: any[] } = {};
    detailedProgress.forEach((p: any) => {
      if (!progressByUser[p.user_id]) {
        progressByUser[p.user_id] = [];
      }
      progressByUser[p.user_id].push({
        islandId: p.island_id,
        completed: p.completed,
        score: p.score,
        completedAt: p.completed_at,
      });
    });

    // Add progress details to each user
    const usersWithProgress = users.map((u: any) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.created_at,
      islandsStarted: u.islands_started || 0,
      islandsCompleted: u.islands_completed || 0,
      totalScore: u.total_score || 0,
      lastActivity: u.last_activity,
      progress: progressByUser[u.id] || [],
    }));

    // Calculate global statistics
    const globalStats = {
      totalStudents: users.length,
      totalIslandsCompleted: users.reduce((sum: number, u: any) => sum + (u.islands_completed || 0), 0),
      averageScore: users.length > 0 
        ? Math.round(users.reduce((sum: number, u: any) => sum + (u.total_score || 0), 0) / users.length)
        : 0,
      studentsWithProgress: users.filter((u: any) => u.islands_started > 0).length,
    };

    return NextResponse.json({
      users: usersWithProgress,
      globalStats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
