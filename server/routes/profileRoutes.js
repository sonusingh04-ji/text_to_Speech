import express from "express";

import {
    requireAuth
} from "../middleware/authMiddleware.js";

import {
    uploadProfilePhoto
} from "../middleware/profileUpload.js";

import {
    getMyProfile,
    updateMyProfile,
    uploadMyProfilePhoto
} from "../controllers/profileController.js";


const router =
    express.Router();


/*
|--------------------------------------------------------------------------
| Get Profile
|--------------------------------------------------------------------------
*/
router.get(
    "/",
    requireAuth,
    getMyProfile
);


/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/
router.patch(
    "/",
    requireAuth,
    updateMyProfile
);


/*
|--------------------------------------------------------------------------
| Upload Photo
|--------------------------------------------------------------------------
*/
router.post(
    "/photo",
    requireAuth,
    uploadProfilePhoto,
    uploadMyProfilePhoto
);


export default router;