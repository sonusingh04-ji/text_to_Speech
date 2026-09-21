import crypto from "crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import {
    query
} from "../config/database.js";

import {
    generateToken
} from "../utils/jwt.js";


const SALT_ROUNDS = 12;

const RESET_TOKEN_EXPIRY_MINUTES =
    Number(
        process.env.RESET_TOKEN_EXPIRY_MINUTES || 15
    );


const googleClient =
    new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID
    );


/*
|--------------------------------------------------------------------------
| Error Helper
|--------------------------------------------------------------------------
*/
const createAuthError = (
    message,
    statusCode,
    code,
    details = undefined
) => {

    const error =
        new Error(message);

    error.statusCode =
        statusCode;

    error.code =
        code;

    if (
        details !== undefined
    ) {
        error.details =
            details;
    }

    return error;
};


/*
|--------------------------------------------------------------------------
| Email
|--------------------------------------------------------------------------
*/
const normalizeEmail = (
    email
) => {

    if (
        typeof email !== "string"
    ) {
        throw createAuthError(
            "Valid email is required.",
            400,
            "INVALID_EMAIL"
        );
    }


    const normalized =
        email.trim().toLowerCase();


    if (
        !normalized
    ) {
        throw createAuthError(
            "Valid email is required.",
            400,
            "INVALID_EMAIL"
        );
    }


    return normalized;
};


/*
|--------------------------------------------------------------------------
| Password
|--------------------------------------------------------------------------
*/
const validatePassword = (
    password
) => {

    if (
        typeof password !== "string"
    ) {
        throw createAuthError(
            "Password is required.",
            400,
            "PASSWORD_REQUIRED"
        );
    }


    if (
        password.length < 8
    ) {
        throw createAuthError(
            "Password must contain at least 8 characters.",
            400,
            "WEAK_PASSWORD"
        );
    }


    if (
        password.length > 128
    ) {
        throw createAuthError(
            "Password must not exceed 128 characters.",
            400,
            "PASSWORD_TOO_LONG"
        );
    }
};


/*
|--------------------------------------------------------------------------
| Reset Token
|--------------------------------------------------------------------------
*/
const createPasswordResetToken = () => {

    const rawToken =
        crypto.randomBytes(32).toString("hex");


    const tokenHash =
        crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");


    const expiresAt =
        new Date(
            Date.now() +
            RESET_TOKEN_EXPIRY_MINUTES *
            60 *
            1000
        );


    return {
        rawToken,
        tokenHash,
        expiresAt
    };
};


/*
|--------------------------------------------------------------------------
| Public Registration
|--------------------------------------------------------------------------
|
| Public registration ALWAYS creates USER.
|--------------------------------------------------------------------------
*/
export const registerUser = async ({
                                       name,
                                       email,
                                       password
                                   }) => {

    if (
        typeof name !== "string" ||
        !name.trim()
    ) {
        throw createAuthError(
            "Name is required.",
            400,
            "NAME_REQUIRED"
        );
    }


    if (
        name.trim().length > 100
    ) {
        throw createAuthError(
            "Name must not exceed 100 characters.",
            400,
            "NAME_TOO_LONG"
        );
    }


    const normalizedEmail =
        normalizeEmail(email);


    validatePassword(password);


    const existingUser =
        await query(
            `
                SELECT id
                FROM users
                WHERE email = $1
                    LIMIT 1
            `,
            [normalizedEmail]
        );


    if (
        existingUser.rows.length > 0
    ) {
        throw createAuthError(
            "An account with this email already exists.",
            409,
            "EMAIL_ALREADY_EXISTS"
        );
    }


    const passwordHash =
        await bcrypt.hash(
            password,
            SALT_ROUNDS
        );


    const result =
        await query(
            `
                INSERT INTO users (
                    name,
                    email,
                    password_hash,
                    role,
                    auth_provider
                )
                VALUES (
                           $1,
                           $2,
                           $3,
                           'USER',
                           'LOCAL'
                       )
                    RETURNING
                    id,
                    name,
                    email,
                    role,
                    profile_photo_url,
                    auth_provider,
                    created_at
            `,
            [
                name.trim(),
                normalizedEmail,
                passwordHash
            ]
        );


    const user =
        result.rows[0];


    const token =
        generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });


    return {
        user,
        token
    };
};


