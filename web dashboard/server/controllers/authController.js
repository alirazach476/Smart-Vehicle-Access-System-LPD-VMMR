import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { 
  findUserByEmail, 
  findUserByUsername, 
  createUser, 
  getUserCount,
  getFirstAdminEmail,
  isFirstAdminEmail,
} from '../utils/authStorage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase();

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists (case-insensitive)
    if (findUserByEmail(normalizedEmail)) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    if (findUserByUsername(username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user (will be saved to database)
    // The createUser function handles role assignment automatically:
    // - First user becomes admin
    // - First admin email is permanently stored
    // - Subsequent users are regular users
    const user = await createUser({
      username,
      email: normalizedEmail, // Already normalized above
      password: hashedPassword,
      // Role will be determined by createUser based on user count and first admin email
    });

    // Generate JWT token (include role and hasAdminAccess in token)
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, role: user.role, hasAdminAccess: user.hasAdminAccess || false },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        hasAdminAccess: user.hasAdminAccess || false,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

/**
 * POST /api/auth/login
 * Login user
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user (email comparison is case-insensitive in findUserByEmail)
    const user = findUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token (include role and hasAdminAccess in token)
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, role: user.role, hasAdminAccess: user.hasAdminAccess || false },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        hasAdminAccess: user.hasAdminAccess || false,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

