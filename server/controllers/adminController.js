import {
    getDashboardOverview,
    getAllUsers,
    getUserDetails,
    getPlatformAnalytics,
    getUsageAnalytics,
    getSpeechAnalytics,
    deleteUser as deleteUserService
} from "../services/adminService.js";

import {
    createAdminUser
} from "../services/authService.js";

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/
export const getDashboard = async (
    req,
    res,
    next
) => {

    try {

        const overview =
            await getDashboardOverview();

        return res.status(200).json({

            success: true,

            data: {
                overview
            }

        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/
export const getUsers = async (
    req,
    res,
    next
) => {

    try {

        const limit =
            Math.min(
                Math.max(
                    Number(
                        req.query.limit
                    ) || 50,
                    1
                ),
                100
            );

        const offset =
            Math.max(
                Number(
                    req.query.offset
                ) || 0,
                0
            );

        const users =
            await getAllUsers({
                limit,
                offset
            });

        return res.status(200).json({

            success: true,

            count:
            users.length,

            pagination: {
                limit,
                offset
            },

            data: {
                users
            }

        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| One User
|--------------------------------------------------------------------------
*/
export const getUser = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;

        const user =
            await getUserDetails(
                id
            );

        return res.status(200).json({

            success: true,

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
| Platform Analytics
|--------------------------------------------------------------------------
*/
export const getAnalytics = async (
    req,
    res,
    next
) => {

    try {

        const analytics =
            await getPlatformAnalytics();

        return res.status(200).json({

            success: true,

            data: analytics

        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Usage Analytics
|--------------------------------------------------------------------------
*/
export const getAnalyticsUsage = async (
    req,
    res,
    next
) => {

    try {

        const usage =
            await getUsageAnalytics();

        return res.status(200).json({

            success: true,

            count:
            usage.length,

            data: {
                usage
            }

        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Speech Analytics
|--------------------------------------------------------------------------
*/
export const getAnalyticsSpeech = async (
    req,
    res,
    next
) => {

    try {

        const speech =
            await getSpeechAnalytics();

        return res.status(200).json({

            success: true,

            count:
            speech.length,

            data: {
                speech
            }

        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Create New Admin
|--------------------------------------------------------------------------
*/
export const createAdmin = async (
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

        const user =
            await createAdminUser({
                name,
                email,
                password
            });

        return res.status(201).json({

            success: true,

            message:
                "New admin account created successfully.",

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
| Delete User
|--------------------------------------------------------------------------
*/
export const deleteUser = async (
    req,
    res,
    next
) => {

    try {

        const deletedUser =
            await deleteUserService({
                userId: req.params.id,
                adminUserId: req.user.id
            });

        return res.status(200).json({

            success: true,

            message:
                "User deleted successfully.",

            data: {
                user: deletedUser
            }

        });

    } catch (error) {

        next(error);
    }
};