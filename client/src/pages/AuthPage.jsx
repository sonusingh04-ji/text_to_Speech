import React, {
    useEffect,
    useState
} from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    GoogleLogin
} from "@react-oauth/google";

import {
    useAuth
} from "../context/AuthContext.jsx";

import {
    forgotPassword
} from "../services/authService.js";


/*
|--------------------------------------------------------------------------
| Small Icon
|--------------------------------------------------------------------------
*/

const Icon = ({
                  name,
                  size = 18
              }) => {

    const props = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true
    };

    switch (name) {

        case "mail":
            return (
                <svg {...props}>
                    <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                    />
                    <path d="m3 7 9 6 9-6" />
                </svg>
            );

        case "lock":
            return (
                <svg {...props}>
                    <rect
                        x="4"
                        y="10"
                        width="16"
                        height="10"
                        rx="2"
                    />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
            );

        case "user":
            return (
                <svg {...props}>
                    <circle
                        cx="12"
                        cy="8"
                        r="3.5"
                    />
                    <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
            );

        case "eye":
            return (
                <svg {...props}>
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                    />
                </svg>
            );

        case "eye-off":
            return (
                <svg {...props}>
                    <path d="m3 3 18 18" />
                    <path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a18 18 0 0 1-3.1 3.7" />
                    <path d="M6.2 6.7C3.8 8.3 2.5 12 2.5 12s3.5 6 9.5 6c1.3 0 2.4-.2 3.5-.7" />
                </svg>
            );

        case "arrow":
            return (
                <svg {...props}>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                </svg>
            );

        case "shield":
            return (
                <svg {...props}>
                    <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
            );

        case "sparkles":
            return (
                <svg {...props}>
                    <path d="M12 3l1.25 4.75L18 9l-4.75 1.25L12 15l-1.25-4.75L6 9l4.75-1.25L12 3Z" />
                    <path d="m19 14 .65 2.35L22 17l-2.35.65L19 20l-.65-2.35L16 17l2.35-.65L19 14Z" />
                    <path d="m5 14 .5 1.5L7 16l-1.5.5L5 18l-.5-1.5L3 16l1.5-.5L5 14Z" />
                </svg>
            );

        case "check":
            return (
                <svg {...props}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );

        case "key":
            return (
                <svg {...props}>
                    <circle
                        cx="8"
                        cy="15"
                        r="4"
                    />
                    <path d="m11 12 8-8" />
                    <path d="m16 7 2 2" />
                    <path d="m18 5 1 1" />
                </svg>
            );

        default:
            return null;
    }
};


/*
|--------------------------------------------------------------------------
| Auth Page
|--------------------------------------------------------------------------
*/

