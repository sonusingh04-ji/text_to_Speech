import api from "./api.js";


/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/
export const registerUser = async ({
                                       name,
                                       email,
                                       password
                                   }) => {

    const response =
        await api.post(
            "/api/auth/register",
            {
                name,
                email,
                password
            }
        );


    return response.data;
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

    const response =
        await api.post(
            "/api/auth/login",
            {
                email,
                password
            }
        );


    return response.data;
};


/*
|--------------------------------------------------------------------------
| Google Login
|--------------------------------------------------------------------------
*/
export const googleLoginUser = async (
    credential
) => {

    if (
        typeof credential !== "string" ||
        !credential.trim()
    ) {

        throw new Error(
            "Google credential was not returned."
        );
    }


    const response =
        await api.post(
            "/api/auth/google",
            {
                credential:
                    credential.trim()
            }
        );


    return response.data;
};


/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/
export const getCurrentUser = async () => {

    const response =
        await api.get(
            "/api/auth/me"
        );


    return response.data;
};


/*
|--------------------------------------------------------------------------
| Forgot Password
|--------------------------------------------------------------------------
*/
export const forgotPassword = async (
    email
) => {

    if (
        typeof email !== "string" ||
        !email.trim()
    ) {

        throw new Error(
            "Email is required."
        );
    }


    const response =
        await api.post(
            "/api/auth/forgot-password",
            {
                email:
                    email.trim()
            }
        );


    return response.data;
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

        throw new Error(
            "Reset token is required."
        );
    }


    const response =
        await api.post(
            "/api/auth/reset-password",
            {
                token:
                    token.trim(),

                newPassword
            }
        );


    return response.data;
};


/*
|--------------------------------------------------------------------------
| Update Password
|--------------------------------------------------------------------------
*/
export const updatePassword = async ({
                                         currentPassword,
                                         newPassword
                                     }) => {

    const response =
        await api.post(
            "/api/auth/update-password",
            {
                currentPassword,
                newPassword
            }
        );


    return response.data;
};