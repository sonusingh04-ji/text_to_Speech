import { query } from "../config/database.js";


/*
|--------------------------------------------------------------------------
| Dashboard Overview
|--------------------------------------------------------------------------
*/
export const getDashboardOverview = async () => {

    const result = await query(`
        SELECT

            (
                SELECT COUNT(*)
                FROM users
            ) AS total_users,

            (
                SELECT COUNT(*)
                FROM speech_history
            ) AS total_speeches,

            (
                SELECT COALESCE(
                               SUM(characters_used),
                               0
                       )
                FROM usage_records
            ) AS total_characters_used,

            (
                SELECT COUNT(*)
                FROM favorites
            ) AS total_favorites,

            (
                SELECT COUNT(*)
                FROM uploaded_files
            ) AS total_uploaded_files,

            (
                SELECT COUNT(*)
                FROM users
                WHERE created_at >= CURRENT_DATE
                  AND created_at < CURRENT_DATE + INTERVAL '1 day'
            ) AS users_today,

            (
        SELECT COUNT(*)
        FROM speech_history
        WHERE created_at >= CURRENT_DATE
          AND created_at < CURRENT_DATE + INTERVAL '1 day'
            ) AS speeches_today
    `);

    return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| List All Users
|--------------------------------------------------------------------------
|
| Each metric is aggregated independently.
| This prevents one-to-many JOIN multiplication
| from double-counting records.
|--------------------------------------------------------------------------
*/
export const getAllUsers = async ({
                                      limit = 50,
                                      offset = 0
                                  } = {}) => {

    const result = await query(
        `
            SELECT

                u.id,
                u.name,
                u.email,
                u.role,
                u.created_at,

                COALESCE(
                        sh.speech_count,
                        0
                ) AS speech_count,

                COALESCE(
                        fv.favorite_count,
                        0
                ) AS favorite_count,

                COALESCE(
                        uf.uploaded_file_count,
                        0
                ) AS uploaded_file_count,

                COALESCE(
                        ur.characters_used,
                        0
                ) AS characters_used

            FROM users u

                     LEFT JOIN (
                SELECT
                    user_id,
                    COUNT(*) AS speech_count
                FROM speech_history
                GROUP BY user_id
            ) sh
                               ON sh.user_id = u.id

                     LEFT JOIN (
                SELECT
                    user_id,
                    COUNT(*) AS favorite_count
                FROM favorites
                GROUP BY user_id
            ) fv
                               ON fv.user_id = u.id

                     LEFT JOIN (
                SELECT
                    user_id,
                    COUNT(*) AS uploaded_file_count
                FROM uploaded_files
                GROUP BY user_id
            ) uf
                               ON uf.user_id = u.id

                     LEFT JOIN (
                SELECT
                    user_id,
                    COALESCE(
                            SUM(characters_used),
                            0
                    ) AS characters_used
                FROM usage_records
                GROUP BY user_id
            ) ur
                               ON ur.user_id = u.id

            ORDER BY u.created_at DESC

                LIMIT $1
            OFFSET $2
        `,
        [
            limit,
            offset
        ]
    );

    return result.rows;
};


/*
|--------------------------------------------------------------------------
| Get One User
|--------------------------------------------------------------------------
*/
export const getUserDetails = async (
    userId
) => {

    const result = await query(
        `
            SELECT

                u.id,
                u.name,
                u.email,
                u.role,
                u.created_at

            FROM users u

            WHERE u.id = $1
        `,
        [userId]
    );

    if (
        result.rows.length === 0
    ) {

        const error = new Error(
            "User not found."
        );

        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";

        throw error;
    }

    const user =
        result.rows[0];


    const statsResult =
        await query(
            `
                SELECT

                    (
                        SELECT COUNT(*)
                        FROM speech_history
                        WHERE user_id = $1
                    ) AS speech_count,

                    (
                        SELECT COUNT(*)
                        FROM favorites
                        WHERE user_id = $1
                    ) AS favorite_count,

                    (
                        SELECT COUNT(*)
                        FROM uploaded_files
                        WHERE user_id = $1
                    ) AS uploaded_file_count,

                    (
                        SELECT COALESCE(
                                       SUM(characters_used),
                                       0
                               )
                        FROM usage_records
                        WHERE user_id = $1
                    ) AS characters_used
            `,
            [userId]
        );


    return {
        ...user,
        stats:
            statsResult.rows[0]
    };
};


/*
|--------------------------------------------------------------------------
| Delete User
|--------------------------------------------------------------------------
|
| Deletes the user's related records first and then
| deletes the user itself.
|
| This is performed as one PostgreSQL statement using
| CTEs so the operation remains atomic.
|--------------------------------------------------------------------------
*/
export const deleteUser = async ({
                                     userId,
                                     adminUserId
                                 }) => {

    /*
    |--------------------------------------------------------------------------
    | Validate User ID
    |--------------------------------------------------------------------------
    */
    if (!userId) {

        const error = new Error(
            "User ID is required."
        );

        error.statusCode = 400;
        error.code = "USER_ID_REQUIRED";

        throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | Prevent self deletion
    |--------------------------------------------------------------------------
    */
    if (
        String(userId) ===
        String(adminUserId)
    ) {

        const error = new Error(
            "You cannot delete your own admin account."
        );

        error.statusCode = 400;
        error.code = "SELF_DELETE_NOT_ALLOWED";

        throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | Check whether user exists
    |--------------------------------------------------------------------------
    */
    const existingUser =
        await query(
            `
                SELECT
                    id,
                    name,
                    email,
                    role

                FROM users

                WHERE id = $1
            `,
            [userId]
        );


    if (
        existingUser.rows.length === 0
    ) {

        const error = new Error(
            "User not found."
        );

        error.statusCode = 404;
        error.code = "USER_NOT_FOUND";

        throw error;
    }


    const deletedUser =
        existingUser.rows[0];


    /*
    |--------------------------------------------------------------------------
    | Delete related user data
    |--------------------------------------------------------------------------
    |
    | Known user-linked tables:
    |
    | speech_history
    | favorites
    | uploaded_files
    | usage_records
    |
    | They are removed before the users record.
    |--------------------------------------------------------------------------
    */
    await query(
        `
            WITH deleted_history AS (

            DELETE FROM speech_history
            WHERE user_id = $1
                RETURNING user_id

        ),

        deleted_favorites AS (

            DELETE FROM favorites
            WHERE user_id = $1
                RETURNING user_id

                ),

                deleted_files AS (

            DELETE FROM uploaded_files
            WHERE user_id = $1
                RETURNING user_id

                ),

                deleted_usage AS (

            DELETE FROM usage_records
            WHERE user_id = $1
                RETURNING user_id

                )

            DELETE FROM users
            WHERE id = $1
        `,
        [userId]
    );


    /*
    |--------------------------------------------------------------------------
    | Return deleted user information
    |--------------------------------------------------------------------------
    */
    return deletedUser;
};


/*
|--------------------------------------------------------------------------
| Platform Analytics
|--------------------------------------------------------------------------
*/
export const getPlatformAnalytics = async () => {

    const dailyResult =
        await query(`
            SELECT

                DATE(created_at) AS date,

                COUNT(*) AS speech_count

            FROM speech_history

            WHERE created_at >=
                CURRENT_DATE - INTERVAL '6 days'

            GROUP BY DATE(created_at)

            ORDER BY date ASC
        `);


    const languageResult =
        await query(`
            SELECT

                language,

                COUNT(*) AS count

            FROM speech_history

            GROUP BY language

            ORDER BY count DESC

                LIMIT 10
        `);


    const voiceResult =
        await query(`
            SELECT

                voice_id,

                COUNT(*) AS count

            FROM speech_history

            GROUP BY voice_id

            ORDER BY count DESC

                LIMIT 10
        `);


    const uploadResult =
        await query(`
            SELECT

                file_type,

                COUNT(*) AS count

            FROM uploaded_files

            GROUP BY file_type

            ORDER BY count DESC
        `);


    return {

        dailySpeech:
        dailyResult.rows,

        languages:
        languageResult.rows,

        voices:
        voiceResult.rows,

        uploadedFilesByType:
        uploadResult.rows

    };
};


/*
|--------------------------------------------------------------------------
| Usage Analytics
|--------------------------------------------------------------------------
*/
export const getUsageAnalytics = async () => {

    const result =
        await query(`
            SELECT

                DATE(created_at) AS date,

                COALESCE(
                SUM(characters_used),
                0
                ) AS characters_used,

                COALESCE(
                SUM(request_count),
                0
                ) AS request_count

            FROM usage_records

            WHERE created_at >=
                CURRENT_DATE - INTERVAL '6 days'

            GROUP BY DATE(created_at)

            ORDER BY date ASC
        `);


    return result.rows;
};


/*
|--------------------------------------------------------------------------
| Speech Analytics
|--------------------------------------------------------------------------
*/
export const getSpeechAnalytics = async () => {

    const result =
        await query(`
            SELECT

                DATE(created_at) AS date,

                COUNT(*) AS speech_count

            FROM speech_history

            WHERE created_at >=
                CURRENT_DATE - INTERVAL '29 days'

            GROUP BY DATE(created_at)

            ORDER BY date ASC
        `);


    return result.rows;
};