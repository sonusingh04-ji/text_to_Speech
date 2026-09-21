import {
    getUsageSummary
} from "../services/usageService.js";


/*
|--------------------------------------------------------------------------
| Get Current User Usage
|--------------------------------------------------------------------------
*/
export const getUsage = async (
    req,
    res,
    next
) => {

    try {

        const usage =
            await getUsageSummary(
                req.user.id
            );


        return res
            .status(200)
            .json({
                success: true,

                usage
            });

    } catch (error) {

        next(error);
    }
};