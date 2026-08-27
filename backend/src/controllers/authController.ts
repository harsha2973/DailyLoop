import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/generateToken';

/**
 * POST /api/auth/register
 * Creates a new user account and returns a JWT so the client can log
 * the user straight in after registering.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email and password are all required' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * POST /api/auth/login
 * Validates credentials and returns a JWT on success.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // password has `select: false` on the schema, so it must be explicitly requested
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(404).json({ message: 'Account does not exist. Please sign up.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Wrong password' });
      return;
    }

    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

/**
 * PUT /api/auth/change-password
 * Validates old password and updates user's password.
 */
export const changePassword = async (req: any, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ message: 'Old password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' });
      return;
    }

    const userId = req.user?._id;
    const user = await User.findById(userId).select('+password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      res.status(401).json({ message: 'Incorrect old password' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};

/**
 * PUT /api/auth/profile
 * Updates authenticated user's profile details (name, email).
 */
export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(409).json({ message: 'Email address is already in use' });
        return;
      }
      user.email = email.toLowerCase();
    }

    if (name) {
      user.name = name.trim();
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

