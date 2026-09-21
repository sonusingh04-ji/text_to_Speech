import "dotenv/config";

import path from "path";

import {
    query
} from "../config/database.js";

import {
    createClient
} from "@supabase/supabase-js";


const SUPABASE_URL =
    process.env.SUPABASE_URL;

const SUPABASE_SECRET_KEY =
    process.env.SUPABASE_SECRET_KEY;


if (
    !SUPABASE_URL ||
    !SUPABASE_SECRET_KEY
) {

    throw new Error(
        "Supabase storage configuration is missing. Check SUPABASE_URL and SUPABASE_SECRET_KEY in server/.env."
    );
}


const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_SECRET_KEY
    );


const PROFILE_BUCKET =
    process.env.SUPABASE_PROFILE_BUCKET ||
    "profile-photos";


const createProfileError = (
    message,
    statusCode,
    code
) => {

    const error =
        new Error(message);

    error.statusCode =
        statusCode;

    error.code =
        code;

    return error;
};


/*
|--------------------------------------------------------------------------
| Get Profile
|--------------------------------------------------------------------------
*/
export const getProfile =
    async (
        userId
    ) => {

        const result =
            await query(
                `
                    SELECT
                        id,
                        name,
                        email,
                        role,
                        profile_photo_url,
                        auth_provider,
                        created_at
                    FROM users
                    WHERE id = $1
                        LIMIT 1
                `,
                [userId]
            );


        if (
            result.rows.length === 0
        ) {

            throw createProfileError(
                "User not found.",
                404,
                "USER_NOT_FOUND"
            );
        }


        return result.rows[0];
    };


/*
|--------------------------------------------------------------------------
| Update Name
|--------------------------------------------------------------------------
*/
export const updateProfile =
    async ({
               userId,
               name
           }) => {

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {

            throw createProfileError(
                "Name is required.",
                400,
                "NAME_REQUIRED"
            );
        }


        if (
            name.trim().length > 100
        ) {

            throw createProfileError(
                "Name must not exceed 100 characters.",
                400,
                "NAME_TOO_LONG"
            );
        }


        const result =
            await query(
                `
                    UPDATE users
                    SET
                        name = $1
                    WHERE id = $2
                    RETURNING
                        id,
                        name,
                        email,
                        role,
                        profile_photo_url,
                        auth_provider,
                        created_at
                `,
                [
                    name.trim(),
                    userId
                ]
            );


        if (
            result.rows.length === 0
        ) {

            throw createProfileError(
                "User not found.",
                404,
                "USER_NOT_FOUND"
            );
        }


        return result.rows[0];
    };


/*
|--------------------------------------------------------------------------
| Upload Profile Photo
|--------------------------------------------------------------------------
*/
export const uploadProfilePhoto =
    async ({
               userId,
               file
           }) => {

        if (
            !file
        ) {

            throw createProfileError(
                "Profile photo is required.",
                400,
                "PROFILE_PHOTO_REQUIRED"
            );
        }


        const existingResult =
            await query(
                `
                    SELECT
                        profile_photo_url
                    FROM users
                    WHERE id = $1
                    LIMIT 1
                `,
                [userId]
            );


        if (
            existingResult.rows.length === 0
        ) {

            throw createProfileError(
                "User not found.",
                404,
                "USER_NOT_FOUND"
            );
        }


        const oldUrl =
            existingResult
                .rows[0]
                .profile_photo_url;


        const extension =
            path
                .extname(
                    file.originalname
                )
                .toLowerCase() ||
            ".jpg";


        const safeExtension =
            extension === ".png"
                ? ".png"
                : extension === ".webp"
                    ? ".webp"
                    : ".jpg";


        const storagePath =
            `profiles/${userId}/avatar-${Date.now()}${safeExtension}`;


        const uploadResult =
            await supabase.storage
                .from(
                    PROFILE_BUCKET
                )
                .upload(
                    storagePath,
                    file.buffer,
                    {
                        contentType:
                        file.mimetype,

                        upsert:
                            false,

                        cacheControl:
                            "3600"
                    }
                );


        if (
            uploadResult.error
        ) {

            const uploadError =
                createProfileError(
                    "Unable to upload profile photo.",
                    503,
                    "PROFILE_PHOTO_UPLOAD_FAILED"
                );

            uploadError.details =
                uploadResult.error.message;

            throw uploadError;
        }


        const publicUrlResult =
            supabase.storage
                .from(
                    PROFILE_BUCKET
                )
                .getPublicUrl(
                    storagePath
                );


        const publicUrl =
            publicUrlResult
                ?.data
                ?.publicUrl;


        if (
            !publicUrl
        ) {

            throw createProfileError(
                "Unable to create profile photo URL.",
                503,
                "PROFILE_PHOTO_URL_FAILED"
            );
        }


        const result =
            await query(
                `
                    UPDATE users
                    SET
                        profile_photo_url = $1
                    WHERE id = $2
                    RETURNING
                        id,
                        name,
                        email,
                        role,
                        profile_photo_url,
                        auth_provider,
                        created_at
                `,
                [
                    publicUrl,
                    userId
                ]
            );


        /*
        |--------------------------------------------------------------------------
        | Remove old photo
        |--------------------------------------------------------------------------
        */
        if (
            oldUrl
        ) {

            try {

                const marker =
                    `/storage/v1/object/public/${PROFILE_BUCKET}/`;


                const markerIndex =
                    oldUrl.indexOf(
                        marker
                    );


                if (
                    markerIndex !== -1
                ) {

                    const oldPath =
                        decodeURIComponent(
                            oldUrl.slice(
                                markerIndex +
                                marker.length
                            )
                        );


                    await supabase.storage
                        .from(
                            PROFILE_BUCKET
                        )
                        .remove([
                            oldPath
                        ]);
                }

            } catch (
                cleanupError
                ) {

                console.warn(
                    "Old profile photo cleanup failed:",
                    cleanupError.message
                );
            }
        }


        return result.rows[0];
    };