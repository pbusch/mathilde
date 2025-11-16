import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, updateUserProgress } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { islandId, score } = await request.json();
    
    // Validate input
    if (!islandId || typeof islandId !== 'number') {
      return NextResponse.json({ error: 'Invalid island ID' }, { status: 400 });
    }
    
    if (score === undefined || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    const success = await updateUserProgress(user.id, islandId, true, score);
    
    if (success) {
      return NextResponse.json({ 
        message: 'Progress updated successfully',
        islandId,
        score 
      });
    } else {
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