/*
|--------------------------------------------------------------------------
| Create Admin
|--------------------------------------------------------------------------
*/
export const createAdminUser = async ({
                                          name,
                                          email,
                                          password
                                      }) => {

    if (
        typeof name !== "string" ||
        !name.trim()
    ) {
        throw createAuthError(
            "Name is required.",
            400,
            "NAME_REQUIRED"
        );
    }


    const normalizedEmail =
        normalizeEmail(email);


    validatePassword(password);


    const existingUser =
        await query(
            `
                SELECT id
                FROM users
                WHERE email = $1
                    LIMIT 1
            `,
            [normalizedEmail]
        );


    if (
        existingUser.rows.length > 0
    ) {
        throw createAuthError(
            "An account with this email already exists.",
            409,
            "EMAIL_ALREADY_EXISTS"
        );
    }


    const passwordHash =
        await bcrypt.hash(
            password,
            SALT_ROUNDS
        );


    const result =
        await query(
            `
                INSERT INTO users (
                    name,
                    email,
                    password_hash,
                    role,
                    auth_provider
                )
                VALUES (
                           $1,
                           $2,
                           $3,
                           'ADMIN',
                           'LOCAL'
                       )
                    RETURNING
                    id,
                    name,
                    email,
                    role,
                    profile_photo_url,
                    auth_provider,
                    created_at
            `,
            [
                name.trim(),
                normalizedEmail,
                passwordHash
            ]
        );


    return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/
export const loginUser = async ({
                                    email,
                                    password
                                }) => {

    const normalizedEmail =
        normalizeEmail(email);


    if (
        typeof password !== "string" ||
        !password
    ) {
        throw createAuthError(
            "Password is required.",
            400,
            "PASSWORD_REQUIRED"
        );
    }


    const result =
        await query(
            `
                SELECT
                    id,
                    name,
                    email,
                    password_hash,
                    role,
                    profile_photo_url,
                    auth_provider,
                    created_at
                FROM users
                WHERE email = $1
                    LIMIT 1
            `,
            [normalizedEmail]
        );


    if (
        result.rows.length === 0
    ) {
        throw createAuthError(
            "Invalid email or password.",
            401,
            "INVALID_CREDENTIALS"
        );
    }


    const user =
        result.rows[0];


    if (
        !user.password_hash
    ) {
        throw createAuthError(
            "This account uses Google Sign-In. Please continue with Google.",
            400,
            "GOOGLE_ACCOUNT"
        );
    }


    const passwordMatches =
        await bcrypt.compare(
            password,
            user.password_hash
        );


    if (
        !passwordMatches
    ) {
        throw createAuthError(
            "Invalid email or password.",
            401,
            "INVALID_CREDENTIALS"
        );
    }


    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_photo_url:
        user.profile_photo_url,
        auth_provider:
        user.auth_provider,
        created_at:
        user.created_at
    };


    const token =
        generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });


    return {
        user: safeUser,
        token
    };
};


