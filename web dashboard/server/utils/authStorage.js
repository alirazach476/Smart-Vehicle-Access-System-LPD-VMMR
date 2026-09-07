/**
 * User storage - now uses persistent JSON file storage
 * Re-exported from userDatabase for backward compatibility
 */
export {
  initializeUserDatabase,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  getUserCount,
  getFirstAdminEmail,
  isFirstAdminEmail,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
} from './userDatabase.js';

