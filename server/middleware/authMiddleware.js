/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
*/

import {
    verifyToken
} from "../utils/jwt.js";


/*
|--------------------------------------------------------------------------
| Require Authentication
|--------------------------------------------------------------------------
*/
export const requireAuth = (
    req,
    res,
    next
) => {

    try {

        const authorization =
            req.headers.authorization;


        if (
            !authorization
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Authorization token is required.",
                code:
                    "AUTHORIZATION_REQUIRED"
            });
        }


        const [
            scheme,
            token
        ] =
            authorization.split(" ");


        if (
            scheme !== "Bearer" ||
            !token
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid authorization header.",
                code:
                    "INVALID_AUTHORIZATION"
            });
        }


        const payload =
            verifyToken(token);


        req.user = {
            id:
                payload.userId ||
                payload.id,

            email:
            payload.email,

            role:
            payload.role
        };


        if (
            !req.user.id
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid authentication token.",
                code:
                    "INVALID_TOKEN"
            });
        }


        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired authentication token.",
            code:
                "INVALID_TOKEN"
        });
    }
};


/*
|--------------------------------------------------------------------------
| Require Admin
|--------------------------------------------------------------------------
*/
export const requireAdmin = (
    req,
    res,
    next
) => {

    const role =
        String(
            req.user?.role || ""
        ).toUpperCase();


    if (
        role !== "ADMIN"
    ) {

        return res.status(403).json({
            success: false,
            message:
                "Admin access required.",
            code:
                "ADMIN_ACCESS_REQUIRED"
        });
    }


    next();
};