const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public (or Admin only for creating users)
 */
exports.register = async (req, res, next) => {
    try {
        const { email, password, role, firstName, lastName, departmentId, ...otherData } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user and profile in a transaction
        const user = await prisma.$transaction(async (tx) => {
            // Create user
            const newUser = await tx.user.create({
                data: {
                    email,
                    password_hash: hashedPassword,
                    role,
                    status: 'active'
                }
            });

            // Create user profile
            await tx.userProfile.create({
                data: {
                    user_id: newUser.id,
                    first_name: firstName,
                    last_name: lastName,
                    department_id: departmentId || null
                }
            });

            // If student, create student profile
            if (role === 'student') {
                await tx.studentProfile.create({
                    data: {
                        user_id: newUser.id,
                        roll_number: otherData.rollNumber,
                        degree: otherData.degree,
                        department_id: departmentId || null,
                        batch_year: otherData.batchYear,
                        current_semester: otherData.currentSemester || 1
                    }
                });
            }

            return newUser;
        });

        // Send welcome email (don't await to not block response)
        emailService.sendWelcomeEmail(user.email, firstName).catch(err => {
            logger.error('Failed to send welcome email:', err);
        });

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                user_profile: true,
                student_profile: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive or suspended'
            });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { last_login: new Date() }
        });

        // Generate token
        const token = generateToken(user.id);

        // Remove password from response
        const { password_hash, reset_token, reset_token_expiry, verification_token, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: userWithoutPassword
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                user_profile: {
                    include: {
                        department: true
                    }
                },
                student_profile: {
                    include: {
                        skills: true,
                        projects: true,
                        certifications: true,
                        internships: true
                    }
                }
            }
        });

        // Remove password
        const { password_hash, reset_token, reset_token_expiry, verification_token, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just send a success response
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Save reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                reset_token: resetToken,
                reset_token_expiry: new Date(Date.now() + 3600000) // 1 hour
            }
        });

        // Send email
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await emailService.sendPasswordResetEmail(user.email, resetUrl);

        res.status(200).json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Get user
        const user = await prisma.user.findFirst({
            where: {
                id: decoded.id,
                reset_token: token,
                reset_token_expiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash: hashedPassword,
                reset_token: null,
                reset_token_expiry: null
            }
        });

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/update-password
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password_hash: hashedPassword }
        });

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            email, // Add email
            firstName, lastName, phone, address, city, state, // User Profile fields
            cgpa, tenthPercentage, twelfthPercentage, linkedinUrl, githubUrl, portfolioUrl // Student Profile fields
        } = req.body;

        // Update User Profile
        const userProfileData = {};
        if (firstName) userProfileData.first_name = firstName;
        if (lastName) userProfileData.last_name = lastName;
        if (phone) userProfileData.phone = phone;


        // Handle Email Update
        if (email && email !== req.user.email) {
            // Check if email is taken
            const emailExists = await prisma.user.findUnique({
                where: { email }
            });

            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }

            await prisma.user.update({
                where: { id: userId },
                data: { email }
            });
        }

        if (Object.keys(userProfileData).length > 0) {
            await prisma.userProfile.upsert({
                where: { user_id: userId },
                update: userProfileData,
                create: {
                    user_id: userId,
                    first_name: firstName || 'User',
                    last_name: lastName || '',
                    ...userProfileData
                }
            });
        }

        // Update Student Profile if user is a student
        if (req.user.role === 'student') {
            console.log('Update Student Profile Request:', { cgpa, tenthPercentage, twelfthPercentage });
            const studentProfileData = {};
            if (cgpa !== undefined && cgpa !== null && cgpa !== '') studentProfileData.cgpa = String(cgpa);
            if (tenthPercentage !== undefined && tenthPercentage !== null && tenthPercentage !== '') studentProfileData.tenth_percentage = String(tenthPercentage);
            if (twelfthPercentage !== undefined && twelfthPercentage !== null && twelfthPercentage !== '') studentProfileData.twelfth_percentage = String(twelfthPercentage);
            if (linkedinUrl !== undefined) studentProfileData.linkedin_url = linkedinUrl;
            if (githubUrl !== undefined) studentProfileData.github_url = githubUrl;
            if (portfolioUrl !== undefined) studentProfileData.portfolio_url = portfolioUrl;
            if (address !== undefined) studentProfileData.address = address;
            if (city !== undefined) studentProfileData.city = city;
            if (state !== undefined) studentProfileData.state = state;

            if (Object.keys(studentProfileData).length > 0) {
                // Check if student profile exists
                const studentProfile = await prisma.studentProfile.findUnique({
                    where: { user_id: userId }
                });

                if (studentProfile) {
                    try {
                        await prisma.studentProfile.update({
                            where: { user_id: userId },
                            data: studentProfileData
                        });
                    } catch (spError) {
                        console.error('Student Profile Update Failed:', spError);
                        // Do not throw, allow partial update? Or throw?
                        // If student data fails, we should probably warn but proceed?
                        // But user expects success.
                        throw spError;
                    }
                } else {
                    console.log('Student Profile not found for user:', userId);
                }
            }
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                user_profile: { include: { department: true } },
                student_profile: {
                    include: {
                        department: true,
                        skills: true,
                        projects: true,
                        certifications: true,
                        internships: true
                    }
                }
            }


        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Update Profile Error:', error); // detailed logging
        next(error);
    }
};

module.exports = exports;
