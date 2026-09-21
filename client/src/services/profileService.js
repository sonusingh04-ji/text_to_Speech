import api from "./api.js";


/*
|--------------------------------------------------------------------------
| Get Profile
|--------------------------------------------------------------------------
*/
export const getProfile =
    async () => {

        const response =
            await api.get(
                "/api/profile"
            );

        return response.data;
    };


/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/
export const updateProfile =
    async ({
               name
           }) => {

        const response =
            await api.patch(
                "/api/profile",
                {
                    name
                }
            );

        return response.data;
    };


/*
|--------------------------------------------------------------------------
| Upload Profile Photo
|--------------------------------------------------------------------------
*/
export const uploadProfilePhoto =
    async (
        file
    ) => {

        const formData =
            new FormData();


        formData.append(
            "photo",
            file
        );


        const response =
            await api.post(
                "/api/profile/photo",
                formData
            );


        return response.data;
    };