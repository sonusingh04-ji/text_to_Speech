import express from "express";

import {
    register,
    login,
    googleLogin,
    me,
    forgotPassword,
    resetPasswordController,
    updatePasswordController
} from "../controllers/authController.js";

import {
    requireAuth
} from "../middleware/authMiddleware.js";


const router =
    express.Router();


/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/
router.post(
    "/register",
    register
);


router.post(
    "/login",
    login
);


router.post(
    "/google",
    googleLogin
);


router.post(
    "/forgot-password",
    forgotPassword
);


router.post(
    "/reset-password",
    resetPasswordController
);


/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/
router.get(
    "/me",
    requireAuth,
    me
);


router.post(
    "/update-password",
    requireAuth,
    updatePasswordController
);


export default router;