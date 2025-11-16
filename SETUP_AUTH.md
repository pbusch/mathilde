# Authentication Setup Instructions

## 1. Database Setup

### Create the database tables

Run the SQL schema to create the necessary tables:

```bash
mysql -u mathilde -p < schema.sql
```

Or manually execute the schema:

```bash
mysql -u mathilde -p
```

Then paste the contents of `schema.sql` into the MySQL prompt.

## 2. Environment Variables

Make sure your `.env.local` file contains:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=mathilde
DB_PASSWORD=your_password
DB_NAME=mathilde

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_secret_key_here
```

**Important**: Generate a secure JWT secret with:
```bash
openssl rand -base64 32
```

## 3. Test the Setup

### Start the development server:
```bash
npm run dev
```

### Test the authentication flow:

1. Visit http://localhost:3000
2. You'll be redirected to `/login`
3. Click "Register here" to create a new account
4. Fill out the registration form
5. After successful registration, you'll be logged in automatically
6. You should see the gameboard with your username displayed
7. Only Island 1 should be accessible initially

## 4. Features

### User Features:
- ✅ User registration with validation
- ✅ Secure login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ HTTP-only cookies for session management
- ✅ Protected routes (middleware)
- ✅ Logout functionality
- ✅ Progress tracking per island
- ✅ Progressive island unlocking

### Teacher Features:
- Teachers can register with the "I am a teacher" checkbox
- Teacher accounts are marked with 👨‍🏫 emoji

### Island Progression:
- Island 1 is always accessible
- Each subsequent island unlocks when the previous one is completed
- Progress is stored in the `user_progress` table

## 5. API Endpoints

### Authentication:
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and create session
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/me` - Get current user info

### Progress:
- `GET /api/progress` - Get user's island progress

## 6. Database Schema

### users table:
- `id` - Primary key
- `username` - Unique username (3-50 chars)
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `is_teacher` - Boolean flag for teacher accounts
- `created_at` - Account creation timestamp

### user_progress table:
- `id` - Primary key
- `user_id` - Foreign key to users table
- `island_id` - Island number (1-5)
- `completed` - Boolean completion status
- `score` - User's score for this island
- `completed_at` - Completion timestamp
- Unique constraint on (user_id, island_id)

## 7. Testing User Progress

To manually mark an island as complete for testing:

```sql
INSERT INTO user_progress (user_id, island_id, completed, score, completed_at)
VALUES (1, 1, TRUE, 100, NOW())
ON DUPLICATE KEY UPDATE completed = TRUE, score = 100, completed_at = NOW();
```

This will unlock Island 2 for user_id 1.

## 8. Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Cookies are HTTP-only and secure in production
- SQL injection protection via parameterized queries
- Input validation on both client and server

## 9. Next Steps

To complete the game progress tracking:

1. Create an API endpoint to update user progress when a game is completed
2. Call this endpoint from each game component when the user wins
3. Refresh the GameBoard after completing a game to show newly unlocked islands

Example endpoint (`/api/progress/update`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, updateUserProgress } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { islandId, score } = await request.json();
  
  const success = await updateUserProgress(user.id, islandId, true, score);
  
  if (success) {
    return NextResponse.json({ message: 'Progress updated' });
  } else {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
```
