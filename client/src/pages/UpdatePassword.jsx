import React, {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext.jsx";

import {
    updatePassword
} from "../services/authService.js";


/*
|--------------------------------------------------------------------------
| Icon
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

        case "check":
            return (
                <svg {...props}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );

        case "shield":
            return (
                <svg {...props}>
                    <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
            );

        case "arrow":
            return (
                <svg {...props}>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                </svg>
            );

        case "sparkles":
            return (
                <svg {...props}>
                    <path d="M12 3l1.25 4.75L18 9l-4.75 1.25L12 15l-1.25-4.75L6 9l4.75-1.25L12 3Z" />
                    <path d="m19 14 .65 2.35L22 17l-2.35.65L19 20l-.65-2.35L16 17l2.35-.65L19 14Z" />
                </svg>
            );

        default:
            return null;
    }
};


/*
|--------------------------------------------------------------------------
| Password Input
|--------------------------------------------------------------------------
*/

const PasswordInput = ({
                           name,
                           value,
                           onChange,
                           placeholder,
                           show,
                           setShow,
                           disabled
                       }) => {

    return (
        <div className="relative">

            <span
                className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    z-10
                    -translate-y-1/2
                    text-slate-600
                "
            >
                <Icon
                    name="lock"
                    size={16}
                />
            </span>

            <input
                type={
                    show
                        ? "text"
                        : "password"
                }
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete="current-password"
                className="
                    vs-input
                    pl-11
                    pr-12
                "
                disabled={disabled}
            />

            <button
                type="button"
                onClick={() =>
                    setShow(
                        previous =>
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
                disabled={disabled}
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
| Update Password
|--------------------------------------------------------------------------
*/

const UpdatePassword = () => {

    const navigate =
        useNavigate();

    const {
        user
    } = useAuth();


    const [
        currentPassword,
        setCurrentPassword
    ] = useState("");


    const [
        newPassword,
        setNewPassword
    ] = useState("");


    const [
        confirmPassword,
        setConfirmPassword
    ] = useState("");


    const [
        showCurrent,
        setShowCurrent
    ] = useState(false);


    const [
        showNew,
        setShowNew
    ] = useState(false);


    const [
        showConfirm,
        setShowConfirm
    ] = useState(false);


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
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async () => {

        setError("");
        setSuccess("");


        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            setError(
                "Please fill in all password fields."
            );

            return;
        }


        if (
            newPassword.length < 6
        ) {

            setError(
                "New password must contain at least 6 characters."
            );

            return;
        }


        if (
            newPassword !==
            confirmPassword
        ) {

            setError(
                "New passwords do not match."
            );

            return;
        }


        if (
            currentPassword ===
            newPassword
        ) {

            setError(
                "Your new password must be different from your current password."
            );

            return;
        }


        setLoading(true);


        try {

            await updatePassword(
                currentPassword,
                newPassword
            );


            setCurrentPassword(
                ""
            );

            setNewPassword(
                ""
            );

            setConfirmPassword(
                ""
            );


            setSuccess(
                "Password updated successfully."
            );

        } catch (
            err
            ) {

            setError(
                err?.response
                    ?.data
                    ?.message ||
                err?.message ||
                "Unable to update your password."
            );

        } finally {

            setLoading(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <main
            className="
                relative
                flex
                min-h-screen
                items-center
                justify-center
                overflow-hidden
                bg-transparent
                px-5
                py-10
                text-white
            "
        >

            {/* Background */}

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
                        left-[10%]
                        top-[12%]
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
                        right-[12%]
                        bottom-[10%]
                        h-72
                        w-72
                        rounded-full
                        bg-violet-500/[0.06]
                        blur-3xl
                    "
                />

            </div>


            <div
                className="
                    relative
                    z-10
                    w-full
                    max-w-lg
                "
            >

                {/* Header */}

                <div className="mb-7 text-center">

                    <div
                        className="
                            mx-auto
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-indigo-400/10
                            bg-indigo-500/[0.08]
                            text-indigo-300
                            shadow-[0_0_35px_rgba(99,102,241,0.12)]
                        "
                    >
                        <Icon
                            name="sparkles"
                            size={23}
                        />
                    </div>

                    <p className="mt-5 vs-eyebrow justify-center">
                        Account Security
                    </p>

                    <h1
                        className="
                            mt-3
                            text-2xl
                            font-extrabold
                            tracking-[-0.035em]
                            text-white
                        "
                    >
                        Change your password
                    </h1>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        Keep your Voice Studio account secure with a strong password.
                    </p>

                </div>


                {/* Card */}

                <div className="vs-auth-card">

                    {/* User */}

                    {user && (
                        <div
                            className="
                                mb-6
                                rounded-2xl
                                border
                                border-white/[0.055]
                                bg-white/[0.02]
                                p-4
                            "
                        >

                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-indigo-500/[0.08]
                                        text-sm
                                        font-bold
                                        text-indigo-300
                                    "
                                >
                                    {(
                                        user.name ||
                                        user.email ||
                                        "U"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="min-w-0">

                                    <p className="truncate text-sm font-semibold text-slate-300">
                                        {user.name ||
                                            "Your account"}
                                    </p>

                                    <p className="truncate text-[11px] text-slate-600">
                                        {user.email}
                                    </p>

                                </div>

                            </div>

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


                    {/* Form */}

                    <div className="space-y-5">

                        <div>

                            <label className="vs-label">
                                Current Password
                            </label>

                            <PasswordInput
                                name="currentPassword"
                                value={
                                    currentPassword
                                }
                                onChange={(event) => {

                                    setCurrentPassword(
                                        event.target.value
                                    );

                                    setError("");
                                    setSuccess("");

                                }}
                                placeholder="Enter your current password"
                                show={showCurrent}
                                setShow={setShowCurrent}
                                disabled={loading}
                            />

                        </div>


                        <div>

                            <label className="vs-label">
                                New Password
                            </label>

                            <PasswordInput
                                name="newPassword"
                                value={
                                    newPassword
                                }
                                onChange={(event) => {

                                    setNewPassword(
                                        event.target.value
                                    );

                                    setError("");
                                    setSuccess("");

                                }}
                                placeholder="Enter your new password"
                                show={showNew}
                                setShow={setShowNew}
                                disabled={loading}
                            />

                            <p className="vs-help">
                                Use at least 6 characters.
                            </p>

                        </div>


                        <div>

                            <label className="vs-label">
                                Confirm New Password
                            </label>

                            <PasswordInput
                                name="confirmPassword"
                                value={
                                    confirmPassword
                                }
                                onChange={(event) => {

                                    setConfirmPassword(
                                        event.target.value
                                    );

                                    setError("");
                                    setSuccess("");

                                }}
                                placeholder="Confirm your new password"
                                show={showConfirm}
                                setShow={setShowConfirm}
                                disabled={loading}
                            />

                        </div>


                        {/* Security panel */}

                        <div
                            className="
                                rounded-2xl
                                border
                                border-white/[0.055]
                                bg-white/[0.02]
                                p-4
                            "
                        >

                            <div className="flex items-start gap-3">

                                <div className="mt-0.5 text-emerald-300">

                                    <Icon
                                        name="shield"
                                        size={17}
                                    />

                                </div>

                                <div>

                                    <p className="text-xs font-semibold text-slate-300">
                                        Password security
                                    </p>

                                    <p className="mt-1 text-[11px] leading-5 text-slate-600">
                                        Never reuse your Voice Studio password
                                        on another service.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={
                                handleSubmit
                            }
                            disabled={
                                loading
                            }
                            className="
                                vs-primary-button
                                w-full
                                !rounded-2xl
                                !py-3.5
                            "
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

                                    Updating password...
                                </>
                            ) : (
                                <>
                                    Update Password

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
                                navigate(
                                    "/dashboard"
                                )
                            }
                            className="
                                vs-secondary-button
                                w-full
                            "
                            disabled={
                                loading
                            }
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </div>


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

                    Protected account security

                    <span>
                        •
                    </span>

                    Voice Studio

                </div>

            </div>

        </main>
    );
};


export default UpdatePassword;