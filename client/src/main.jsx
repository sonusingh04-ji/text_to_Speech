import React from "react";
import ReactDOM from "react-dom/client";

import {
    BrowserRouter
} from "react-router-dom";

import {
    GoogleOAuthProvider
} from "@react-oauth/google";

import App from "./App.jsx";

import {
    AuthProvider
} from "./context/AuthContext.jsx";

import "./index.css";


/*
|--------------------------------------------------------------------------
| Google Client ID
|--------------------------------------------------------------------------
*/
const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();


/*
|--------------------------------------------------------------------------
| Application
|--------------------------------------------------------------------------
*/
const application = (
    <React.StrictMode>

        <BrowserRouter>

            <AuthProvider>

                <App />

            </AuthProvider>

        </BrowserRouter>

    </React.StrictMode>
);


/*
|--------------------------------------------------------------------------
| Google Provider
|--------------------------------------------------------------------------
*/
ReactDOM.createRoot(
    document.getElementById("root")
).render(

    googleClientId ? (

        <GoogleOAuthProvider
            clientId={
                googleClientId
            }
        >
            {application}
        </GoogleOAuthProvider>

    ) : (

        application

    )
);