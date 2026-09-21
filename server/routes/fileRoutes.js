import express from "express";

import {
    uploadFile,
    getMyFiles,
    getMyFile,
    deleteMyFile
} from "../controllers/fileController.js";

import {
    requireAuth
} from "../middleware/authMiddleware.js";

import {
    uploadSingleFile
} from "../middleware/fileUpload.js";


const router =
    express.Router();


/*
|--------------------------------------------------------------------------
| Upload
|--------------------------------------------------------------------------
*/
router.post(
    "/upload",
    requireAuth,
    uploadSingleFile,
    uploadFile
);


/*
|--------------------------------------------------------------------------
| Get all files
|--------------------------------------------------------------------------
*/
router.get(
    "/",
    requireAuth,
    getMyFiles
);


/*
|--------------------------------------------------------------------------
| Get single file
|--------------------------------------------------------------------------
*/
router.get(
    "/:id",
    requireAuth,
    getMyFile
);


/*
|--------------------------------------------------------------------------
| Delete file
|--------------------------------------------------------------------------
*/
router.delete(
    "/:id",
    requireAuth,
    deleteMyFile
);


export default router;