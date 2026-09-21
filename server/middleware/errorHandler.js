export const errorHandler = (
    err,
    req,
    res,
    next
) => {

    console.error(
        "ERROR:",
        {
            message:
            err.message,

            code:
            err.code,

            statusCode:
            err.statusCode,

            details:
            err.details
        }
    );


    const statusCode =
        Number(
            err.statusCode
        ) || 500;


    return res
        .status(statusCode)
        .json({
            success: false,

            message:
                err.message ||
                "Internal server error",

            code:
                err.code ||
                "INTERNAL_SERVER_ERROR",

            ...(err.details
                ? {
                    details:
                    err.details
                }
                : {})
        });
};