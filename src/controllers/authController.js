const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const queue = require('../utils/queue');
const emailService = require('../utils/email');
const { ErrorTypes } = require('../middleware/errorHandler');

const authController = {
    async register(req, res, next) {
        try {
            const { email, password, name, role = 'client', termsAccepted, termsId } = req.body;

            const existing = await UserModel.findByEmail(email);
            if (existing) {
                throw ErrorTypes.ValidationError('Email already registered');
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const user = await UserModel.create({ email, passwordHash, name, role });

            // Log terms acceptance if provided
            if (termsAccepted && termsId) {
                const TermsModel = require('../models/termsModel');
                await TermsModel.accept(user.id, termsId);
            }

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Queue welcome email
            queue.add(async () => {
                await emailService.sendWelcomeEmail(user);
            }, { type: 'welcome_email', userId: user.id });

            res.status(201).json({
                success: true,
                user: {
                    userId: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findByEmail(email);
            if (!user) {
                throw ErrorTypes.AuthenticationError('Invalid credentials');
            }

            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                throw ErrorTypes.AuthenticationError('Invalid credentials');
            }

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                user: {
                    userId: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    subscriptionTier: user.subscription_tier,
                    token
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async verify(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                throw ErrorTypes.AuthenticationError('No token provided');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await UserModel.findById(decoded.userId);

            if (!user) {
                throw ErrorTypes.AuthenticationError('Invalid token');
            }

            res.json({ success: true, user });
        } catch (error) {
            next(ErrorTypes.AuthenticationError('Invalid token'));
        }
    },

    async logout(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            
            if (token && token !== 'mock-token') {
                const TokenBlacklist = require('../utils/tokenBlacklist');
                const decoded = jwt.decode(token);
                const exp = decoded?.exp;
                const now = Math.floor(Date.now() / 1000);
                const remainingTtl = exp ? Math.max(0, exp - now) : 604800; // default to 7 days
                
                await TokenBlacklist.blacklistToken(token, remainingTtl);
            }
            
            res.json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
