import { query } from "../config/database.js";


/*
|--------------------------------------------------------------------------
| UUID Validation
|--------------------------------------------------------------------------
*/
const isValidUUID = (value) => {
    return (
        typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            value
        )
    );
};


/*
|--------------------------------------------------------------------------
| Create Application Error
|--------------------------------------------------------------------------
*/
const createFavoriteError = (
    message,
    statusCode,
    code
) => {
    const error = new Error(message);

    error.statusCode = statusCode;
    error.code = code;

    return error;
};


/*
|--------------------------------------------------------------------------
| Validate History ID
|--------------------------------------------------------------------------
*/
const validateHistoryId = (
    historyId
) => {
    if (!isValidUUID(historyId)) {
        throw createFavoriteError(
            "Invalid history ID.",
            400,
            "INVALID_HISTORY_ID"
        );
    }
};


/*
|--------------------------------------------------------------------------
| Verify History Ownership
|--------------------------------------------------------------------------
*/
const verifyHistoryOwnership = async ({
                                          userId,
                                          historyId
                                      }) => {

    validateHistoryId(historyId);

    const result = await query(
        `
            SELECT id
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
        throw createFavoriteError(
            "Speech history record not found",
            404,
            "HISTORY_NOT_FOUND"
        );
    }
};


/*
|--------------------------------------------------------------------------
| Add Favorite
|--------------------------------------------------------------------------
*/
export const addFavorite = async ({
                                      userId,
                                      historyId
                                  }) => {

    /*
     * Validate before PostgreSQL.
     */
    validateHistoryId(historyId);


    /*
     * Make sure the history belongs
     * to the authenticated user.
     */
    await verifyHistoryOwnership({
        userId,
        historyId
    });


    /*
     * Check for existing favorite.
     */
    const existingFavorite =
        await query(
            `
            SELECT id
            FROM favorites
            WHERE user_id = $1
              AND speech_history_id = $2
            LIMIT 1
            `,
            [
                userId,
                historyId
            ]
        );


    if (
        existingFavorite.rows.length > 0
    ) {
        throw createFavoriteError(
            "Speech is already in favorites",
            409,
            "ALREADY_FAVORITED"
        );
    }


    try {

        const result = await query(
            `
            INSERT INTO favorites (
                user_id,
                speech_history_id
            )
            VALUES ($1, $2)

            RETURNING
                id,
                user_id,
                speech_history_id,
                created_at
            `,
            [
                userId,
                historyId
            ]
        );

        return result.rows[0];

    } catch (error) {

        /*
         * PostgreSQL unique constraint:
         * (user_id, speech_history_id)
         */
        if (
            error.code === "23505"
        ) {
            throw createFavoriteError(
                "Speech is already in favorites",
                409,
                "ALREADY_FAVORITED"
            );
        }

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| Get Favorites By User
|--------------------------------------------------------------------------
*/
export const getFavoritesByUser = async (
    userId
) => {

    const result = await query(
        `
        SELECT
            f.id,
            f.user_id,
            f.speech_history_id,
            f.created_at AS favorited_at,

            h.text,
            h.language,
            h.voice_id,
            h.audio_url,
            h.audio_format,
            h.duration_seconds,
            h.created_at AS speech_created_at

        FROM favorites f

        INNER JOIN speech_history h
            ON h.id = f.speech_history_id

        WHERE f.user_id = $1

        ORDER BY f.created_at DESC
        `,
        [userId]
    );

    return result.rows;
};


/*
|--------------------------------------------------------------------------
| Remove Favorite
|--------------------------------------------------------------------------
*/
export const removeFavorite = async ({
                                         userId,
                                         historyId
                                     }) => {

    /*
     * Validate before PostgreSQL.
     */
    validateHistoryId(historyId);


    const result = await query(
        `
        DELETE FROM favorites
        WHERE user_id = $1
          AND speech_history_id = $2

        RETURNING id
        `,
        [
            userId,
            historyId
        ]
    );


    if (
        result.rows.length === 0
    ) {
        throw createFavoriteError(
            "Favorite not found",
            404,
            "FAVORITE_NOT_FOUND"
        );
    }


    return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Check Favorite
|--------------------------------------------------------------------------
*/
export const isFavorite = async ({
                                     userId,
                                     historyId
                                 }) => {

    /*
     * Validate before PostgreSQL.
     */
    validateHistoryId(historyId);


    const result = await query(
        `
        SELECT id
        FROM favorites
        WHERE user_id = $1
          AND speech_history_id = $2
        LIMIT 1
        `,
        [
            userId,
            historyId
        ]
    );


    return result.rows.length > 0;
};