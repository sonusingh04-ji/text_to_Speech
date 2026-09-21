import {
    getProfile,
    updateProfile,
    uploadProfilePhoto as saveProfilePhoto
} from "../services/profileService.js";


/*
|--------------------------------------------------------------------------
| Get Profile
|--------------------------------------------------------------------------
*/
export const getMyProfile = async (
    req,
    res,
    next
) => {

    try {

        const profile =
            await getProfile(
                req.user.id
            );


        return res.status(200).json({
            success: true,
            data: {
                profile
            }
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/
export const updateMyProfile = async (
    req,
    res,
    next
) => {

    try {

        const {
            name
        } = req.body || {};


        const profile =
            await updateProfile({
                userId:
                req.user.id,

                name
            });


        return res.status(200).json({
            success: true,
            message:
                "Profile updated successfully.",
            data: {
                profile
            }
        });

    } catch (error) {

        next(error);
    }
};


/*
|--------------------------------------------------------------------------
| Profile Photo
|--------------------------------------------------------------------------
*/
export const uploadMyProfilePhoto = async (
    req,
    res,
    next
) => {

    try {

        const profile =
            await saveProfilePhoto({
                userId:
                req.user.id,

                file:
                req.file
            });


        return res.status(200).json({
            success: true,
            message:
                "Profile photo updated successfully.",
            data: {
                profile
            }
        });

    } catch (error) {

        next(error);
    }
};