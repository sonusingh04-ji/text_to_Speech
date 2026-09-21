import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext.jsx";

import {
    getProfile,
    updateProfile,
    uploadProfilePhoto
} from "../services/profileService.js";


/*
|--------------------------------------------------------------------------
| Icons
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


        case "shield":
            return (
                <svg {...props}>
                    <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
            );


        case "camera":
            return (
                <svg {...props}>
                    <path d="M4 8h3l1.5-2h7L17 8h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 8Z" />
                    <circle
                        cx="12"
                        cy="13.5"
                        r="3.5"
                    />
                </svg>
            );


        case "edit":
            return (
                <svg {...props}>
                    <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                    <path d="m13.5 7.5 3 3" />
                </svg>
            );


        case "check":
            return (
                <svg {...props}>
                    <path d="m5 12 4 4L19 6" />
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


        case "image":
            return (
                <svg {...props}>
                    <rect
                        x="3"
                        y="4"
                        width="18"
                        height="16"
                        rx="2"
                    />
                    <circle
                        cx="8.5"
                        cy="9"
                        r="1.5"
                    />
                    <path d="m3 17 5-5 4 4 3-3 6 6" />
                </svg>
            );


        default:
            return null;
    }
};


/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

const Profile = () => {

    const navigate =
        useNavigate();


    const {
        user,
        updateUser
    } = useAuth();


    const fileInputRef =
        useRef(null);


    const [
        profile,
        setProfile
    ] = useState(null);


    const [
        name,
        setName
    ] = useState(
        user?.name || ""
    );


    const [
        photo,
        setPhoto
    ] = useState(
        user?.profile_photo_url ||
        user?.profilePhotoUrl ||
        ""
    );


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        saving,
        setSaving
    ] = useState(false);


    const [
        uploading,
        setUploading
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
    | Load profile
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const loadProfile =
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError("");


                    const response =
                        await getProfile();


                    const profileData =
                        response?.data
                            ?.profile ||
                        response?.data;


                    if (
                        profileData
                    ) {

                        setProfile(
                            profileData
                        );


                        setName(
                            profileData.name ||
                            user?.name ||
                            ""
                        );


                        setPhoto(
                            profileData.profile_photo_url ||
                            profileData.profilePhotoUrl ||
                            user?.profile_photo_url ||
                            user?.profilePhotoUrl ||
                            ""
                        );
                    }

                } catch (
                    err
                    ) {

                    setError(
                        err?.response
                            ?.data
                            ?.message ||
                        err?.message ||
                        "Unable to load profile."
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            };


        loadProfile();

    }, [user]);


    /*
    |--------------------------------------------------------------------------
    | Open photo selector
    |--------------------------------------------------------------------------
    */

    const handlePhotoClick =
        () => {

            fileInputRef
                .current
                ?.click();
        };


    /*
    |--------------------------------------------------------------------------
    | Photo upload
    |--------------------------------------------------------------------------
    */

    const handlePhotoChange =
        async (
            event
        ) => {

            const file =
                event.target
                    ?.files?.[0];


            if (
                !file
            ) {
                return;
            }


            setError("");
            setSuccess("");


            /*
             * Frontend validation
             * matching current backend contract.
             */

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                setError(
                    "Please choose a JPG, PNG, or WEBP image."
                );


                if (
                    fileInputRef.current
                ) {

                    fileInputRef.current.value =
                        "";
                }


                return;
            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                setError(
                    "Profile photo must be smaller than 5 MB."
                );


                if (
                    fileInputRef.current
                ) {

                    fileInputRef.current.value =
                        "";
                }


                return;
            }


            try {

                setUploading(
                    true
                );


                const response =
                    await uploadProfilePhoto(
                        file
                    );


                const updatedProfile =
                    response?.data
                        ?.profile ||
                    response?.data;


                const photoUrl =
                    updatedProfile
                        ?.profile_photo_url ||
                    updatedProfile
                        ?.profilePhotoUrl ||
                    response?.data
                        ?.profile_photo_url ||
                    response?.data
                        ?.profilePhotoUrl;


                if (
                    photoUrl
                ) {

                    setPhoto(
                        photoUrl
                    );


                    updateUser({
                        profile_photo_url:
                        photoUrl,

                        profilePhotoUrl:
                        photoUrl
                    });
                }


                if (
                    updatedProfile
                ) {

                    setProfile(
                        updatedProfile
                    );


                    if (
                        updatedProfile.name
                    ) {

                        setName(
                            updatedProfile.name
                        );
                    }
                }


                setSuccess(
                    "Profile photo updated successfully."
                );

            } catch (
                err
                ) {

                setError(
                    err?.response
                        ?.data
                        ?.message ||
                    err?.message ||
                    "Unable to upload profile photo."
                );

            } finally {

                setUploading(
                    false
                );


                if (
                    fileInputRef.current
                ) {

                    fileInputRef.current.value =
                        "";
                }
            }
        };


    /*
    |--------------------------------------------------------------------------
    | Save profile
    |--------------------------------------------------------------------------
    */

    const handleSave =
        async () => {

            const trimmedName =
                name.trim();


            if (
                !trimmedName
            ) {

                setError(
                    "Name cannot be empty."
                );

                return;
            }


            if (
                trimmedName.length <
                2
            ) {

                setError(
                    "Name must contain at least 2 characters."
                );

                return;
            }


            setSaving(
                true
            );

            setError("");
            setSuccess("");


            try {

                const response =
                    await updateProfile({
                        name:
                        trimmedName
                    });


                const updatedProfile =
                    response?.data
                        ?.profile ||
                    response?.data;


                if (
                    updatedProfile
                ) {

                    setProfile(
                        updatedProfile
                    );


                    setName(
                        updatedProfile.name ||
                        trimmedName
                    );

                } else {

                    setName(
                        trimmedName
                    );
                }


                updateUser({
                    name:
                    trimmedName
                });


                setSuccess(
                    "Profile information updated successfully."
                );

            } catch (
                err
                ) {

                setError(
                    err?.response
                        ?.data
                        ?.message ||
                    err?.message ||
                    "Unable to update profile."
                );

            } finally {

                setSaving(
                    false
                );
            }
        };


    /*
    |--------------------------------------------------------------------------
    | Display values
    |--------------------------------------------------------------------------
    */

    const displayName =
        profile?.name ||
        user?.name ||
        "User";


    const displayEmail =
        profile?.email ||
        user?.email ||
        "";


    const displayRole =
        profile?.role ||
        user?.role ||
        "USER";


    const displayPhoto =
        photo ||
        profile?.profile_photo_url ||
        profile?.profilePhotoUrl ||
        user?.profile_photo_url ||
        user?.profilePhotoUrl ||
        "";


    const firstInitial =
        displayName
            .charAt(0)
            .toUpperCase() ||
        "U";


    /*
    |--------------------------------------------------------------------------
    | Loading state
    |--------------------------------------------------------------------------
    */

    if (
        loading
    ) {

        return (
            <div className="vs-page">

                <div className="mx-auto max-w-6xl">

                    <div className="vs-card animate-pulse p-7">

                        <div className="h-4 w-24 rounded bg-white/[0.06]" />

                        <div className="mt-4 h-9 w-64 rounded bg-white/[0.06]" />

                        <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/[0.04]" />

                    </div>


                    <div className="mt-5 grid gap-5 lg:grid-cols-[330px_1fr]">

                        <div className="vs-card h-[520px] animate-pulse" />

                        <div className="vs-card h-[520px] animate-pulse" />

                    </div>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="vs-page">

            <div className="mx-auto max-w-6xl space-y-5">

                {/* ============================================================ */}
                {/* HEADER */}
                {/* ============================================================ */}

                <section className="vs-card relative overflow-hidden p-6 sm:p-7">

                    <div
                        className="
                            pointer-events-none
                            absolute
                            right-[-40px]
                            top-[-60px]
                            h-64
                            w-64
                            rounded-full
                            bg-indigo-500/[0.06]
                            blur-3xl
                        "
                    />


                    <div className="relative">

                        <div className="vs-eyebrow">

                            <Icon
                                name="user"
                                size={13}
                            />

                            Account

                        </div>


                        <h1 className="vs-title mt-3">
                            My Profile
                        </h1>


                        <p className="vs-subtitle mt-2 max-w-2xl">
                            Manage your profile information, account identity,
                            and profile photo from one secure workspace.
                        </p>

                    </div>

                </section>


                {/* ============================================================ */}
                {/* ALERTS */}
                {/* ============================================================ */}

                {error && (
                    <div className="vs-alert vs-alert-error">

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


                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            className="
                                ml-auto
                                text-xs
                                font-semibold
                                text-slate-500
                                hover:text-white
                            "
                        >
                            Dismiss
                        </button>

                    </div>
                )}


                {success && (
                    <div className="vs-alert vs-alert-success">

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


                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                            className="
                                ml-auto
                                text-xs
                                font-semibold
                                text-slate-500
                                hover:text-white
                            "
                        >
                            Dismiss
                        </button>

                    </div>
                )}


                {/* ============================================================ */}
                {/* CONTENT */}
                {/* ============================================================ */}

                <div className="grid gap-5 lg:grid-cols-[330px_1fr]">

                    {/* ======================================================== */}
                    {/* PROFILE CARD */}
                    {/* ======================================================== */}

                    <section className="vs-card overflow-hidden">

                        {/* Cover */}

                        <div
                            className="
                                relative
                                h-28
                                overflow-hidden
                                border-b
                                border-white/[0.045]
                                bg-gradient-to-br
                                from-indigo-500/[0.10]
                                via-violet-500/[0.06]
                                to-cyan-500/[0.035]
                            "
                        >

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    inset-0
                                    bg-[radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.16),transparent_35%)]
                                "
                            />

                        </div>


                        <div className="px-6 pb-6">

                            {/* Avatar */}

                            <div className="relative -mt-14 flex justify-center">

                                <div
                                    className="
                                        relative
                                        h-28
                                        w-28
                                        rounded-[28px]
                                        border
                                        border-slate-950
                                        bg-slate-900
                                        p-1
                                        shadow-[0_15px_45px_rgba(0,0,0,0.35)]
                                    "
                                >

                                    {displayPhoto ? (

                                        <img
                                            src={
                                                displayPhoto
                                            }
                                            alt="Profile"
                                            className="
                                                h-full
                                                w-full
                                                rounded-[23px]
                                                object-cover
                                            "
                                        />

                                    ) : (

                                        <div
                                            className="
                                                flex
                                                h-full
                                                w-full
                                                items-center
                                                justify-center
                                                rounded-[23px]
                                                bg-gradient-to-br
                                                from-indigo-500/80
                                                to-violet-500/80
                                                text-3xl
                                                font-extrabold
                                                text-white
                                            "
                                        >
                                            {firstInitial}
                                        </div>

                                    )}


                                    {/* Camera button */}

                                    <button
                                        type="button"
                                        onClick={
                                            handlePhotoClick
                                        }
                                        disabled={
                                            uploading
                                        }
                                        className="
                                            absolute
                                            -bottom-1
                                            -right-1
                                            flex
                                            h-10
                                            w-10
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                           -4
                                            border-slate-950
                                            bg-indigo-500
                                            text-white
                                            shadow-lg
                                            shadow-indigo-950/30
                                            transition
                                            hover:bg-indigo-400
                                            disabled:cursor-not-allowed
                                            disabled:opacity-60
                                        "
                                        title="Change profile photo"
                                    >

                                        {uploading ? (

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

                                        ) : (

                                            <Icon
                                                name="camera"
                                                size={15}
                                            />

                                        )}

                                    </button>


                                    <input
                                        ref={
                                            fileInputRef
                                        }
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={
                                            handlePhotoChange
                                        }
                                        className="hidden"
                                    />

                                </div>

                            </div>


                            {/* Identity */}

                            <div className="mt-5 text-center">

                                <h2 className="truncate text-xl font-extrabold tracking-tight text-white">
                                    {displayName}
                                </h2>


                                <p className="mt-1 truncate text-xs text-slate-600">
                                    {displayEmail}
                                </p>


                                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-500/[0.07] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-300">

                                    <Icon
                                        name="shield"
                                        size={12}
                                    />

                                    {displayRole}

                                </div>

                            </div>


                            {/* Upload information */}

                            <div className="mt-7 border-t border-white/[0.05] pt-6">

                                <div className="flex items-center gap-2">

                                    <Icon
                                        name="image"
                                        size={14}
                                    />

                                    <p className="text-[11px] font-bold text-slate-400">
                                        Profile Photo
                                    </p>

                                </div>


                                <div className="mt-4 grid grid-cols-2 gap-3">

                                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">

                                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-700">
                                            Formats
                                        </p>

                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                            JPG · PNG · WEBP
                                        </p>

                                    </div>


                                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">

                                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-700">
                                            Max Size
                                        </p>

                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                            5 MB
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        handlePhotoClick
                                    }
                                    disabled={
                                        uploading
                                    }
                                    className="
                                        vs-secondary-button
                                        mt-4
                                        w-full
                                    "
                                >

                                    <Icon
                                        name="camera"
                                        size={15}
                                    />

                                    {uploading
                                        ? "Uploading..."
                                        : "Change Photo"}

                                </button>

                            </div>

                        </div>

                    </section>


                    {/* ======================================================== */}
                    {/* INFORMATION CARD */}
                    {/* ======================================================== */}

                    <section className="vs-card p-6 sm:p-7">

                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                                border-b
                                border-white/[0.05]
                                pb-6
                                sm:flex-row
                                sm:items-start
                                sm:justify-between
                            "
                        >

                            <div>

                                <div className="vs-eyebrow">

                                    <Icon
                                        name="edit"
                                        size={13}
                                    />

                                    Profile Settings

                                </div>


                                <h2 className="mt-3 text-xl font-extrabold tracking-tight text-white">
                                    Profile information
                                </h2>


                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                    Update the information associated with your account.
                                </p>

                            </div>


                            <div className="vs-badge shrink-0">

                                <span className="vs-status-dot" />

                                Account active

                            </div>

                        </div>


                        <div className="mt-7 space-y-6">

                            {/* Name */}

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
                                            z-10
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
                                        value={
                                            name
                                        }
                                        onChange={(event) => {

                                            setName(
                                                event.target.value
                                            );

                                            setError("");
                                            setSuccess("");

                                        }}
                                        className="
                                            vs-input
                                            pl-11
                                        "
                                        placeholder="Enter your name"
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>


                                <p className="vs-help">
                                    This name is displayed across your Voice Studio workspace.
                                </p>

                            </div>


                            {/* Email */}

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
                                            z-10
                                            -translate-y-1/2
                                            text-slate-700
                                        "
                                    >
                                        <Icon
                                            name="mail"
                                            size={16}
                                        />
                                    </span>


                                    <input
                                        type="email"
                                        value={
                                            displayEmail
                                        }
                                        disabled
                                        className="
                                            vs-input
                                            cursor-not-allowed
                                            pl-11
                                            opacity-55
                                        "
                                    />

                                </div>


                                <p className="vs-help">
                                    Your email address is managed by your authentication account.
                                </p>

                            </div>


                            {/* Role */}

                            <div>

                                <label className="vs-label">
                                    Account Role
                                </label>


                                <div className="relative">

                                    <span
                                        className="
                                            pointer-events-none
                                            absolute
                                            left-3.5
                                            top-1/2
                                            z-10
                                            -translate-y-1/2
                                            text-slate-700
                                        "
                                    >
                                        <Icon
                                            name="shield"
                                            size={16}
                                        />
                                    </span>


                                    <input
                                        type="text"
                                        value={
                                            displayRole
                                        }
                                        disabled
                                        className="
                                            vs-input
                                            cursor-not-allowed
                                            pl-11
                                            uppercase
                                            opacity-55
                                        "
                                    />

                                </div>

                            </div>


                            {/* Account security */}

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
                                            border-emerald-400/10
                                            bg-emerald-500/[0.05]
                                            text-emerald-300
                                        "
                                    >
                                        <Icon
                                            name="lock"
                                            size={15}
                                        />
                                    </div>


                                    <div className="min-w-0">

                                        <p className="text-xs font-bold text-slate-300">
                                            Account security
                                        </p>


                                        <p className="mt-1 text-[11px] leading-5 text-slate-600">
                                            Keep your account protected with a strong password and secure sign-in methods.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* Actions */}

                            <div
                                className="
                                    flex
                                    flex-col-reverse
                                    gap-3
                                    border-t
                                    border-white/[0.05]
                                    pt-6
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/update-password"
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="
                                        vs-secondary-button
                                    "
                                >

                                    <Icon
                                        name="lock"
                                        size={15}
                                    />

                                    Change Password

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        handleSave
                                    }
                                    disabled={
                                        saving ||
                                        uploading
                                    }
                                    className="
                                        vs-primary-button
                                        sm:min-w-44
                                    "
                                >

                                    {saving ? (

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

                                            Saving...
                                        </>

                                    ) : (

                                        <>
                                            <Icon
                                                name="check"
                                                size={15}
                                            />

                                            Save Changes
                                        </>

                                    )}

                                </button>

                            </div>

                        </div>

                    </section>

                </div>


                {/* ============================================================ */}
                {/* FOOTER NAVIGATION */}
                {/* ============================================================ */}

                <section
                    className="
                        flex
                        flex-col
                        items-start
                        justify-between
                        gap-4
                        rounded-2xl
                        border
                        border-white/[0.045]
                        bg-white/[0.012]
                        px-5
                        py-4
                        sm:flex-row
                        sm:items-center
                    "
                >

                    <div className="flex items-center gap-2">

                        <div className="text-indigo-300">

                            <Icon
                                name="sparkles"
                                size={14}
                            />

                        </div>


                        <p className="text-[11px] text-slate-600">
                            Voice Studio account settings
                        </p>

                    </div>


                    <Link
                        to="/dashboard"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            text-[11px]
                            font-semibold
                            text-indigo-300
                            transition
                            hover:text-indigo-200
                        "
                    >
                        Back to Dashboard

                        <Icon
                            name="arrow"
                            size={13}
                        />

                    </Link>

                </section>

            </div>

        </div>
    );
};


export default Profile;