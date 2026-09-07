# Authentication Bug Fixes

## Issues Fixed

### 1. **Persistent User Storage**
- **Problem**: Users were stored in memory only, lost on server restart
- **Solution**: Implemented JSON file-based persistent storage (`server/data/users.json`)
- **Result**: All users are now permanently stored and persist across server restarts

### 2. **First Admin Email Permanence**
- **Problem**: First admin role was lost on server restart
- **Solution**: First admin email is now permanently stored in the database
- **Result**: The first registered email always maintains admin privileges, even after server restarts

### 3. **Email Case Sensitivity**
- **Problem**: Email comparisons were case-sensitive, causing login issues
- **Solution**: All emails are normalized to lowercase for storage and comparison
- **Result**: Users can login with any case variation of their email

### 4. **Role Assignment Logic**
- **Problem**: Role assignment logic could be inconsistent
- **Solution**: Centralized role assignment in `createUser` function
- **Result**: 
  - First user always becomes admin
  - First admin email is permanently stored
  - All subsequent users are regular users

## How It Works

### User Registration Flow

1. **First User Registration**:
   - User registers with email (e.g., `admin@example.com`)
   - System checks: `userCount === 0`
   - User is assigned `admin` role
   - Email is stored as `firstAdminEmail` in database
   - User data saved to `server/data/users.json`

2. **Subsequent User Registration**:
   - User registers with different email
   - System checks: `userCount > 0`
   - User is assigned `user` role
   - User data saved to database

3. **Server Restart**:
   - On startup, system loads users from `server/data/users.json`
   - First admin email is restored from database
   - All users maintain their roles

### Database Structure

```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "password": "$2b$10$...",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "username": "user1",
      "email": "user1@example.com",
      "password": "$2b$10$...",
      "role": "user",
      "createdAt": "2024-01-01T01:00:00.000Z"
    }
  ],
  "nextUserId": 3,
  "firstAdminEmail": "admin@example.com",
  "lastUpdated": "2024-01-01T01:00:00.000Z"
}
```

## Security Features

1. **First Admin Protection**: First admin email cannot be deleted or have role changed
2. **Email Normalization**: All emails stored in lowercase for consistency
3. **Password Hashing**: Passwords are hashed using bcrypt before storage
4. **Persistent Storage**: User data survives server restarts

## Testing

To verify the fixes:

1. **Test First User**:
   ```bash
   # Register first user
   POST /api/auth/register
   {
     "username": "admin",
     "email": "admin@test.com",
     "password": "password123"
   }
   # Should return role: "admin"
   ```

2. **Test Server Restart**:
   ```bash
   # Stop server
   # Start server
   # Login with first user
   # Should still have admin role
   ```

3. **Test Subsequent Users**:
   ```bash
   # Register second user
   POST /api/auth/register
   {
     "username": "user1",
     "email": "user1@test.com",
     "password": "password123"
   }
   # Should return role: "user"
   ```

## Files Modified

- `server/utils/userDatabase.js` - New persistent storage system
- `server/utils/authStorage.js` - Updated to use persistent storage
- `server/controllers/authController.js` - Fixed email normalization and role logic
- `server/index.js` - Added database initialization on startup
- `.gitignore` - Added `server/data/users.json` to ignore list

## Notes

- User database file: `server/data/users.json`
- Database is automatically created on first use
- First admin email is permanently stored and cannot be changed
- All emails are normalized to lowercase for consistency

