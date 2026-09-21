import path from "path";

import {
    PDFParse
} from "pdf-parse";

import mammoth from "mammoth";

import {
    query
} from "../config/database.js";


/*
|--------------------------------------------------------------------------
| Supported File Types
|--------------------------------------------------------------------------
*/
const SUPPORTED_EXTENSIONS =
    new Set([
        ".txt",
        ".pdf",
        ".docx"
    ]);


/*
|--------------------------------------------------------------------------
| UUID Validation
|--------------------------------------------------------------------------
*/
const isValidUUID = (
    value
) => {

    return (
        typeof value ===
        "string" &&

        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            .test(value)
    );
};


/*
|--------------------------------------------------------------------------
| Create Application Error
|--------------------------------------------------------------------------
*/
const createFileError = (
    message,
    statusCode,
    code
) => {

    const error =
        new Error(
            message
        );


    error.statusCode =
        statusCode;


    error.code =
        code;


    return error;
};


/*
|--------------------------------------------------------------------------
| Extract TXT
|--------------------------------------------------------------------------
*/
const extractTxtText = (
    buffer
) => {

    return buffer
        .toString("utf8")
        .trim();
};


/*
|--------------------------------------------------------------------------
| Extract PDF
|--------------------------------------------------------------------------
*/
const extractPdfText = async (
    buffer
) => {

    const parser =
        new PDFParse({
            data:
            buffer
        });


    try {

        const result =
            await parser.getText();


        return (
            result?.text ||
            ""
        ).trim();

    } finally {

        await parser.destroy();
    }
};


/*
|--------------------------------------------------------------------------
| Extract DOCX
|--------------------------------------------------------------------------
*/
const extractDocxText = async (
    buffer
) => {

    const result =
        await mammoth.extractRawText({
            buffer
        });


    return (
        result?.value ||
        ""
    ).trim();
};