/*
|--------------------------------------------------------------------------
| Google Login
|--------------------------------------------------------------------------
*/
export const googleLoginUser = async ({
                                          credential
                                      }) => {

    if (
        !process.env.GOOGLE_CLIENT_ID
    ) {
        throw createAuthError(
            "Google Sign-In is not configured on the server.",
            503,
            "GOOGLE_NOT_CONFIGURED"
        );
    }


    if (
        typeof credential !== "string" ||
        !credential.trim()
    ) {
        throw createAuthError(
            "Google credential is required.",
            400,
            "GOOGLE_CREDENTIAL_REQUIRED"
        );
    }


    let payload;


    try {

        const ticket =
            await googleClient.verifyIdToken({
                idToken:
                    credential.trim(),

                audience:
                process.env.GOOGLE_CLIENT_ID
            });


        payload =
            ticket.getPayload();

    } catch (error) {

        console.error(
            "GOOGLE TOKEN VERIFICATION ERROR:",
            error.message
        );


        throw createAuthError(
            "Unable to verify Google account.",
            401,
            "INVALID_GOOGLE_TOKEN"
        );
    }


    if (
        !payload
    ) {
        throw createAuthError(
            "Invalid Google account information.",
            401,
            "INVALID_GOOGLE_TOKEN"
        );
    }


    const googleId =
        payload.sub;


    const email =
        normalizeEmail(
            payload.email
        );


    const name =
        String(
            payload.name ||
            payload.given_name ||
            "Google User"
        ).trim();


    const picture =
        payload.picture ||
        null;


    if (
        !googleId
    ) {
        throw createAuthError(
            "Google account ID was not provided.",
            401,
            "GOOGLE_ID_MISSING"
        );
    }


    if (
        payload.email_verified === false
    ) {
        throw createAuthError(
            "Google email is not verified.",
            401,
            "GOOGLE_EMAIL_NOT_VERIFIED"
        );
    }


    /*
    |--------------------------------------------------------------------------
    | First search by Google ID.
    |--------------------------------------------------------------------------
    */
    const googleUserResult =
        await query(
            `
                SELECT
                    id,
                    name,
                    email,
                    role,
                    profile_photo_url,
                    auth_provider,
                    created_at
                FROM users
                WHERE google_id = $1
                LIMIT 1
            `,
            [googleId]
        );


    if (
        googleUserResult.rows.length > 0
    ) {

        const user =
            googleUserResult.rows[0];


        /*
        |--------------------------------------------------------------------------
        | Refresh Google profile picture/name
        | when available.
        |--------------------------------------------------------------------------
        */
        const updatedResult =
            await query(
                `
                    UPDATE users
                    SET
                        name = $1,
                        profile_photo_url =
                            COALESCE($2, profile_photo_url)
                    WHERE id = $3
                    RETURNING
                        id,
                        name,
                        email,
                        role,
                        profile_photo_url,
                        auth_provider,
                        created_at
                `,
                [
                    name,
                    picture,
                    user.id
                ]
            );


        const updatedUser =
            updatedResult.rows[0];


        const token =
            generateToken({
                userId:
                updatedUser.id,

                email:
                updatedUser.email,

                role:
                updatedUser.role
            });


        return {
            user: updatedUser,
            token
        };
    }


    /*
    |--------------------------------------------------------------------------
    | Check local account with same email.
    |--------------------------------------------------------------------------
    |
    | We do NOT silently link a Google account to an
    | existing local account.
    |--------------------------------------------------------------------------
    */
    const existingEmailResult =
        await query(
            `
                SELECT
                    id,
                    auth_provider
                FROM users
                WHERE email = $1
                LIMIT 1
            `,
            [email]
        );


    if (
        existingEmailResult.rows.length > 0
    ) {

        throw createAuthError(
            "An account with this email already exists. Please sign in using the existing account.",
            409,
            "EMAIL_ACCOUNT_EXISTS"
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Create Google user.
    |--------------------------------------------------------------------------
    */
    const result =
        await query(
            `
                INSERT INTO users (
                    name,
                    email,
                    password_hash,
                    role,
                    profile_photo_url,
                    google_id,
                    auth_provider
                )
                VALUES (
                    $1,
                    $2,
                    NULL,
                    'USER',
                    $3,
                    $4,
                    'GOOGLE'
                )
                RETURNING
                    id,
                    name,
                    email,
                    role,
                    profile_photo_url,
                    auth_provider,
                    created_at
            `,
            [
                name,
                email,
                picture,
                googleId
            ]
        );


    const user =
        result.rows[0];


    const token =
        generateToken({
            userId:
            user.id,

            email:
            user.email,

            role:
            user.role
        });


    return {
        user,
        token
    };
};


/*
|--------------------------------------------------------------------------
| Get User
|--------------------------------------------------------------------------
*/
export const getUserById = async (
    userId
) => {

    const result =
        await query(
            `
                SELECT
                    id,
                    name,
                    email,
                    role,
                    profile_photo_url,
                    auth_provider,
                    created_at
                FROM users
                WHERE id = $1
                LIMIT 1
            `,
            [userId]
        );


    if (
        result.rows.length === 0
    ) {

        throw createAuthError(
            "User not found.",
            404,
            "USER_NOT_FOUND"
        );
    }


    return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/
export const requestPasswordReset =
    async ({
               email
           }) => {

        const normalizedEmail =
            normalizeEmail(email);


        const result =
            await query(
                `
                    SELECT
                        id
                    FROM users
                    WHERE email = $1
                    LIMIT 1
                `,
                [normalizedEmail]
            );


        if (
            result.rows.length === 0
        ) {

            return {
                message:
                    "If an account exists for this email, password reset instructions have been prepared."
            };
        }


        const user =
            result.rows[0];


        /*
        |--------------------------------------------------------------------------
        | Google-only accounts don't have a local
        | password to reset.
        |--------------------------------------------------------------------------
        */
        const accountResult =
            await query(
                `
                    SELECT
                        password_hash,
                        auth_provider
                    FROM users
                    WHERE id = $1
                    LIMIT 1
                `,
                [user.id]
            );


        const account =
            accountResult.rows[0];


        if (
            !account?.password_hash &&
            account?.auth_provider === "GOOGLE"
        ) {

            return {
                message:
                    "This account uses Google Sign-In. Please continue with Google."
            };
        }


        const {
            rawToken,
            tokenHash,
            expiresAt
        } =
            createPasswordResetToken();


        await query(
            `
                UPDATE users
                SET
                    reset_password_token_hash = $1,
                    reset_password_expires_at = $2
                WHERE id = $3
            `,
            [
                tokenHash,
                expiresAt,
                user.id
            ]
        );


        const response = {
            message:
                "If an account exists for this email, password reset instructions have been prepared."
        };


        if (
            process.env.NODE_ENV !==
            "production"
        ) {

            response.developmentResetToken =
                rawToken;

            response.expiresAt =
                expiresAt;
        }


        return response;
    };


/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/
export const resetPassword = async ({
                                        token,
                                        newPassword
                                    }) => {

    if (
        typeof token !== "string" ||
        !token.trim()
    ) {

        throw createAuthError(
            "Reset token is required.",
            400,
            "RESET_TOKEN_REQUIRED"
        );
    }


    validatePassword(
        newPassword
    );


    const tokenHash =
        crypto
            .createHash("sha256")
            .update(token.trim())
            .digest("hex");


    const result =
        await query(
            `
                SELECT
                    id
                FROM users
                WHERE reset_password_token_hash = $1
                  AND reset_password_expires_at IS NOT NULL
                  AND reset_password_expires_at > NOW()
                LIMIT 1
            `,
            [tokenHash]
        );


    if (
        result.rows.length === 0
    ) {

        throw createAuthError(
            "Invalid or expired password reset token.",
            400,
            "INVALID_RESET_TOKEN"
        );
    }


    const user =
        result.rows[0];


    const passwordHash =
        await bcrypt.hash(
            newPassword,
            SALT_ROUNDS
        );


    await query(
        `
            UPDATE users
            SET
                password_hash = $1,
                reset_password_token_hash = NULL,
                reset_password_expires_at = NULL,
                auth_provider = 'LOCAL'
            WHERE id = $2
        `,
        [
            passwordHash,
            user.id
        ]
    );


    return {
        success: true
    };
};


/*
|--------------------------------------------------------------------------
| Update Password
|--------------------------------------------------------------------------
*/
export const updatePassword = async ({
                                         userId,
                                         currentPassword,
                                         newPassword
                                     }) => {

    if (
        typeof currentPassword !== "string" ||
        !currentPassword
    ) {

        throw createAuthError(
            "Current password is required.",
            400,
            "CURRENT_PASSWORD_REQUIRED"
        );
    }


    validatePassword(
        newPassword
    );


    if (
        currentPassword ===
        newPassword
    ) {

        throw createAuthError(
            "New password must be different from the current password.",
            400,
            "PASSWORD_MUST_CHANGE"
        );
    }


    const result =
        await query(
            `
                SELECT
                    id,
                    password_hash
                FROM users
                WHERE id = $1
                LIMIT 1
            `,
            [userId]
        );


    if (
        result.rows.length === 0
    ) {

        throw createAuthError(
            "User not found.",
            404,
            "USER_NOT_FOUND"
        );
    }


    const user =
        result.rows[0];


    if (
        !user.password_hash
    ) {

        throw createAuthError(
            "This account does not have a local password. Sign in with Google.",
            400,
            "NO_LOCAL_PASSWORD"
        );
    }


    const matches =
        await bcrypt.compare(
            currentPassword,
            user.password_hash
        );


    if (
        !matches
    ) {

        throw createAuthError(
            "Current password is incorrect.",
            401,
            "CURRENT_PASSWORD_INCORRECT"
        );
    }


    const newPasswordHash =
        await bcrypt.hash(
            newPassword,
            SALT_ROUNDS
        );


    await query(
        `
            UPDATE users
            SET
                password_hash = $1,
                reset_password_token_hash = NULL,
                reset_password_expires_at = NULL
            WHERE id = $2
        `,
        [
            newPasswordHash,
            userId
        ]
    );


    return {
        success: true
    };
};