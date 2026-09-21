import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/
const SUPABASE_URL =
    process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET_NAME =
    process.env.SUPABASE_AUDIO_BUCKET ||
    "tts-audio";


/*
|--------------------------------------------------------------------------
| Validate Configuration
|--------------------------------------------------------------------------
*/
if (
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY
) {
    console.warn(
        "Supabase Storage is not configured. " +
        "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
}


/*
|--------------------------------------------------------------------------
| Supabase Client
|--------------------------------------------------------------------------
*/
const supabase =
    SUPABASE_URL &&
    SUPABASE_SERVICE_ROLE_KEY
        ? createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )
        : null;


/*
|--------------------------------------------------------------------------
| Storage Error
|--------------------------------------------------------------------------
*/
const createStorageError = (
    message,
    code = "STORAGE_ERROR",
    statusCode = 503
) => {
    const error = new Error(message);

    error.code = code;
    error.statusCode = statusCode;

    return error;
};


/*
|--------------------------------------------------------------------------
| Check Configuration
|--------------------------------------------------------------------------
*/
const ensureConfigured = () => {
    if (!supabase) {
        throw createStorageError(
            "Supabase Storage is not configured.",
            "STORAGE_NOT_CONFIGURED",
            503
        );
    }
};


/*
|--------------------------------------------------------------------------
| Save Audio Buffer To Supabase
|--------------------------------------------------------------------------
*/
export const saveAudioToCloud = async (
    audioBuffer,
    extension = "mp3",
    contentType = "audio/mpeg"
) => {
    ensureConfigured();

    const safeExtension =
        String(extension)
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )
            .toLowerCase() || "mp3";

    /*
     * Keep every user's file inside
     * a unique path.
     */
    const filePath =
        `speech/${randomUUID()}.${safeExtension}`;

    /*
     * Convert Node Buffer into a Uint8Array.
     */
    const fileBody =
        new Uint8Array(audioBuffer);

    const {
        error
    } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(
            filePath,
            fileBody,
            {
                contentType,
                cacheControl: "3600",
                upsert: false
            }
        );

    if (error) {
        throw createStorageError(
            `Supabase upload failed: ${error.message}`,
            "STORAGE_UPLOAD_FAILED",
            503
        );
    }

    const {
        data
    } = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    if (!data?.publicUrl) {
        throw createStorageError(
            "Unable to create Supabase public audio URL.",
            "STORAGE_URL_FAILED",
            503
        );
    }

    return {
        filePath,
        fileName: path.basename(filePath),
        publicUrl: data.publicUrl
    };
};


/*
|--------------------------------------------------------------------------
| Delete Audio From Supabase
|--------------------------------------------------------------------------
*/
export const deleteAudioFromCloud = async (
    filePath
) => {
    ensureConfigured();

    if (
        typeof filePath !== "string" ||
        !filePath.trim()
    ) {
        return false;
    }

    const {
        error
    } = await supabase
        .storage
        .from(BUCKET_NAME)
        .remove([
            filePath
        ]);

    if (error) {
        throw createStorageError(
            `Supabase delete failed: ${error.message}`,
            "STORAGE_DELETE_FAILED",
            503
        );
    }

    return true;
};


/*
|--------------------------------------------------------------------------
| Extract Supabase Storage Path
|--------------------------------------------------------------------------
*/
export const getCloudStoragePathFromUrl = (
    audioUrl
) => {
    if (
        typeof audioUrl !== "string" ||
        !audioUrl.trim()
    ) {
        return null;
    }

    try {
        const parsedUrl =
            new URL(audioUrl);

        const marker =
            `/storage/v1/object/public/${BUCKET_NAME}/`;

        const index =
            parsedUrl.pathname.indexOf(marker);

        if (index === -1) {
            return null;
        }

        return decodeURIComponent(
            parsedUrl.pathname.slice(
                index + marker.length
            )
        );
    } catch {
        return null;
    }
};


/*
|--------------------------------------------------------------------------
| Get Bucket Name
|--------------------------------------------------------------------------
*/
export const getAudioBucketName = () => {
    return BUCKET_NAME;
};