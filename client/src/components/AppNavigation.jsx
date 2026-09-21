import {
    useState
} from "react";

import {
    NavLink,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext.jsx";


/*
|--------------------------------------------------------------------------
| Navigation Icon
|--------------------------------------------------------------------------
*/
const NavigationIcon = ({
                            name
                        }) => {

    const commonProps = {
        width: 18,
        height: 18,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true
    };


    if (name === "sparkles") {
        return (
            <svg {...commonProps}>
                <path d="m12 3-1.4 4.2L6.5 9 10.6 10.4 12 15l1.4-4.6L17.5 9l-4.1-1.8L12 3Z" />
                <path d="m19 14-.8 2.4L16 17.2l2.2.8L19 20.5l.8-2.5 2.2-.8-2.2-.8L19 14Z" />
                <path d="m5 15-.6 1.8-1.8.7 1.8.7L5 20l.6-1.8 1.8-.7-1.8-.7L5 15Z" />
            </svg>
        );
    }


    if (name === "shield") {
        return (
            <svg {...commonProps}>
                <path d="M12 3 19 6v5.5c0 4.5-2.8 7.6-7 9.5-4.2-1.9-7-5-7-9.5V6l7-3Z" />
                <path d="m9.5 12 1.7 1.7 3.5-3.5" />
            </svg>
        );
    }


    if (name === "history") {
        return (
            <svg {...commonProps}>
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v4h4" />
                <path d="M12 7v5l3 2" />
            </svg>
        );
    }


    if (name === "heart") {
        return (
            <svg {...commonProps}>
                <path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z" />
            </svg>
        );
    }


    if (name === "user") {
        return (
            <svg {...commonProps}>
                <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                />
                <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
            </svg>
        );
    }


    if (name === "lock") {
        return (
            <svg {...commonProps}>
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
    }


    if (name === "shield-user") {
        return (
            <svg {...commonProps}>
                <path d="M12 3 19 6v5.5c0 4.5-2.8 7.6-7 9.5-4.2-1.9-7-5-7-9.5V6l7-3Z" />
                <circle
                    cx="12"
                    cy="10"
                    r="2"
                />
                <path d="M8.8 16a3.8 3.8 0 0 1 6.4 0" />
            </svg>
        );
    }


    if (name === "logout") {
        return (
            <svg {...commonProps}>
                <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
                <path d="M14 8l4 4-4 4" />
                <path d="M9 12h9" />
            </svg>
        );
    }


    if (name === "menu") {
        return (
            <svg {...commonProps}>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
            </svg>
        );
    }


    if (name === "close") {
        return (
            <svg {...commonProps}>
                <path d="m6 6 12 12" />
                <path d="m18 6-12 12" />
            </svg>
        );
    }


    if (name === "chevron") {
        return (
            <svg {...commonProps}>
                <path d="m6 9 6 6 6-6" />
            </svg>
        );
    }


    return null;
};


/*
|--------------------------------------------------------------------------
| Navigation Items
|--------------------------------------------------------------------------
*/
const navigationItems = [
    {
        label: "Create Speech",
        path: "/dashboard",
        icon: "sparkles"
    },
    {
        label: "History",
        path: "/history",
        icon: "history"
    },
    {
        label: "Favorites",
        path: "/favorites",
        icon: "heart"
    },
    {
        label: "Profile",
        path: "/profile",
        icon: "user"
    },
    {
        label: "Security",
        path: "/update-password",
        icon: "lock"
    }
];


/*
|--------------------------------------------------------------------------
| App Navigation
|--------------------------------------------------------------------------
*/
const AppNavigation = () => {

    const {
        user,
        logout
    } = useAuth();


    const location =
        useLocation();


    const navigate =
        useNavigate();


    const [
        mobileOpen,
        setMobileOpen
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Admin Check
    |--------------------------------------------------------------------------
    */
    const isAdmin =
        String(
            user?.role || ""
        ).toUpperCase() ===
        "ADMIN";


    /*
    |--------------------------------------------------------------------------
    | Initials
    |--------------------------------------------------------------------------
    */
    const userInitial =
        String(
            user?.name ||
            user?.email ||
            "U"
        )
            .trim()
            .charAt(0)
            .toUpperCase() ||
        "U";


    /*
    |--------------------------------------------------------------------------
    | Profile Photo
    |--------------------------------------------------------------------------
    */
    const profilePhoto =
        user?.profile_photo_url ||
        user?.profilePhotoUrl ||
        "";


    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */
    const handleLogout = () => {

        setMobileOpen(false);

        logout();

        navigate(
            "/login",
            {
                replace: true
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Close mobile menu after navigation
    |--------------------------------------------------------------------------
    */
    const handleNavigation = () => {
        setMobileOpen(false);
    };


    return (
        <header className="sticky top-0 z-50">

            {/* Ambient border/glow */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/25 to-transparent" />

            <nav className="border-b border-white/[0.06] bg-slate-950/70 backdrop-blur-2xl">

                <div className="mx-auto flex h-[78px] max-w-[1500px] items-center justify-between px-5 sm:px-6 lg:px-8">

                    {/* ---------------------------------------------------------- */}
                    {/* Brand */}
                    {/* ---------------------------------------------------------- */}
                    <NavLink
                        to="/dashboard"
                        onClick={
                            handleNavigation
                        }
                        className="group flex shrink-0 items-center gap-3"
                    >

                        <div className="relative">

                            <div className="absolute -inset-2 rounded-2xl bg-indigo-500/15 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />

                            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[14px] border border-indigo-300/20 bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-700 shadow-[0_10px_35px_rgba(79,70,229,0.28)]">

                                <span className="text-xl font-black text-white">
                                    T
                                </span>

                            </div>

                        </div>


                        <div className="hidden min-[420px]:block">

                            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-indigo-300">
                                LABMENTIX
                            </p>

                            <p className="mt-0.5 text-lg font-extrabold tracking-tight text-white">
                                Voice Studio
                            </p>

                        </div>

                    </NavLink>


                    {/* ---------------------------------------------------------- */}
                    {/* Desktop Navigation */}
                    {/* ---------------------------------------------------------- */}
                    <div className="hidden items-center gap-1 xl:flex">

                        {navigationItems.map(
                            (
                                item
                            ) => {

                                const active =
                                    location.pathname ===
                                    item.path;

                                return (

                                    <NavLink
                                        key={
                                            item.path
                                        }
                                        to={
                                            item.path
                                        }
                                        className={() =>
                                            `group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                                active
                                                    ? "bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                                                    : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-100"
                                            }`
                                        }
                                    >

                                        {active && (
                                            <span className="absolute inset-x-4 -bottom-[18px] h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                                        )}


                                        <span
                                            className={
                                                active
                                                    ? "text-indigo-300"
                                                    : "text-slate-500 transition group-hover:text-slate-300"
                                            }
                                        >
                                            <NavigationIcon
                                                name={
                                                    item.icon
                                                }
                                            />
                                        </span>


                                        <span>
                                            {
                                                item.label
                                            }
                                        </span>

                                    </NavLink>

                                );

                            }
                        )}


                        {/* Admin */}
                        {isAdmin && (
                            <NavLink
                                to="/admin"
                                className={() => {

                                    const active =
                                        location.pathname.startsWith(
                                            "/admin"
                                        );

                                    return (
                                        `group relative ml-1 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                            active
                                                ? "border-purple-400/20 bg-purple-500/10 text-white"
                                                : "border-transparent text-slate-400 hover:border-white/[0.05] hover:bg-white/[0.035] hover:text-slate-100"
                                        }`
                                    );
                                }}
                            >

                                <span className="text-purple-300">
                                    <NavigationIcon
                                        name="shield-user"
                                    />
                                </span>

                                Admin

                            </NavLink>
                        )}

                    </div>


                    {/* ---------------------------------------------------------- */}
                    {/* Right Side */}
                    {/* ---------------------------------------------------------- */}
                    <div className="flex items-center gap-3">

                        {/* Account */}
                        <NavLink
                            to="/profile"
                            className="hidden items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 transition hover:border-indigo-400/15 hover:bg-white/[0.05] sm:flex"
                        >

                            {/* Avatar */}
                            <div className="relative">

                                {profilePhoto ? (

                                    <img
                                        src={
                                            profilePhoto
                                        }
                                        alt={
                                            user?.name ||
                                            "Profile"
                                        }
                                        className="h-10 w-10 rounded-xl border border-white/10 object-cover"
                                    />

                                ) : (

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-sm font-bold text-indigo-200">
                                        {
                                            userInitial
                                        }
                                    </div>

                                )}

                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" />

                            </div>


                            <div className="max-w-[150px]">

                                <p className="truncate text-sm font-bold text-white">
                                    {
                                        user?.name ||
                                        "User"
                                    }
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                    {
                                        user?.email ||
                                        ""
                                    }
                                </p>

                            </div>

                        </NavLink>


                        {/* Logout */}
                        <button
                            type="button"
                            onClick={
                                handleLogout
                            }
                            className="group hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-400/[0.05] hover:text-rose-200 sm:flex"
                        >

                            <NavigationIcon
                                name="logout"
                            />

                            <span>
                                Logout
                            </span>

                        </button>


                        {/* Mobile menu */}
                        <button
                            type="button"
                            aria-label={
                                mobileOpen
                                    ? "Close menu"
                                    : "Open menu"
                            }
                            aria-expanded={
                                mobileOpen
                            }
                            onClick={() =>
                                setMobileOpen(
                                    (previous) =>
                                        !previous
                                )
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-300 transition hover:border-indigo-400/20 hover:bg-white/[0.06] xl:hidden"
                        >

                            <NavigationIcon
                                name={
                                    mobileOpen
                                        ? "close"
                                        : "menu"
                                }
                            />

                        </button>

                    </div>

                </div>


                {/* -------------------------------------------------------------- */}
                {/* Mobile Navigation */}
                {/* -------------------------------------------------------------- */}
                {mobileOpen && (

                    <div className="border-t border-white/[0.06] bg-slate-950/95 px-5 pb-5 pt-4 backdrop-blur-2xl xl:hidden">

                        <div className="mx-auto max-w-[1500px] space-y-1">

                            {navigationItems.map(
                                (
                                    item
                                ) => {

                                    const active =
                                        location.pathname ===
                                        item.path;

                                    return (

                                        <NavLink
                                            key={
                                                item.path
                                            }
                                            to={
                                                item.path
                                            }
                                            onClick={
                                                handleNavigation
                                            }
                                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                                active
                                                    ? "bg-indigo-500/10 text-white"
                                                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                                            }`}
                                        >

                                            <span
                                                className={
                                                    active
                                                        ? "text-indigo-300"
                                                        : "text-slate-500"
                                                }
                                            >
                                                <NavigationIcon
                                                    name={
                                                        item.icon
                                                    }
                                                />
                                            </span>

                                            {
                                                item.label
                                            }

                                        </NavLink>

                                    );
                                }
                            )}


                            {isAdmin && (

                                <NavLink
                                    to="/admin"
                                    onClick={
                                        handleNavigation
                                    }
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        location.pathname.startsWith(
                                            "/admin"
                                        )
                                            ? "bg-purple-500/10 text-white"
                                            : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                                    }`}
                                >

                                    <span className="text-purple-300">
                                        <NavigationIcon
                                            name="shield-user"
                                        />
                                    </span>

                                    Admin

                                </NavLink>

                            )}


                            <div className="my-3 h-px bg-white/[0.06]" />


                            {/* Mobile Account */}
                            <NavLink
                                to="/profile"
                                onClick={
                                    handleNavigation
                                }
                                className="flex items-center gap-3 rounded-xl bg-white/[0.025] px-4 py-3"
                            >

                                {profilePhoto ? (

                                    <img
                                        src={
                                            profilePhoto
                                        }
                                        alt="Profile"
                                        className="h-10 w-10 rounded-xl border border-white/10 object-cover"
                                    />

                                ) : (

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-sm font-bold text-indigo-200">
                                        {
                                            userInitial
                                        }
                                    </div>

                                )}


                                <div className="min-w-0">

                                    <p className="truncate text-sm font-bold text-white">
                                        {
                                            user?.name ||
                                            "User"
                                        }
                                    </p>

                                    <p className="truncate text-xs text-slate-500">
                                        {
                                            user?.email ||
                                            ""
                                        }
                                    </p>

                                </div>

                            </NavLink>


                            <button
                                type="button"
                                onClick={
                                    handleLogout
                                }
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/10 bg-rose-500/[0.04] px-4 py-3 text-sm font-semibold text-rose-300 transition hover:border-rose-400/20 hover:bg-rose-500/[0.08]"
                            >

                                <NavigationIcon
                                    name="logout"
                                />

                                Logout

                            </button>

                        </div>

                    </div>

                )}

            </nav>

        </header>
    );
};


export default AppNavigation;