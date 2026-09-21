import express from "express";

import {
    getDashboard,
    getUsers,
    getUser,
    getAnalytics,
    getAnalyticsUsage,
    getAnalyticsSpeech,
    createAdmin,
    deleteUser
} from "../controllers/adminController.js";

import {
    requireAuth,
    requireAdmin
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/
router.get(
    "/dashboard",
    requireAuth,
    requireAdmin,
    getDashboard
);

/*
|--------------------------------------------------------------------------
| All Users
|--------------------------------------------------------------------------
*/
router.get(
    "/users",
    requireAuth,
    requireAdmin,
    getUsers
);

/*
|--------------------------------------------------------------------------
| Single User
|--------------------------------------------------------------------------
*/
router.get(
    "/users/:id",
    requireAuth,
    requireAdmin,
    getUser
);

/*
|--------------------------------------------------------------------------
| Create Admin
|--------------------------------------------------------------------------
*/
router.post(
    "/users/admin",
    requireAuth,
    requireAdmin,
    createAdmin
);

/*
|--------------------------------------------------------------------------
| Delete User
|--------------------------------------------------------------------------
*/
router.delete(
    "/users/:id",
    requireAuth,
    requireAdmin,
    deleteUser
);

/*
|--------------------------------------------------------------------------
| Platform Analytics
|--------------------------------------------------------------------------
*/
router.get(
    "/analytics",
    requireAuth,
    requireAdmin,
    getAnalytics
);

/*
|--------------------------------------------------------------------------
| Usage Analytics
|--------------------------------------------------------------------------
*/
router.get(
    "/analytics/usage",
    requireAuth,
    requireAdmin,
    getAnalyticsUsage
);

/*
|--------------------------------------------------------------------------
| Speech Analytics
|--------------------------------------------------------------------------
*/
router.get(
    "/analytics/speech",
    requireAuth,
    requireAdmin,
    getAnalyticsSpeech
);

export default router;