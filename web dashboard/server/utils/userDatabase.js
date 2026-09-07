import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, '..', 'data', 'users.json');
const DB_DIR = path.join(__dirname, '..', 'data');

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

/**
 * Load users from JSON file
 */
export async function loadUsers() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Ensure proper structure
    if (!parsed.users || !Array.isArray(parsed.users)) {
      return { users: [], nextUserId: 1, firstAdminEmail: null };
    }
    
    // Ensure all users have hasAdminAccess field (for backward compatibility)
    const usersWithAccess = (parsed.users || []).map(user => ({
      ...user,
      hasAdminAccess: user.hasAdminAccess || false
    }));
    
    return {
      users: usersWithAccess,
      nextUserId: parsed.nextUserId || 1,
      firstAdminEmail: parsed.firstAdminEmail || null,
    };
  } catch (error) {
    // File doesn't exist or is invalid, return empty structure
    if (error.code === 'ENOENT') {
      return { users: [], nextUserId: 1, firstAdminEmail: null };
    }
    console.error('Error loading users:', error);
    return { users: [], nextUserId: 1, firstAdminEmail: null };
  }
}

/**
 * Save users to JSON file
 */
export async function saveUsers(users, nextUserId, firstAdminEmail) {
  try {
    await ensureDataDir();
    const data = {
      users: users || [],
      nextUserId: nextUserId || 1,
      firstAdminEmail: firstAdminEmail || null,
      lastUpdated: new Date().toISOString(),
    };
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
}

/**
 * Initialize user database
 */
let users = [];
let nextUserId = 1;
let firstAdminEmail = null;
let initialized = false;

export async function initializeUserDatabase() {
  if (initialized) return;
  
  try {
    const data = await loadUsers();
    users = data.users || [];
    nextUserId = data.nextUserId || 1;
    firstAdminEmail = data.firstAdminEmail || null;
    initialized = true;
    
    console.log(`✅ User database loaded: ${users.length} users`);
    if (firstAdminEmail) {
      console.log(`👑 First admin email: ${firstAdminEmail}`);
    }
  } catch (error) {
    console.error('❌ Error initializing user database:', error);
    users = [];
    nextUserId = 1;
    firstAdminEmail = null;
    initialized = true;
  }
}

/**
 * Get all users
 */
export function getAllUsers() {
  return [...users]; // Return copy to prevent direct mutation
}

/**
 * Find user by email
 */
export function findUserByEmail(email) {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

/**
 * Find user by username
 */
export function findUserByUsername(username) {
  return users.find(user => user.username.toLowerCase() === username.toLowerCase());
}

/**
 * Find user by ID
 */
export function findUserById(id) {
  return users.find(user => user.id === id);
}

/**
 * Get user count
 */
export function getUserCount() {
  return users.length;
}

/**
 * Get first admin email
 */
export function getFirstAdminEmail() {
  return firstAdminEmail;
}

/**
 * Check if email is the first admin
 */
export function isFirstAdminEmail(email) {
  if (!firstAdminEmail) return false;
  return firstAdminEmail.toLowerCase() === email.toLowerCase();
}

/**
 * Create a new user and save to database
 */
export async function createUser(userData) {
  // Ensure database is initialized
  if (!initialized) {
    await initializeUserDatabase();
  }
  
  // Determine role based on user count and first admin email
  let role = userData.role || 'user';
  if (users.length === 0) {
    // First user is always admin
    role = 'admin';
    if (!firstAdminEmail) {
      firstAdminEmail = userData.email.toLowerCase();
    }
  } else if (firstAdminEmail && userData.email.toLowerCase() === firstAdminEmail.toLowerCase()) {
    // If registering with first admin email, make them admin
    role = 'admin';
  }
  
  const user = {
    id: nextUserId++,
    username: userData.username,
    email: userData.email.toLowerCase(), // Normalize email to lowercase
    password: userData.password, // Already hashed
    role: role,
    hasAdminAccess: userData.hasAdminAccess || false, // Admin access privileges (separate from role)
    createdAt: new Date().toISOString(),
  };
  
  users.push(user);
  
  // Save to file
  await saveUsers(users, nextUserId, firstAdminEmail);
  
  return user;
}

/**
 * Update user (for role changes, etc.)
 */
export async function updateUser(userId, updates) {
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return null;
  }
  
  // Don't allow changing the first admin's role
  if (updates.role && isFirstAdminEmail(users[userIndex].email) && updates.role !== 'admin') {
    throw new Error('Cannot change first admin role');
  }
  
  // Ensure hasAdminAccess is preserved if not being updated
  const updatedUser = {
    ...users[userIndex],
    ...updates,
    hasAdminAccess: updates.hasAdminAccess !== undefined ? updates.hasAdminAccess : users[userIndex].hasAdminAccess,
    updatedAt: new Date().toISOString(),
  };
  
  users[userIndex] = updatedUser;
  
  await saveUsers(users, nextUserId, firstAdminEmail);
  return users[userIndex];
}

/**
 * Delete user (admin only, cannot delete first admin)
 */
export async function deleteUser(userId) {
  const user = findUserById(userId);
  if (!user) {
    return false;
  }
  
  // Cannot delete first admin
  if (isFirstAdminEmail(user.email)) {
    throw new Error('Cannot delete first admin user');
  }
  
  users = users.filter(u => u.id !== userId);
  await saveUsers(users, nextUserId, firstAdminEmail);
  return true;
}

