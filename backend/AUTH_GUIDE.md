# Authentication System Documentation

This document outlines the structure and flow of the Nexus Institute Management System's authentication and email verification system.

## Folder Structure

```text
backend/
├── server.js               # Main entry point, loads routes
├── .env                    # Environment variables (EMAIL_USER, EMAIL_PASS, JWT_SECRET)
├── models/
│   └── User.js             # User Schema (isVerified, verificationToken fields)
├── routes/
│   └── authRoutes.js       # Authentication routes (/register, /login, /verifyemail)
├── controllers/
│   └── authController.js   # Logic for registration, verification, and login
└── utils/
    ├── emailService.js     # Nodemailer template and SMTP configuration
    └── generateToken.js    # JWT token generation logic
```

## Authentication Flow

1.  **Registration**:
    - User sends `POST /api/auth/register`.
    - Account is created with `isVerified: false`.
    - A random `verificationToken` is generated with a **1-hour** expiry.
    - A verification email is sent via `emailService.js`.

2.  **Email Verification**:
    - User receives email and clicks the link.
    - Frontend redirects to `GET /api/auth/verifyemail/:token`.
    - Controller checks token validity and expiry.
    - Account is updated to `isVerified: true`.

3.  **Login**:
    - User sends `POST /api/auth/login`.
    - System checks `isVerified` status.
    - If `false`, login is denied with "Please verify your email address before logging in."
    - If `true`, a JWT token is issued.

## Security Features
- **Passwords**: Hashed using `bcryptjs`.
- **Tokens**: Securely generated using `crypto`.
- **JWT**: Used for session management after verification.
- **Expiration**: Verification links expire in 1 hour for enhanced security.
