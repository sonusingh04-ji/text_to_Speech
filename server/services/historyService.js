import {
    query
} from "../config/database.js";

import {
    deleteAudioFromCloud,
    getCloudStoragePathFromUrl
} from "./cloudStorageService.js";


/*
|--------------------------------------------------------------------------
| UUID Validation
|--------------------------------------------------------------------------
*/
const isValidUUID = (
    value
) => {
    return (
        typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            value
        )
    );
};


/*
|--------------------------------------------------------------------------
| Create History
|--------------------------------------------------------------------------
*/
export const createHistory = async ({
                                        userId,
                                        text,
                                        language,
                                        voiceId,
                                        audioUrl = null,
                                        audioFormat = "mp3",
                                        durationSeconds = null
                                    }) => {

    const result = await query(
        `
            INSERT INTO speech_history (
                user_id,
                text,
                language,
                voice_id,
                audio_url,
                audio_format,
                duration_seconds
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING
                id,
                user_id,
                text,
                language,
                voice_id,
                audio_url,
                audio_format,
                duration_seconds,
                created_at
        `,
        [
            userId,
            text,
            language,
            voiceId,
            audioUrl,
            audioFormat,
            durationSeconds
        ]
    );

    return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Get User History
|--------------------------------------------------------------------------
*/
export const getHistoryByUser = async (
    userId
) => {

    const result = await query(
        `
            SELECT
                id,
                user_id,
                text,
                language,
                voice_id,
                audio_url,
                audio_format,
                duration_seconds,
                created_at
            FROM speech_history
            WHERE user_id = $1
            ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
};


/*
|--------------------------------------------------------------------------
| Get One History Item
|--------------------------------------------------------------------------
*/
export const getHistoryById = async ({
                                         userId,
                                         historyId
                                     }) => {

    if (!isValidUUID(historyId)) {
        const error = new Error(
            "Invalid history ID."
        );

        error.statusCode = 400;
        error.code =
            "INVALID_HISTORY_ID";

        throw error;
    }


    const result = await query(
        `
            SELECT
                id,
                user_id,
                text,
                language,
                voice_id,
                audio_url,
                audio_format,
                duration_seconds,
                created_at
            FROM speech_history
            WHERE id = $1
              AND user_id = $2
                LIMIT 1
        `,
        [
            historyId,
            userId
        ]
    );


    if (
        result.rows.length === 0
    ) {
        const error = new Error(
            "Speech history record not found"
        );

        error.statusCode = 404;
        error.code =
            "HISTORY_NOT_FOUND";

        throw error;
    }


    return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Delete History
|--------------------------------------------------------------------------
*/
export const deleteHistoryById = async ({
                                            userId,
                                            historyId
                                        }) => {

    if (!isValidUUID(historyId)) {
        const error = new Error(
            "Invalid history ID."
        );

        error.statusCode = 400;
        error.code =
            "INVALID_HISTORY_ID";

        throw error;
    }


    /*
     * Get record first so we can
     * retrieve the cloud audio URL.
     */
    const existingResult =
        await query(
            `
                SELECT
                    id,
                    audio_url
                FROM speech_history
                WHERE id = $1
                  AND user_id = $2
                LIMIT 1
            `,
            [
                historyId,
                userId
            ]
        );


    if (
        existingResult.rows.length === 0
    ) {
        const error = new Error(
            "Speech history record not found"
        );

        error.statusCode = 404;
        error.code =
            "HISTORY_NOT_FOUND";

        throw error;
    }


    const existing =
        existingResult.rows[0];


    /*
     * Delete database record.
     */
    const result = await query(
        `
            DELETE FROM speech_history
            WHERE id = $1
              AND user_id = $2
            RETURNING id
        `,
        [
            historyId,
            userId
        ]
    );


    const deleted =
        result.rows[0];


    /*
     * Delete corresponding cloud audio.
     */
    const cloudPath =
        getCloudStoragePathFromUrl(
            existing.audio_url
        );


    if (cloudPath) {
        try {
            await deleteAudioFromCloud(
                cloudPath
            );
        } catch (audioError) {
            /*
             * Database deletion succeeded,
             * so don't turn it into a failure.
             */
            console.warn(
                "History deleted, but cloud audio cleanup failed:",
                audioError.message
            );
        }
    }


    return deleted;
};