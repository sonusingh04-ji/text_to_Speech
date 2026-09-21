import api from "./api.js";


/*
|--------------------------------------------------------------------------
| Upload File
|--------------------------------------------------------------------------
*/
export const uploadFile =
    async (
        file
    ) => {

        const formData =
            new FormData();


        formData.append(
            "file",
            file
        );


        const response =
            await api.post(
                "/api/files/upload",
                formData
            );


        return response.data;
    };


/*
|--------------------------------------------------------------------------
| Get My Files
|--------------------------------------------------------------------------
*/
export const getFiles =
    async () => {

        const response =
            await api.get(
                "/api/files"
            );


        return response.data;
    };


/*
|--------------------------------------------------------------------------
| Get Single File
|--------------------------------------------------------------------------
*/
export const getFileById =
    async (
        fileId
    ) => {

        const response =
            await api.get(
                `/api/files/${fileId}`
            );


        return response.data;
    };


/*
|--------------------------------------------------------------------------
| Delete File
|--------------------------------------------------------------------------
*/
export const deleteFile =
    async (
        fileId
    ) => {

        const response =
            await api.delete(
                `/api/files/${fileId}`
            );


        return response.data;
    };