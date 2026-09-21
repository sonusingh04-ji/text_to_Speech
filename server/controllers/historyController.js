import {
    getHistoryByUser,
    getHistoryById,
    deleteHistoryById
} from "../services/historyService.js";


/*
|--------------------------------------------------------------------------
| Get My History
|--------------------------------------------------------------------------
*/
export const getMyHistory = async (
    req,
    res,
    next
) => {
    try {
        const history =
            await getHistoryByUser(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            count: history.length,
            data: {
                history
            }
        });

    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Get One History Item
|--------------------------------------------------------------------------
*/
export const getHistoryItem = async (
    req,
    res,
    next
) => {
    try {
        const {
            id
        } = req.params;

        const history =
            await getHistoryById({
                userId: req.user.id,
                historyId: id
            });

        return res.status(200).json({
            success: true,
            data: {
                history
            }
        });

    } catch (error) {
        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Delete History Item
|--------------------------------------------------------------------------
*/
export const deleteHistoryItem = async (
    req,
    res,
    next
) => {
    try {
        const {
            id
        } = req.params;

        const deleted =
            await deleteHistoryById({
                userId: req.user.id,
                historyId: id
            });

        return res.status(200).json({
            success: true,
            message:
                "Speech history and associated audio deleted successfully",
            data: {
                id: deleted.id
            }
        });

    } catch (error) {
        next(error);
    }
};