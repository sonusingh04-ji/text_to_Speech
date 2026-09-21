import path from "path";

import {
    extractTextFromFile,
    createUploadedFileRecord,
    getFilesByUser,
    getFileById,
    deleteFileById
} from "../services/fileService.js";


/*
|--------------------------------------------------------------------------
| Upload File
|--------------------------------------------------------------------------
*/
export const uploadFile = async (
    req,
    res,
    next
) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded.",
                code: "FILE_REQUIRED"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Extract text
        |--------------------------------------------------------------------------
        */
        const extractedText =
            await extractTextFromFile(
                req.file
            );


        if (
            !extractedText ||
            extractedText.trim().length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "No readable text could be extracted from the file.",
                code:
                    "TEXT_EXTRACTION_EMPTY"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | File extension
        |--------------------------------------------------------------------------
        */
        const extension =
            path
                .extname(
                    req.file.originalname
                )
                .toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | Create database record
        |--------------------------------------------------------------------------
        */
        const fileRecord =
            await createUploadedFileRecord({
                userId:
                req.user.id,

                originalName:
                req.file.originalname,

                fileType:
                extension,

                extractedText
            });


        return res.status(201).json({
            success: true,

            message:
                "File uploaded and text extracted successfully",

            file:
            fileRecord
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Get All Files
|--------------------------------------------------------------------------
*/
export const getFiles = async (
    req,
    res,
    next
) => {

    try {

        const files =
            await getFilesByUser(
                req.user.id
            );


        return res.status(200).json({
            success: true,

            count:
            files.length,

            files
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Get Single File
|--------------------------------------------------------------------------
*/
export const getMyFile = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | Service expects an object:
        | { userId, fileId }
        |--------------------------------------------------------------------------
        */
        const file =
            await getFileById({
                userId:
                req.user.id,

                fileId:
                id
            });


        return res.status(200).json({
            success: true,

            file
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Delete File
|--------------------------------------------------------------------------
*/
export const deleteMyFile = async (
    req,
    res,
    next
) => {

    try {

        const {
            id
        } = req.params;


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | Service expects an object:
        | { userId, fileId }
        |--------------------------------------------------------------------------
        */
        const deleted =
            await deleteFileById({
                userId:
                req.user.id,

                fileId:
                id
            });


        return res.status(200).json({
            success: true,

            message:
                "File deleted successfully",

            file:
            deleted
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Backward-Compatible Aliases
|--------------------------------------------------------------------------
*/
export const getMyFiles =
    getFiles;


export const getUploadedFiles =
    getFiles;


export const getUploadedFile =
    getMyFile;


export const deleteUploadedFile =
    deleteMyFile;