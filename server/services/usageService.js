import "dotenv/config";

import {
    query
} from "../config/database.js";


/*
|--------------------------------------------------------------------------
| Configuration Helpers
|--------------------------------------------------------------------------
|
| The values are read from environment variables at runtime.
|
|--------------------------------------------------------------------------
*/

const getDailyCharacterLimit = () => {
    const configuredValue =
        Number(
            process.env.DAILY_CHARACTER_LIMIT
        );

    if (
        Number.isFinite(
            configuredValue
        ) &&
        configuredValue > 0
    ) {
        return configuredValue;
    }

    return 2000000;
};


const getDailyRequestLimit = () => {
    const configuredValue =
        Number(
            process.env.DAILY_REQUEST_LIMIT
        );

    if (
        Number.isFinite(
            configuredValue
        ) &&
        configuredValue > 0
    ) {
        return configuredValue;
    }

    return 2000;
};


/*
|--------------------------------------------------------------------------
| Get Today's Usage
|--------------------------------------------------------------------------
*/
export const getTodayUsage = async (
    userId
) => {

    const result =
        await query(
            `
                SELECT
                    COALESCE(
                            SUM(characters_used),
                            0
                    )::INTEGER
                    AS characters_used,

                    COALESCE(
                            SUM(request_count),
                            0
                    )::INTEGER
                    AS request_count

                FROM usage_records

                WHERE user_id = $1

                  AND created_at >= CURRENT_DATE

                  AND created_at <
                      CURRENT_DATE +
                    INTERVAL '1 day'
            `,
            [userId]
        );


    return {
        charactersUsed:
            Number(
                result.rows[0]
                    .characters_used
            ),

        requestCount:
            Number(
                result.rows[0]
                    .request_count
            )
    };
};


/*
|--------------------------------------------------------------------------
| Check Usage Limit
|--------------------------------------------------------------------------
*/
export const checkUsageLimit = async ({
                                          userId,
                                          charactersToUse
                                      }) => {

    const usage =
        await getTodayUsage(
            userId
        );


    const dailyCharacterLimit =
        getDailyCharacterLimit();


    const dailyRequestLimit =
        getDailyRequestLimit();


    const requestedCharacters =
        Number(
            charactersToUse
        ) || 0;


    const projectedCharacters =
        usage.charactersUsed +
        requestedCharacters;


    const projectedRequests =
        usage.requestCount +
        1;


    const charactersExceeded =
        projectedCharacters >
        dailyCharacterLimit;


    const requestsExceeded =
        projectedRequests >
        dailyRequestLimit;


    /*
    |--------------------------------------------------------------------------
    | Reject request
    |--------------------------------------------------------------------------
    */
    if (
        charactersExceeded ||
        requestsExceeded
    ) {

        const charactersRemaining =
            Math.max(
                dailyCharacterLimit -
                usage.charactersUsed,
                0
            );


        const requestsRemaining =
            Math.max(
                dailyRequestLimit -
                usage.requestCount,
                0
            );


        let message =
            "Daily usage limit exceeded.";


        if (
            charactersExceeded
        ) {

            message =
                `This request exceeds your application quota of ${dailyCharacterLimit.toLocaleString()} characters. ` +
                `You have ${charactersRemaining.toLocaleString()} characters remaining, ` +
                `while ${requestedCharacters.toLocaleString()} characters are required for this request.`;

        } else if (
            requestsExceeded
        ) {

            message =
                `Daily request limit of ${dailyRequestLimit.toLocaleString()} requests has been exceeded.`;
        }


        const error =
            new Error(
                message
            );


        error.statusCode =
            429;


        error.code =
            "USAGE_LIMIT_EXCEEDED";


        error.details = {
            dailyCharacterLimit,

            dailyRequestLimit,

            charactersUsedToday:
            usage.charactersUsed,

            requestsUsedToday:
            usage.requestCount,

            charactersRequested:
            requestedCharacters,

            charactersRemaining,

            requestsRemaining
        };


        throw error;
    }


    /*
    |--------------------------------------------------------------------------
    | Allowed
    |--------------------------------------------------------------------------
    */
    return {
        allowed: true,

        usage,

        limits: {
            dailyCharacterLimit,

            dailyRequestLimit
        }
    };
};


/*
|--------------------------------------------------------------------------
| Record Successful Usage
|--------------------------------------------------------------------------
*/
export const recordUsage = async ({
                                      userId,
                                      charactersUsed
                                  }) => {

    const characterCount =
        Number(
            charactersUsed
        ) || 0;


    const result =
        await query(
            `
                INSERT INTO usage_records
                (
                    user_id,
                    characters_used,
                    request_count
                )

                VALUES (
                           $1,
                           $2,
                           $3
                       )

                    RETURNING
                id,
                user_id,
                characters_used,
                request_count,
                created_at
            `,
            [
                userId,
                characterCount,
                1
            ]
        );


    return result.rows[0];
};


/*
|--------------------------------------------------------------------------
| Get Usage Summary
|--------------------------------------------------------------------------
*/
export const getUsageSummary = async (
    userId
) => {

    const usage =
        await getTodayUsage(
            userId
        );


    const dailyCharacterLimit =
        getDailyCharacterLimit();


    const dailyRequestLimit =
        getDailyRequestLimit();


    return {
        date:
            new Date()
                .toISOString()
                .slice(0, 10),


        charactersUsed:
        usage.charactersUsed,


        charactersRemaining:
            Math.max(
                dailyCharacterLimit -
                usage.charactersUsed,
                0
            ),


        requestCount:
        usage.requestCount,


        requestsRemaining:
            Math.max(
                dailyRequestLimit -
                usage.requestCount,
                0
            ),


        limits: {
            dailyCharacterLimit,

            dailyRequestLimit
        }
    };
};