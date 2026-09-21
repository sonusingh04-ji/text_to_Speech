import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    loginUser,
    registerUser,
    googleLoginUser,
    getCurrentUser
} from "../services/authService.js";

const AuthContext = createContext(null);

/*
|--------------------------------------------------------------------------
| Authentication Provider
|--------------------------------------------------------------------------
*/
export const AuthProvider = ({
                                 children
                             }) => {

    const [
        token,
        setToken
    ] = useState(
        localStorage.getItem(
            "tts_token"
        ) || ""
    );

    const [
        user,
        setUser
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    /*
    |--------------------------------------------------------------------------
    | Restore Session
    |--------------------------------------------------------------------------
    */
    useEffect(() => {

        let mounted = true;

        const restoreSession = async () => {

            const savedToken =
                localStorage.getItem(
                    "tts_token"
                );

            /*
            |--------------------------------------------------------------------------
            | No saved token
            |--------------------------------------------------------------------------
            */
            if (!savedToken) {

                if (mounted) {
                    setLoading(false);
                }

                return;
            }

            try {

                const response =
                    await getCurrentUser();

                /*
                |--------------------------------------------------------------------------
                | Backend response:
                |
                | {
                |   success: true,
                |   data: {
                |      user: {...}
                |   }
                | }
                |--------------------------------------------------------------------------
                */
                const currentUser =
                    response?.data?.user ||
                    response?.user ||
                    null;

                if (!currentUser) {

                    throw new Error(
                        "Authenticated user was not returned by the server."
                    );
                }

                if (mounted) {

                    setUser(
                        currentUser
                    );
                }

            } catch (error) {

                console.error(
                    "SESSION RESTORE ERROR:",
                    error
                );

                localStorage.removeItem(
                    "tts_token"
                );

                if (mounted) {

                    setToken("");

                    setUser(null);
                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }
            }
        };

        restoreSession();

        return () => {
            mounted = false;
        };

    }, []);

    /*
    |--------------------------------------------------------------------------
    | Save Authentication Data
    |--------------------------------------------------------------------------
    */
    const saveAuthentication = ({
                                    authData
                                }) => {

        const newToken =
            authData?.token;

        const authenticatedUser =
            authData?.user;

        if (!newToken) {

            throw new Error(
                "Authentication token was not returned by the server."
            );
        }

        if (!authenticatedUser) {

            throw new Error(
                "Authenticated user was not returned by the server."
            );
        }

        localStorage.setItem(
            "tts_token",
            newToken
        );

        setToken(
            newToken
        );

        setUser(
            authenticatedUser
        );

        return {
            token: newToken,
            user: authenticatedUser
        };
    };

    /*
    |--------------------------------------------------------------------------
    | Normal Login
    |--------------------------------------------------------------------------
    */
    const login = async ({
                             email,
                             password
                         }) => {

        const response =
            await loginUser({
                email,
                password
            });

        const authData =
            response?.data || {};

        saveAuthentication({
            authData
        });

        return response;
    };

    /*
    |--------------------------------------------------------------------------
    | Registration
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | Registration does NOT automatically log the user in.
    |
    | Flow:
    |
    | Register
    |    ↓
    | Account created
    |    ↓
    | Login page
    |    ↓
    | User enters email/password
    |    ↓
    | Login
    |    ↓
    | Dashboard
    |--------------------------------------------------------------------------
    */
    const register = async ({
                                name,
                                email,
                                password
                            }) => {

        const response =
            await registerUser({
                name,
                email,
                password
            });

        /*
         * Do NOT call saveAuthentication() here.
         *
         * The backend may return a token, but for registration
         * we intentionally do not save it.
         */

        return response;
    };

    /*
    |--------------------------------------------------------------------------
    | Google Login
    |--------------------------------------------------------------------------
    |
    | Google authentication IS an automatic login.
    |--------------------------------------------------------------------------
    */
    const googleLogin = async (
        credential
    ) => {

        const response =
            await googleLoginUser(
                credential
            );

        const authData =
            response?.data || {};

        saveAuthentication({
            authData
        });

        return response;
    };

    /*
    |--------------------------------------------------------------------------
    | Update User
    |--------------------------------------------------------------------------
    */
    const updateUser = (
        updatedUser
    ) => {

        if (!updatedUser) {
            return;
        }

        setUser(
            updatedUser
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */
    const logout = () => {

        /*
        |--------------------------------------------------------------------------
        | Remove application token
        |--------------------------------------------------------------------------
        */
        localStorage.removeItem(
            "tts_token"
        );

        /*
        |--------------------------------------------------------------------------
        | Clear Google automatic selection
        |--------------------------------------------------------------------------
        */
        try {

            if (
                window.google?.accounts?.id
            ) {

                window.google.accounts.id
                    .disableAutoSelect();
            }

        } catch (error) {

            console.warn(
                "Google logout cleanup failed:",
                error
            );
        }

        setToken("");

        setUser(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Context Value
    |--------------------------------------------------------------------------
    */
    const value = {

        token,

        user,

        loading,

        isAuthenticated:
            Boolean(
                token &&
                user
            ),

        login,

        register,

        googleLogin,

        updateUser,

        logout
    };

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
};

/*
|--------------------------------------------------------------------------
| useAuth Hook
|--------------------------------------------------------------------------
*/
export const useAuth = () => {

    const context =
        useContext(
            AuthContext
        );

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};