import { getAllUsers, updateUser } from '../utils/userDatabase.js';

/**
 * GET /api/users
 * Get all users (admin only)
 */
export async function getAllUsersHandler(req, res) {
  try {
    const users = getAllUsers();
    
    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      hasAdminAccess: user.hasAdminAccess || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.status(200).json({
      users: usersWithoutPasswords,
      count: usersWithoutPasswords.length,
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
}

/**
 * PUT /api/users/:id/admin-access
 * Update admin access privileges for a user (admin only)
 */
export async function updateAdminAccessHandler(req, res) {
  try {
    const { id } = req.params;
    const { hasAdminAccess } = req.body;

    if (typeof hasAdminAccess !== 'boolean') {
      return res.status(400).json({ error: 'hasAdminAccess must be a boolean' });
    }

    // Get user to check if they exist and are not an admin
    const users = getAllUsers();
    const user = users.find(u => u.id === parseInt(id));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow changing admin access for admins (they already have full access)
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot change admin access for admin users' });
    }

    // Update user's admin access
    const updatedUser = await updateUser(parseInt(id), { hasAdminAccess });

    // Remove password from response
    const userResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      hasAdminAccess: updatedUser.hasAdminAccess || false,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    res.status(200).json({
      message: `Admin access ${hasAdminAccess ? 'granted' : 'revoked'} successfully`,
      user: userResponse,
    });
  } catch (error) {
    console.error('Error updating admin access:', error);
    res.status(500).json({ error: 'Failed to update admin access' });
  }
}

