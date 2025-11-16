import { NextResponse } from 'next/server';
import { getCurrentUser, getUserProgress } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const progress = await getUserProgress(user.id);

    // Transform to a more useful format
    const progressMap: { [key: number]: { completed: boolean; score: number } } = {};
    progress.forEach((p: any) => {
      progressMap[p.island_id] = {
        completed: p.completed,
        score: p.score,
      };
    });

    return NextResponse.json({
      user,
      progress: progressMap,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