/*
|--------------------------------------------------------------------------
| Extract Text From File
|--------------------------------------------------------------------------
*/
export const extractTextFromFile =
    async (
        file
    ) => {

        if (!file) {

            throw createFileError(
                "No file uploaded.",
                400,
                "FILE_REQUIRED"
            );
        }


        const extension =
            path
                .extname(
                    file.originalname
                )
                .toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | Validate extension
        |--------------------------------------------------------------------------
        */
        if (
            !SUPPORTED_EXTENSIONS.has(
                extension
            )
        ) {

            throw createFileError(
                "Only TXT, PDF, and DOCX files are supported.",
                400,
                "UNSUPPORTED_FILE_TYPE"
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Validate buffer
        |--------------------------------------------------------------------------
        */
        if (
            !file.buffer ||
            file.buffer.length === 0
        ) {

            throw createFileError(
                "Uploaded file is empty.",
                400,
                "EMPTY_FILE"
            );
        }


        try {

            /*
            |--------------------------------------------------------------------------
            | TXT
            |--------------------------------------------------------------------------
            */
            if (
                extension === ".txt"
            ) {

                return extractTxtText(
                    file.buffer
                );
            }


            /*
            |--------------------------------------------------------------------------
            | PDF
            |--------------------------------------------------------------------------
            */
            if (
                extension === ".pdf"
            ) {

                return await extractPdfText(
                    file.buffer
                );
            }


            /*
            |--------------------------------------------------------------------------
            | DOCX
            |--------------------------------------------------------------------------
            */
            if (
                extension === ".docx"
            ) {

                return await extractDocxText(
                    file.buffer
                );
            }

        } catch (error) {

            /*
            |--------------------------------------------------------------------------
            | Preserve application errors
            |--------------------------------------------------------------------------
            */
            if (
                error?.statusCode &&
                error?.code
            ) {

                throw error;
            }


            const extractionError =
                createFileError(
                    "Unable to extract text from the uploaded file.",
                    400,
                    "TEXT_EXTRACTION_FAILED"
                );


            extractionError.cause =
                error;


            throw extractionError;
        }


        throw createFileError(
            "Unsupported file type.",
            400,
            "UNSUPPORTED_FILE_TYPE"
        );
    };


/*
|--------------------------------------------------------------------------
| Create Uploaded File
|--------------------------------------------------------------------------
*/
export const createUploadedFile =
    async ({
               userId,
               originalName,
               fileType,
               fileUrl = null,
               extractedText
           }) => {

        const result =
            await query(
                `
                    INSERT INTO uploaded_files (
                        user_id,
                        original_name,
                        file_type,
                        file_url,
                        extracted_text
                    )

                    VALUES (
                               $1,
                               $2,
                               $3,
                               $4,
                               $5
                           )

                        RETURNING
                    id,
                    user_id,
                    original_name,
                    file_type,
                    file_url,
                    extracted_text,
                    created_at
                `,
                [
                    userId,
                    originalName,
                    fileType,
                    fileUrl,
                    extractedText
                ]
            );


        return result.rows[0];
    };


/*
|--------------------------------------------------------------------------
| Get Files For User
|--------------------------------------------------------------------------
*/
export const getFilesByUser =
    async (
        userId
    ) => {

        const result =
            await query(
                `
                    SELECT
                        id,
                        user_id,
                        original_name,
                        file_type,
                        file_url,
                        extracted_text,
                        created_at

                    FROM uploaded_files

                    WHERE user_id = $1

                    ORDER BY created_at DESC
                `,
                [
                    userId
                ]
            );


        return result.rows;
    };


/*
|--------------------------------------------------------------------------
| Get One File
|--------------------------------------------------------------------------
*/
export const getFileById =
    async ({
               userId,
               fileId
           }) => {

        /*
        |--------------------------------------------------------------------------
        | Validate file ID
        |--------------------------------------------------------------------------
        */
        if (
            !isValidUUID(
                fileId
            )
        ) {

            throw createFileError(
                "Invalid file ID.",
                400,
                "INVALID_FILE_ID"
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Query owned file
        |--------------------------------------------------------------------------
        */
        const result =
            await query(
                `
                    SELECT
                        id,
                        user_id,
                        original_name,
                        file_type,
                        file_url,
                        extracted_text,
                        created_at

                    FROM uploaded_files

                    WHERE id = $1

                      AND user_id = $2

                        LIMIT 1
                `,
                [
                    fileId,
                    userId
                ]
            );


        if (
            result.rows.length === 0
        ) {

            throw createFileError(
                "File not found.",
                404,
                "FILE_NOT_FOUND"
            );
        }


        return result.rows[0];
    };


/*
|--------------------------------------------------------------------------
| Delete One File
|--------------------------------------------------------------------------
*/
export const deleteFileById =
    async ({
               userId,
               fileId
           }) => {

        /*
        |--------------------------------------------------------------------------
        | Validate file ID
        |--------------------------------------------------------------------------
        */
        if (
            !isValidUUID(
                fileId
            )
        ) {

            throw createFileError(
                "Invalid file ID.",
                400,
                "INVALID_FILE_ID"
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Delete only user's own file
        |--------------------------------------------------------------------------
        */
        const result =
            await query(
                `
                    DELETE FROM uploaded_files

                    WHERE id = $1

                      AND user_id = $2

                        RETURNING
                    id,
                    user_id,
                    original_name,
                    file_type,
                    file_url
                `,
                [
                    fileId,
                    userId
                ]
            );


        if (
            result.rows.length === 0
        ) {

            throw createFileError(
                "File not found.",
                404,
                "FILE_NOT_FOUND"
            );
        }


        return result.rows[0];
    };


/*
|--------------------------------------------------------------------------
| Backward-Compatible Aliases
|--------------------------------------------------------------------------
*/
export const createUploadedFileRecord =
    createUploadedFile;


export const getMyFiles =
    getFilesByUser;


export const getUploadedFiles =
    getFilesByUser;


export const deleteMyFile =
    deleteFileById;


export const deleteUploadedFile =
    deleteFileById;