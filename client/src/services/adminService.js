import api from "./api.js";


/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/
export const getAdminDashboard = async () => {
    const response = await api.get(
        "/api/admin/dashboard"
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Admin Users
|--------------------------------------------------------------------------
*/
export const getAdminUsers = async () => {
    const response = await api.get(
        "/api/admin/users"
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Admin User Details
|--------------------------------------------------------------------------
*/
export const getAdminUserById = async (
    userId
) => {
    const response = await api.get(
        `/api/admin/users/${userId}`
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Admin Analytics
|--------------------------------------------------------------------------
*/
export const getAdminAnalytics = async () => {
    const response = await api.get(
        "/api/admin/analytics"
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| Usage Analytics
|--------------------------------------------------------------------------
*/
export const getAdminUsageAnalytics = async () => {
    const response = await api.get(
        "/api/admin/analytics/usage"
    );

    return response.data;
};
export const deleteAdminUser = async (
    userId
) => {
    const response =
        await api.delete(
            `/api/admin/users/${userId}`
        );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| Speech Analytics
|--------------------------------------------------------------------------
*/
export const getAdminSpeechAnalytics = async () => {
    const response = await api.get(
        "/api/admin/analytics/speech"
    );

    return response.data;
};
export const createAdminUser = async ({
                                          name,
                                          email,
                                          password
                                      }) => {

    const response =
        await api.post(
            "/api/admin/users/admin",
            {
                name,
                email,
                password
            }
        );

    return response.data;
};
