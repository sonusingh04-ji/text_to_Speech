import {
    addFavorite,
    getFavoritesByUser,
    removeFavorite,
    isFavorite
} from "../services/favoriteService.js";

export const createFavorite = async (
    req,
    res,
    next
) => {
    try {
        const { historyId } = req.params;

        const favorite = await addFavorite({
            userId: req.user.id,
            historyId
        });

        return res.status(201).json({
            success: true,
            message: "Speech added to favorites",
            data: {
                favorite
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getMyFavorites = async (
    req,
    res,
    next
) => {
    try {
        const favorites =
            await getFavoritesByUser(
                req.user.id
            );

        return res.status(200).json({
            success: true,
            count: favorites.length,
            data: {
                favorites
            }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteFavorite = async (
    req,
    res,
    next
) => {
    try {
        const { historyId } = req.params;

        const deleted =
            await removeFavorite({
                userId: req.user.id,
                historyId
            });

        return res.status(200).json({
            success: true,
            message: "Favorite removed successfully",
            data: {
                id: deleted.id
            }
        });
    } catch (error) {
        next(error);
    }
};

export const checkFavorite = async (
    req,
    res,
    next
) => {
    try {
        const { historyId } = req.params;

        const favorite = await isFavorite({
            userId: req.user.id,
            historyId
        });

        return res.status(200).json({
            success: true,
            data: {
                isFavorite: favorite
            }
        });
    } catch (error) {
        next(error);
    }
};