const AuthPage = () => {

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        user,
        loading: authLoading,
        login,
        register,
        googleLogin
    } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | Current route
    |--------------------------------------------------------------------------
    */

    const isForgotRoute =
        location.pathname ===
        "/forgot-password";


    const [
        mode,
        setMode
    ] = useState(
        isForgotRoute
            ? "forgot"
            : "login"
    );


    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const [
        formData,
        setFormData
    ] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });


    const [
        showPassword,
        setShowPassword
    ] = useState(false);


    const [
        showConfirmPassword,
        setShowConfirmPassword
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Redirect authenticated user
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (user) {
            navigate(
                "/dashboard",
                {
                    replace: true
                }
            );
        }

    }, [
        user,
        navigate
    ]);


    /*
    |--------------------------------------------------------------------------
    | Sync route with mode
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (
            location.pathname ===
            "/forgot-password"
        ) {

            setMode(
                "forgot"
            );

        } else if (
            location.pathname ===
            "/register"
        ) {

            setMode(
                "register"
            );

        } else if (
            location.pathname ===
            "/login"
        ) {

            setMode(
                "login"
            );
        }

        setError("");
        setSuccess("");

    }, [
        location.pathname
    ]);


    /*
    |--------------------------------------------------------------------------
    | Change handler
    |--------------------------------------------------------------------------
    */

    const handleChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setFormData(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );


        setError("");
        setSuccess("");
    };


    /*
    |--------------------------------------------------------------------------
    | Switch mode
    |--------------------------------------------------------------------------
    */

    const switchMode = (
        newMode
    ) => {

        setError("");
        setSuccess("");


        setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        });


        setShowPassword(
            false
        );

        setShowConfirmPassword(
            false
        );


        setMode(
            newMode
        );


        if (
            newMode ===
            "login"
        ) {

            navigate(
                "/login"
            );

        } else if (
            newMode ===
            "register"
        ) {

            navigate(
                "/register"
            );

        } else if (
            newMode ===
            "forgot"
        ) {

            navigate(
                "/forgot-password"
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    const validateEmail = (
        email
    ) => {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );
    };


    const validatePassword = (
        password
    ) => {

        return password.length >= 6;
    };


    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    const handleLogin = async () => {

        const email =
            formData.email.trim();

        const password =
            formData.password;


        if (
            !email ||
            !password
        ) {

            setError(
                "Please enter your email and password."
            );

            return;
        }


        if (
            !validateEmail(
                email
            )
        ) {

            setError(
                "Please enter a valid email address."
            );

            return;
        }


        setLoading(true);
        setError("");
        setSuccess("");


        try {

            await login({
                email,
                password
            });


            navigate(
                "/dashboard",
                {
                    replace: true
                }
            );

        } catch (
            err
            ) {

            setError(
                err?.message ||
                err?.response
                    ?.data
                    ?.message ||
                "Login failed. Please check your credentials."
            );

        } finally {

            setLoading(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Register
    |--------------------------------------------------------------------------
    */

    const handleRegister =
        async () => {

            const name =
                formData.name.trim();

            const email =
                formData.email.trim();

            const password =
                formData.password;

            const confirmPassword =
                formData.confirmPassword;


            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                setError(
                    "Please fill in all fields."
                );

                return;
            }


            if (
                name.length < 2
            ) {

                setError(
                    "Name must contain at least 2 characters."
                );

                return;
            }


            if (
                !validateEmail(
                    email
                )
            ) {

                setError(
                    "Please enter a valid email address."
                );

                return;
            }


            if (
                !validatePassword(
                    password
                )
            ) {

                setError(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            if (
                password !==
                confirmPassword
            ) {

                setError(
                    "Passwords do not match."
                );

                return;
            }


            setLoading(true);
            setError("");
            setSuccess("");


            try {

                await register({
                    name,
                    email,
                    password
                });


                setFormData({
                    name: "",
                    email,
                    password: "",
                    confirmPassword: ""
                });


                setSuccess(
                    "Account created successfully. Please login with your new account."
                );


                setTimeout(
                    () => {

                        navigate(
                            "/login",
                            {
                                replace: true
                            }
                        );

                    },
                    1000
                );

            } catch (
                err
                ) {

                setError(
                    err?.message ||
                    err?.response
                        ?.data
                        ?.message ||
                    "Registration failed. Please try again."
                );

            } finally {

                setLoading(false);
            }
        };


    /*
    |--------------------------------------------------------------------------
    | Google login
    |--------------------------------------------------------------------------
    */

    const handleGoogleSuccess =
        async (
            credentialResponse
        ) => {

            const credential =
                credentialResponse?.credential;


            if (
                !credential
            ) {

                setError(
                    "Google Sign-In did not return a valid credential."
                );

                return;
            }


            setLoading(true);
            setError("");
            setSuccess("");


            try {

                await googleLogin(
                    credential
                );


                navigate(
                    "/dashboard",
                    {
                        replace: true
                    }
                );

            } catch (
                err
                ) {

                setError(
                    err?.message ||
                    err?.response
                        ?.data
                        ?.message ||
                    "Google Sign-In failed. Please try again."
                );

            } finally {

                setLoading(false);
            }
        };


    const handleGoogleError = () => {

        setError(
            "Google Sign-In failed. Please try again."
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Forgot password
    |--------------------------------------------------------------------------
    */

    const handleForgotPassword =
        async () => {

            const email =
                formData.email.trim();


            if (
                !email
            ) {

                setError(
                    "Please enter your email address."
                );

                return;
            }


            if (
                !validateEmail(
                    email
                )
            ) {

                setError(
                    "Please enter a valid email address."
                );

                return;
            }


            setLoading(true);
            setError("");
            setSuccess("");


            try {

                const response =
                    await forgotPassword(
                        email
                    );


                /*
                 * Development mode:
                 * backend can return a token directly
                 * when email delivery is not configured.
                 */

                const developmentResetToken =
                    response
                        ?.data
                        ?.developmentResetToken;


                if (
                    developmentResetToken
                ) {

                    sessionStorage.setItem(
                        "tts_development_reset_token",
                        developmentResetToken
                    );


                    sessionStorage.setItem(
                        "tts_reset_email",
                        email
                    );


                    setSuccess(
                        "Password reset token generated. Opening reset password page..."
                    );


                    setTimeout(
                        () => {

                            navigate(
                                "/reset-password"
                            );

                        },
                        700
                    );


                    return;
                }


                setSuccess(
                    response?.message ||
                    "If this email exists, password reset instructions have been sent."
                );

            } catch (
                err
                ) {

                setError(
                    err?.message ||
                    err?.response
                        ?.data
                        ?.message ||
                    "Unable to process the password reset request."
                );

            } finally {

                setLoading(false);
            }
        };


    /*
    |--------------------------------------------------------------------------
    | Password input
    |--------------------------------------------------------------------------
    */

    const renderPasswordInput = ({
                                     name,
                                     value,
                                     placeholder,
                                     show,
                                     setShow
                                 }) => {

        return (
            <div className="relative">

                <input
                    type={
                        show
                            ? "text"
                            : "password"
                    }
                    name={name}
                    value={value}
                    onChange={
                        handleChange
                    }
                    placeholder={
                        placeholder
                    }
                    autoComplete="current-password"
                    className="
                        vs-input
                        pr-12
                    "
                    disabled={
                        loading ||
                        authLoading
                    }
                />

                <button
                    type="button"
                    onClick={() =>
                        setShow(
                            (previous) =>
                                !previous
                        )
                    }
                    className="
                        absolute
                        right-3
                        top-1/2
                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-lg
                        text-slate-500
                        transition
                        hover:bg-white/[0.04]
                        hover:text-indigo-300
                    "
                    disabled={
                        loading ||
                        authLoading
                    }
                    aria-label={
                        show
                            ? "Hide password"
                            : "Show password"
                    }
                >
                    <Icon
                        name={
                            show
                                ? "eye-off"
                                : "eye"
                        }
                        size={16}
                    />
                </button>

            </div>
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Header
    |--------------------------------------------------------------------------
    */

    const getHeader = () => {

        if (
            mode ===
            "login"
        ) {

            return {
                eyebrow: "Welcome back",
                title: "Sign in to your workspace",
                subtitle:
                    "Continue creating natural, studio-quality speech."
            };
        }


        if (
            mode ===
            "register"
        ) {

            return {
                eyebrow: "Get started",
                title: "Create your account",
                subtitle:
                    "Build, enhance, translate, and generate speech with AI."
            };
        }


        return {
            eyebrow: "Account recovery",
            title: "Forgot your password?",
            subtitle:
                "Enter your email to start the password recovery process."
        };
    };


    const header =
        getHeader();


    const googleClientId =
        import.meta.env
            .VITE_GOOGLE_CLIENT_ID;


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <main
            className="
                vs-auth-shell
                bg-transparent
                text-white
            "
        >

            {/* Ambient background */}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    overflow-hidden
                "
            >

                <div
                    className="
                        absolute
                        left-[4%]
                        top-[8%]
                        h-80
                        w-80
                        rounded-full
                        bg-indigo-600/[0.07]
                        blur-3xl
                    "
                />

                <div
                    className="
                        absolute
                        right-[5%]
                        top-[20%]
                        h-72
                        w-72
                        rounded-full
                        bg-violet-500/[0.06]
                        blur-3xl
                    "
                />

                <div
                    className="
                        absolute
                        bottom-[5%]
                        left-[42%]
                        h-64
                        w-64
                        rounded-full
                        bg-cyan-400/[0.035]
                        blur-3xl
                    "
                />

            </div>


            <div
                className="
                    relative
                    z-10
                    grid
                    w-full
                    max-w-6xl
                    overflow-hidden
                    rounded-[30px]
                    border
                    border-white/[0.07]
                    bg-slate-950/30
                    shadow-[0_35px_110px_rgba(0,0,0,0.42)]
                    backdrop-blur-xl
                    lg:grid-cols-[1.02fr_0.98fr]
                "
            >

                {/* ============================================================ */}
                {/* BRAND PANEL */}
                {/* ============================================================ */}

                <section
                    className="
                        relative
                        hidden
                        min-h-[700px]
                        overflow-hidden
                        border-r
                        border-white/[0.06]
                        bg-slate-950/50
                        p-10
                        lg:flex
                        lg:flex-col
                        lg:justify-between
                        xl:p-12
                    "
                >

                    <div
                        className="
                            pointer-events-none
                            absolute
                            inset-0
                            bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.13),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(139,92,246,0.08),transparent_32%)]
                        "
                    />

                    <div className="relative">

                        {/* Brand */}

                        <Link
                            to="/login"
                            className="inline-flex items-center gap-3"
                        >

                            <div className="vs-auth-logo">

                                <Icon
                                    name="sparkles"
                                    size={23}
                                />

                            </div>

                            <div>

                                <p className="text-base font-extrabold tracking-tight text-white">
                                    Voice Studio
                                </p>

                                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                                    AI Text-to-Speech
                                </p>

                            </div>

                        </Link>

                    </div>


                    <div className="relative max-w-lg">

                        <span className="vs-badge">
                            <span className="vs-status-dot" />
                            AI Voice Platform
                        </span>

                        <h1 className="mt-6 text-4xl font-extrabold leading-[1.06] tracking-[-0.04em] text-white xl:text-5xl">

                            Turn your words into{" "}

                            <span className="vs-gradient-text">
                                natural voice.
                            </span>

                        </h1>

                        <p className="mt-6 max-w-xl text-sm leading-7 text-slate-500">
                            Create speech, translate content, enhance
                            scripts with AI, upload documents, and manage
                            your complete voice library from one intelligent
                            workspace.
                        </p>


                        {/* Feature grid */}

                        <div className="mt-8 grid grid-cols-2 gap-3">

                            {[
                                {
                                    title: "30+",
                                    text: "Languages"
                                },
                                {
                                    title: "AI",
                                    text: "Text tools"
                                },
                                {
                                    title: "Cloud",
                                    text: "Audio storage"
                                },
                                {
                                    title: "Secure",
                                    text: "Authentication"
                                }
                            ].map(
                                (
                                    item
                                ) => (
                                    <div
                                        key={
                                            item.text
                                        }
                                        className="
                                            rounded-2xl
                                            border
                                            border-white/[0.06]
                                            bg-white/[0.025]
                                            p-4
                                        "
                                    >

                                        <p className="text-lg font-extrabold text-white">
                                            {item.title}
                                        </p>

                                        <p className="mt-1 text-[11px] text-slate-600">
                                            {item.text}
                                        </p>

                                    </div>
                                )
                            )}

                        </div>

                    </div>


                    <div className="relative">

                        <div className="vs-divider" />

                        <div className="mt-5 flex items-center gap-2 text-[10px] text-slate-600">

                            <Icon
                                name="shield"
                                size={13}
                            />

                            Secure authentication

                            <span className="text-slate-800">
                                •
                            </span>

                            Private workspace

                        </div>

                    </div>

                </section>


                {/* ============================================================ */}
                {/* FORM PANEL */}
                {/* ============================================================ */}

                <section
                    className="
                        flex
                        min-h-[700px]
                        items-center
                        justify-center
                        bg-slate-950/35
                        px-5
                        py-8
                        sm:px-8
                        lg:px-10
                        xl:px-14
                    "
                >

                    <div className="w-full max-w-md">

                        {/* Mobile brand */}

                        <div className="mb-8 lg:hidden">

                            <Link
                                to="/login"
                                className="inline-flex items-center gap-3"
                            >

                                <div className="vs-auth-logo">

                                    <Icon
                                        name="sparkles"
                                        size={21}
                                    />

                                </div>

                                <div>

                                    <p className="font-extrabold text-white">
                                        Voice Studio
                                    </p>

                                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
                                        AI Text-to-Speech
                                    </p>

                                </div>

                            </Link>

                        </div>


                        {/* Auth card */}

                        <div className="vs-auth-card">

                            {/* Header */}

                            <div className="mb-7">

                                <p className="vs-eyebrow">
                                    <Icon
                                        name={
                                            mode ===
                                            "forgot"
                                                ? "key"
                                                : "sparkles"
                                        }
                                        size={13}
                                    />

                                    {header.eyebrow}
                                </p>

                                <h2 className="mt-3 text-[clamp(1.7rem,4vw,2.2rem)] font-extrabold leading-tight tracking-[-0.035em] text-white">
                                    {header.title}
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {header.subtitle}
                                </p>

                            </div>


                            {/* Login/register switch */}

                            {mode !== "forgot" && (
                                <div className="vs-tabs mb-7">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            switchMode(
                                                "login"
                                            )
                                        }
                                        className={`
                                            vs-tab
                                            flex-1
                                            ${
                                            mode ===
                                            "login"
                                                ? "vs-tab-active"
                                                : ""
                                        }
                                        `}
                                    >
                                        Sign In
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            switchMode(
                                                "register"
                                            )
                                        }
                                        className={`
                                            vs-tab
                                            flex-1
                                            ${
                                            mode ===
                                            "register"
                                                ? "vs-tab-active"
                                                : ""
                                        }
                                        `}
                                    >
                                        Create Account
                                    </button>

                                </div>
                            )}


                            {/* Messages */}

                            {error && (
                                <div className="vs-alert vs-alert-error mb-5">

                                    <div
                                        className="
                                            flex
                                            h-6
                                            w-6
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-rose-500/10
                                            text-xs
                                            font-bold
                                            text-rose-300
                                        "
                                    >
                                        !
                                    </div>

                                    <p>
                                        {error}
                                    </p>

                                </div>
                            )}


                            {success && (
                                <div className="vs-alert vs-alert-success mb-5">

                                    <div
                                        className="
                                            flex
                                            h-6
                                            w-6
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-emerald-500/10
                                            text-emerald-300
                                        "
                                    >
                                        <Icon
                                            name="check"
                                            size={13}
                                        />
                                    </div>

                                    <p>
                                        {success}
                                    </p>

                                </div>
                            )}


                            {/* ================================================== */}
                            {/* LOGIN */}
                            {/* ================================================== */}

                            {mode === "login" && (
                                <div className="space-y-5">

                                    <div>

                                        <label className="vs-label">
                                            Email Address
                                        </label>

                                        <div className="relative">

                                            <span
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    left-3.5
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-600
                                                "
                                            >
                                                <Icon
                                                    name="mail"
                                                    size={16}
                                                />
                                            </span>

                                            <input
                                                type="email"
                                                name="email"
                                                value={
                                                    formData.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                className="vs-input pl-11"
                                                disabled={
                                                    loading ||
                                                    authLoading
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div>

                                        <div className="mb-2 flex items-center justify-between">

                                            <label className="vs-label mb-0">
                                                Password
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    switchMode(
                                                        "forgot"
                                                    )
                                                }
                                                className="
                                                    text-[11px]
                                                    font-semibold
                                                    text-indigo-300
                                                    transition
                                                    hover:text-indigo-200
                                                "
                                            >
                                                Forgot password?
                                            </button>

                                        </div>

                                        <div className="relative">

                                            <span
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    left-3.5
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-600
                                                "
                                            >
                                                <Icon
                                                    name="lock"
                                                    size={16}
                                                />
                                            </span>

                                            <div className="[&_.vs-input]:pl-11">
                                                {renderPasswordInput(
                                                    {
                                                        name:
                                                            "password",
                                                        value:
                                                        formData.password,
                                                        placeholder:
                                                            "Enter your password",
                                                        show:
                                                        showPassword,
                                                        setShow:
                                                        setShowPassword
                                                    }
                                                )}
                                            </div>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            handleLogin
                                        }
                                        disabled={
                                            loading ||
                                            authLoading
                                        }
                                        className="vs-primary-button w-full !rounded-2xl !py-3.5"
                                    >

                                        {loading ? (
                                            <>
                                                <span
                                                    className="
                                                        h-4
                                                        w-4
                                                        animate-spin
                                                        rounded-full
                                                        border-2
                                                        border-white/25
                                                        border-t-white
                                                    "
                                                />

                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In

                                                <Icon
                                                    name="arrow"
                                                    size={16}
                                                />
                                            </>
                                        )}

                                    </button>


                                    {googleClientId && (
                                        <>
                                            <div className="flex items-center gap-3 py-1">

                                                <div className="vs-divider flex-1" />

                                                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                                                    Or continue with
                                                </span>

                                                <div className="vs-divider flex-1" />

                                            </div>

                                            <div className="flex justify-center overflow-hidden rounded-xl">

                                                <GoogleLogin
                                                    onSuccess={
                                                        handleGoogleSuccess
                                                    }
                                                    onError={
                                                        handleGoogleError
                                                    }
                                                    width="350"
                                                    text="signin_with"
                                                    shape="rectangular"
                                                    theme="filled_black"
                                                    size="large"
                                                />

                                            </div>
                                        </>
                                    )}

                                </div>
                            )}


                            {/* ================================================== */}
                            {/* REGISTER */}
                            {/* ================================================== */}

                            {mode === "register" && (
                                <div className="space-y-5">

                                    <div>

                                        <label className="vs-label">
                                            Full Name
                                        </label>

                                        <div className="relative">

                                            <span
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    left-3.5
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-600
                                                "
                                            >
                                                <Icon
                                                    name="user"
                                                    size={16}
                                                />
                                            </span>

                                            <input
                                                type="text"
                                                name="name"
                                                value={
                                                    formData.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter your full name"
                                                autoComplete="name"
                                                className="vs-input pl-11"
                                                disabled={
                                                    loading ||
                                                    authLoading
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div>

                                        <label className="vs-label">
                                            Email Address
                                        </label>

                                        <div className="relative">

                                            <span
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    left-3.5
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-600
                                                "
                                            >
                                                <Icon
                                                    name="mail"
                                                    size={16}
                                                />
                                            </span>

                                            <input
                                                type="email"
                                                name="email"
                                                value={
                                                    formData.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                className="vs-input pl-11"
                                                disabled={
                                                    loading ||
                                                    authLoading
                                                }
                                            />

                                        </div>

                                    </div>


                                    <div>

                                        <label className="vs-label">
                                            Password
                                        </label>

                                        <div className="relative">

                                            <span
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    left-3.5
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-600
                                                "
                                            >
                                                <Icon
                                                    name="lock"
                                                    size={16}
                                                />
                                            </span>

                                            <div className="[&_.vs-input]:pl-11">
                                                {renderPasswordInput(
                                                    {
                                                        name:
                                                            "password",
                                                        value:
                                                        formData.password,
                                                        placeholder:
                                                            "Create a password",
                                                        show:
                                                        showPassword,
                                                        setShow:
                                                        setShowPassword
                                                    }
                                                )}
                                            </div>

                                        </div>

                                        <p className="vs-help">
                                            Use at least 6 characters.
                                        </p>

                                    </div>


                                    <div>

                                        <label className="vs-label">
                                            Confirm Password
                                        </label>

                                        <div className="relative">

                                            <span
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    left-3.5
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-600
                                                "
                                            >
                                                <Icon
                                                    name="lock"
                                                    size={16}
                                                />
                                            </span>

                                            <div className="[&_.vs-input]:pl-11">
                                                {renderPasswordInput(
                                                    {
                                                        name:
                                                            "confirmPassword",
                                                        value:
                                                        formData.confirmPassword,
                                                        placeholder:
                                                            "Confirm your password",
                                                        show:
                                                        showConfirmPassword,
                                                        setShow:
                                                        setShowConfirmPassword
                                                    }
                                                )}
                                            </div>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            handleRegister
                                        }
                                        disabled={
                                            loading ||
                                            authLoading
                                        }
                                        className="vs-primary-button w-full !rounded-2xl !py-3.5"
                                    >

                                        {loading ? (
                                            <>
                                                <span
                                                    className="
                                                        h-4
                                                        w-4
                                                        animate-spin
                                                        rounded-full
                                                        border-2
                                                        border-white/25
                                                        border-t-white
                                                    "
                                                />

                                                Creating account...
                                            </>
                                        ) : (
                                            <>
                                                Create Account

                                                <Icon
                                                    name="arrow"
                                                    size={16}
                                                />
                                            </>
                                        )}

                                    </button>


                                    {googleClientId && (
                                        <>
                                            <div className="flex items-center gap-3 py-1">

                                                <div className="vs-divider flex-1" />

                                                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                                                    Or continue with
                                                </span>

                                                <div className="vs-divider flex-1" />

                                            </div>

                                            <div className="flex justify-center overflow-hidden rounded-xl">

                                                <GoogleLogin
                                                    onSuccess={
                                                        handleGoogleSuccess
                                                    }
                                                    onError={
                                                        handleGoogleError
                                                    }
                                                    width="350"
                                                    text="signup_with"
                                                    shape="rectangular"
                                                    theme="filled_black"
                                                    size="large"
                                                />

                                            </div>
                                        </>
                                    )}

                                </div>
                            )}


                            {/* ================================================== */}
                            {/* FORGOT PASSWORD */}
                            {/* ================================================== */}

                            {mode === "forgot" && (
                                <div className="space-y-5">

                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-indigo-400/10
                                            bg-indigo-500/[0.045]
                                            p-4
                                        "
                                    >

                                        <div className="flex items-start gap-3">

                                            <div
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    border
                                                    border-indigo-400/10
                                                    bg-indigo-500/[0.08]
                                                    text-indigo-300
                                                "
                                            >
                                                <Icon
                                                    name="key"
                                                    size={16}
                                                />
                                            </div>

                                            <p className="text-xs leading-5 text-slate-500">
                                                Enter your registered email
                                                address and we'll start the
                                                password recovery process.
                                            </p>

                                        </div>

                                    </div>


                                    <div>

                                        <label className="vs-label">
                                            Email Address
                                        </label>

                                        <div className="relative">

                                            <span
                                                className="
                                                    pointer-events-none
                                                    absolute
                                                    left-3.5
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-600
                                                "
                                            >
                                                <Icon
                                                    name="mail"
                                                    size={16}
                                                />
                                            </span>

                                            <input
                                                type="email"
                                                name="email"
                                                value={
                                                    formData.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter your registered email"
                                                autoComplete="email"
                                                className="vs-input pl-11"
                                                disabled={
                                                    loading ||
                                                    authLoading
                                                }
                                            />

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            handleForgotPassword
                                        }
                                        disabled={
                                            loading ||
                                            authLoading
                                        }
                                        className="vs-primary-button w-full !rounded-2xl !py-3.5"
                                    >

                                        {loading ? (
                                            <>
                                                <span
                                                    className="
                                                        h-4
                                                        w-4
                                                        animate-spin
                                                        rounded-full
                                                        border-2
                                                        border-white/25
                                                        border-t-white
                                                    "
                                                />

                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Send Reset Request

                                                <Icon
                                                    name="arrow"
                                                    size={16}
                                                />
                                            </>
                                        )}

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            switchMode(
                                                "login"
                                            )
                                        }
                                        className="
                                            vs-secondary-button
                                            w-full
                                        "
                                    >
                                        Back to Sign In
                                    </button>

                                </div>
                            )}


                            {/* Footer */}

                            <div className="mt-7 border-t border-white/[0.055] pt-6 text-center">

                                {mode === "login" && (
                                    <p className="text-xs text-slate-600">

                                        Don't have an account?{" "}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                switchMode(
                                                    "register"
                                                )
                                            }
                                            className="
                                                font-semibold
                                                text-indigo-300
                                                transition
                                                hover:text-indigo-200
                                            "
                                        >
                                            Create one
                                        </button>

                                    </p>
                                )}


                                {mode === "register" && (
                                    <p className="text-xs text-slate-600">

                                        Already have an account?{" "}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                switchMode(
                                                    "login"
                                                )
                                            }
                                            className="
                                                font-semibold
                                                text-indigo-300
                                                transition
                                                hover:text-indigo-200
                                            "
                                        >
                                            Sign in
                                        </button>

                                    </p>
                                )}


                                {mode === "forgot" && (
                                    <p className="text-xs text-slate-600">

                                        Remember your password?{" "}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                switchMode(
                                                    "login"
                                                )
                                            }
                                            className="
                                                font-semibold
                                                text-indigo-300
                                                transition
                                                hover:text-indigo-200
                                            "
                                        >
                                            Sign in
                                        </button>

                                    </p>
                                )}

                            </div>

                        </div>


                        {/* Secure footer */}

                        <div
                            className="
                                mt-5
                                flex
                                items-center
                                justify-center
                                gap-2
                                text-[10px]
                                text-slate-700
                            "
                        >

                            <Icon
                                name="shield"
                                size={12}
                            />

                            Protected authentication

                            <span>
                                •
                            </span>

                            Voice Studio

                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
};


export default AuthPage;