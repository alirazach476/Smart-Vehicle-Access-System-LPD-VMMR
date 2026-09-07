/**
 * Authentication utility functions
 */

export function getUserRole(): 'admin' | 'user' | null {
  const role = localStorage.getItem('role');
  if (role === 'admin' || role === 'user') {
    return role;
  }
  return null;
}

export function isAdmin(): boolean {
  return getUserRole() === 'admin';
}

export function hasAdminAccess(): boolean {
  const user = getUser();
  if (!user) return false;
  
  // Check if user is admin OR has admin access privileges
  return user.role === 'admin' || (user as any).hasAdminAccess === true;
}

export function getUser(): { id: number; username: string; email: string; role: string; hasAdminAccess?: boolean } | null {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

