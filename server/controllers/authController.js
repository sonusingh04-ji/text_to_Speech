import {
    registerUser,
    loginUser,
    getUserById,
    googleLoginUser,
    requestPasswordReset,
    resetPassword,
    updatePassword
} from "../services/authService.js";


/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/
export const register = async (
    req,
    res,
    next
) => {

    try {

        const {
            name,
            email,
            password
        } = req.body || {};


        const result =
            await registerUser({
                name,
                email,
                password
            });


        return res.status(201).json({
            success: true,
            message:
                "Account created successfully",
            data: result
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/
export const login = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
            password
        } = req.body || {};


        const result =
            await loginUser({
                email,
                password
            });


        return res.status(200).json({
            success: true,
            message:
                "Login successful",
            data: result
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Google Login
|--------------------------------------------------------------------------
*/
export const googleLogin = async (
    req,
    res,
    next
) => {

    try {

        const {
            credential
        } = req.body || {};


        const result =
            await googleLoginUser({
                credential
            });


        return res.status(200).json({
            success: true,
            message:
                "Google login successful",
            data: result
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/
export const me = async (
    req,
    res,
    next
) => {

    try {

        const user =
            await getUserById(
                req.user.id
            );


        return res.status(200).json({
            success: true,
            message:
                "Authenticated user",
            data: {
                user
            }
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/
export const forgotPassword = async (
    req,
    res,
    next
) => {

    try {

        const {
            email
        } = req.body || {};


        const result =
            await requestPasswordReset({
                email
            });


        return res.status(200).json({
            success: true,
            message:
            result.message,
            data: {
                developmentResetToken:
                    result.developmentResetToken ||
                    null,

                expiresAt:
                    result.expiresAt ||
                    null
            }
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/
export const resetPasswordController = async (
    req,
    res,
    next
) => {

    try {

        const {
            token,
            newPassword
        } = req.body || {};


        await resetPassword({
            token,
            newPassword
        });


        return res.status(200).json({
            success: true,
            message:
                "Password reset successfully."
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Update Password
|--------------------------------------------------------------------------
*/
export const updatePasswordController = async (
    req,
    res,
    next
) => {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body || {};


        await updatePassword({
            userId:
            req.user.id,

            currentPassword,

            newPassword
        });


        return res.status(200).json({
            success: true,
            message:
                "Password updated successfully."
        });

    } catch (error) {

        next(error);
    }
};