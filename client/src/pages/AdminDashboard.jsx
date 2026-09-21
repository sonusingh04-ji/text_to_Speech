import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    getAdminDashboard,
    getAdminUsers,
    getAdminAnalytics,
    getAdminUsageAnalytics,
    getAdminSpeechAnalytics,
    createAdminUser,
    deleteAdminUser
} from "../services/adminService.js";


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const firstDefined = (
    ...values
) => {

    return values.find(
        (value) =>
            value !== undefined &&
            value !== null
    );
};


const extractObject = (
    response
) => {

    let value =
        response?.data;


    if (
        !value ||
        typeof value !== "object"
    ) {
        return {};
    }


    for (
        let index = 0;
        index < 5;
        index += 1
    ) {

        if (
            !value ||
            typeof value !== "object"
        ) {
            return {};
        }


        if (
            value.dashboard &&
            typeof value.dashboard === "object"
        ) {

            return value.dashboard;
        }


        if (
            value.stats &&
            typeof value.stats === "object"
        ) {

            return value.stats;
        }


        if (
            value.summary &&
            typeof value.summary === "object"
        ) {

            return value.summary;
        }


        if (
            value.data &&
            typeof value.data === "object" &&
            !Array.isArray(value.data)
        ) {

            value =
                value.data;

            continue;
        }


        break;
    }


    return value;
};


const extractArray = (
    response,
    keys = []
) => {

    const data =
        response?.data;


    if (
        Array.isArray(data)
    ) {

        return data;
    }


    for (
        const key
        of keys
        ) {

        if (
            Array.isArray(
                data?.[key]
            )
        ) {

            return data[key];
        }
    }


    if (
        data?.data &&
        typeof data.data === "object"
    ) {

        for (
            const key
            of keys
            ) {

            if (
                Array.isArray(
                    data.data?.[key]
                )
            ) {

                return data.data[key];
            }
        }
    }


    return [];
};


const formatNumber = (
    value
) => {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return "0";
    }


    return number.toLocaleString();
};


const formatDate = (
    value
) => {

    if (
        !value
    ) {

        return "Unknown";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );
    }


    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};


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

        case "shield":
            return (
                <svg {...props}>
                    <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
            );


        case "users":
            return (
                <svg {...props}>
                    <path d="M16 20v-1.2a4.8 4.8 0 0 0-4.8-4.8H7.8A4.8 4.8 0 0 0 3 18.8V20" />
                    <circle
                        cx="9.5"
                        cy="7.5"
                        r="3.5"
                    />
                    <path d="M16 4.5a3.4 3.4 0 0 1 0 6.7" />
                    <path d="M21 20v-1.2a4.8 4.8 0 0 0-3.4-4.6" />
                </svg>
            );


        case "mic":
            return (
                <svg {...props}>
                    <rect
                        x="9"
                        y="3"
                        width="6"
                        height="11"
                        rx="3"
                    />
                    <path d="M6 11a6 6 0 0 0 12 0" />
                    <path d="M12 17v4" />
                    <path d="M8 21h8" />
                </svg>
            );


        case "file":
            return (
                <svg {...props}>
                    <path d="M6 3h8l4 4v14H6V3Z" />
                    <path d="M14 3v5h5" />
                </svg>
            );


        case "star":
            return (
                <svg {...props}>
                    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
                </svg>
            );


        case "database":
            return (
                <svg {...props}>
                    <ellipse
                        cx="12"
                        cy="5"
                        rx="8"
                        ry="3"
                    />
                    <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
                    <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
                </svg>
            );


        case "chart":
            return (
                <svg {...props}>
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="m7 15 3-4 3 2 5-7" />
                </svg>
            );


        case "refresh":
            return (
                <svg {...props}>
                    <path d="M20 11a8 8 0 0 0-14.8-4L3 9" />
                    <path d="M3 4v5h5" />
                    <path d="M4 13a8 8 0 0 0 14.8 4L21 15" />
                    <path d="M21 20v-5h-5" />
                </svg>
            );


        case "plus":
            return (
                <svg {...props}>
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                </svg>
            );


        case "trash":
            return (
                <svg {...props}>
                    <path d="M4 7h16" />
                    <path d="M10 11v5" />
                    <path d="M14 11v5" />
                    <path d="m9 7 .7-2h4.6l.7 2" />
                    <path d="M6 7l1 14h10l1-14" />
                </svg>
            );


        case "search":
            return (
                <svg {...props}>
                    <circle
                        cx="11"
                        cy="11"
                        r="6.5"
                    />
                    <path d="m16 16 5 5" />
                </svg>
            );


        case "sparkles":
            return (
                <svg {...props}>
                    <path d="M12 3l1.25 4.75L18 9l-4.75 1.25L12 15l-1.25-4.75L6 9l4.75-1.25L12 3Z" />
                    <path d="m19 14 .65 2.35L22 17l-2.35.65L19 20l-.65-2.35L16 17l2.35-.65L19 14Z" />
                </svg>
            );


        case "calendar":
            return (
                <svg {...props}>
                    <rect
                        x="3"
                        y="4"
                        width="18"
                        height="17"
                        rx="2"
                    />
                    <path d="M16 2v4M8 2v4M3 9h18" />
                </svg>
            );


        case "arrow":
            return (
                <svg {...props}>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                </svg>
            );


        case "check":
            return (
                <svg {...props}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );


        default:
            return null;
    }
};


/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

const StatCard = ({
                      label,
                      value,
                      hint,
                      icon
                  }) => {

    return (
        <div className="vs-card p-5">

            <div className="flex items-center justify-between">

                <div
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-indigo-400/10
                        bg-indigo-500/[0.07]
                        text-indigo-300
                    "
                >
                    <Icon
                        name={icon}
                        size={17}
                    />
                </div>


                <p className="text-2xl font-extrabold tracking-tight text-white">
                    {value}
                </p>

            </div>


            <p className="mt-4 text-xs font-bold text-slate-400">
                {label}
            </p>


            {hint && (
                <p className="mt-1 text-[10px] text-slate-700">
                    {hint}
                </p>
            )}

        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

const AdminDashboard = () => {

    const [
        dashboard,
        setDashboard
    ] = useState({});


    const [
        users,
        setUsers
    ] = useState([]);


    const [
        analytics,
        setAnalytics
    ] = useState({});


    const [
        usageAnalytics,
        setUsageAnalytics
    ] = useState({});


    const [
        speechAnalytics,
        setSpeechAnalytics
    ] = useState({});


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        refreshing,
        setRefreshing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        userSearch,
        setUserSearch
    ] = useState("");


    const [
        adminName,
        setAdminName
    ] = useState("");


    const [
        adminEmail,
        setAdminEmail
    ] = useState("");


    const [
        adminPassword,
        setAdminPassword
    ] = useState("");


    const [
        adminConfirmPassword,
        setAdminConfirmPassword
    ] = useState("");


    const [
        creatingAdmin,
        setCreatingAdmin
    ] = useState(false);


    const [
        adminSuccess,
        setAdminSuccess
    ] = useState("");


    const [
        adminError,
        setAdminError
    ] = useState("");


    const [
        deletingUserId,
        setDeletingUserId
    ] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Load all admin datasets
    |--------------------------------------------------------------------------
    */

    const loadAdminData = async (
        refresh = false
    ) => {

        try {

            if (
                refresh
            ) {

                setRefreshing(
                    true
                );

            } else {

                setLoading(
                    true
                );
            }


            setError("");


            const results =
                await Promise.allSettled([
                    getAdminDashboard(),
                    getAdminUsers(),
                    getAdminAnalytics(),
                    getAdminUsageAnalytics(),
                    getAdminSpeechAnalytics()
                ]);


            const [
                dashboardResult,
                usersResult,
                analyticsResult,
                usageResult,
                speechResult
            ] = results;


            if (
                dashboardResult.status ===
                "fulfilled"
            ) {

                setDashboard(
                    extractObject(
                        dashboardResult.value
                    )
                );
            }


            if (
                usersResult.status ===
                "fulfilled"
            ) {

                setUsers(
                    extractArray(
                        usersResult.value,
                        [
                            "users",
                            "records",
                            "data"
                        ]
                    )
                );
            }


            if (
                analyticsResult.status ===
                "fulfilled"
            ) {

                setAnalytics(
                    extractObject(
                        analyticsResult.value
                    )
                );
            }


            if (
                usageResult.status ===
                "fulfilled"
            ) {

                setUsageAnalytics(
                    extractObject(
                        usageResult.value
                    )
                );
            }


            if (
                speechResult.status ===
                "fulfilled"
            ) {

                setSpeechAnalytics(
                    extractObject(
                        speechResult.value
                    )
                );
            }


            const rejected =
                results.filter(
                    item =>
                        item.status ===
                        "rejected"
                );


            if (
                rejected.length ===
                results.length
            ) {

                const requestError =
                    rejected[0]?.reason;


                setError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    requestError?.message ||
                    "Unable to load admin dashboard."
                );
            }

        } catch (
            requestError
            ) {

            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                requestError?.message ||
                "Unable to load admin dashboard."
            );

        } finally {

            setLoading(
                false
            );

            setRefreshing(
                false
            );
        }
    };


    useEffect(() => {

        loadAdminData();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

    const stats =
        useMemo(
            () => {

                const overview =
                    dashboard?.overview ||
                    dashboard?.data?.overview ||
                    {};


                const sources = [
                    overview,
                    dashboard,
                    analytics,
                    analytics?.overview
                ].filter(
                    item =>
                        item &&
                        typeof item ===
                        "object"
                );


                const findValue = (
                    keys,
                    fallback = 0
                ) => {

                    for (
                        const source
                        of sources
                        ) {

                        for (
                            const key
                            of keys
                            ) {

                            if (
                                source[key] !==
                                undefined &&
                                source[key] !==
                                null
                            ) {

                                return source[key];
                            }
                        }
                    }


                    return fallback;
                };


                return {

                    totalUsers:
                        Number(
                            findValue([
                                "total_users",
                                "totalUsers",
                                "users",
                                "user_count",
                                "userCount"
                            ])
                        ),


                    totalSpeeches:
                        Number(
                            findValue([
                                "total_speeches",
                                "totalSpeeches",
                                "speeches",
                                "speech_count",
                                "speechCount"
                            ])
                        ),


                    totalCharacters:
                        Number(
                            findValue([
                                "total_characters_used",
                                "totalCharactersUsed",
                                "characters_used",
                                "charactersUsed",
                                "total_characters",
                                "totalCharacters"
                            ])
                        ),


                    totalFavorites:
                        Number(
                            findValue([
                                "total_favorites",
                                "totalFavorites",
                                "favorites",
                                "favorite_count",
                                "favoriteCount"
                            ])
                        ),


                    totalFiles:
                        Number(
                            findValue([
                                "total_uploaded_files",
                                "totalUploadedFiles",
                                "uploaded_files",
                                "uploadedFiles",
                                "file_count",
                                "fileCount"
                            ])
                        ),


                    usersToday:
                        Number(
                            findValue([
                                "users_today",
                                "usersToday"
                            ])
                        ),


                    speechesToday:
                        Number(
                            findValue([
                                "speeches_today",
                                "speechesToday"
                            ])
                        )
                };

            },
            [
                dashboard,
                analytics
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | Language analytics
    |--------------------------------------------------------------------------
    */

    const languageStats =
        useMemo(
            () => {

                return (
                    analytics?.languages ||
                    analytics?.languageStats ||
                    analytics?.language_stats ||
                    analytics?.speechAnalytics?.languages ||
                    speechAnalytics?.languages ||
                    speechAnalytics?.languageStats ||
                    []
                );

            },
            [
                analytics,
                speechAnalytics
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | Voice analytics
    |--------------------------------------------------------------------------
    */

    const voiceStats =
        useMemo(
            () => {

                return (
                    analytics?.voices ||
                    analytics?.voiceStats ||
                    analytics?.voice_stats ||
                    analytics?.speechAnalytics?.voices ||
                    speechAnalytics?.voices ||
                    speechAnalytics?.voiceStats ||
                    []
                );

            },
            [
                analytics,
                speechAnalytics
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | Daily usage
    |--------------------------------------------------------------------------
    */

    const dailyUsage =
        useMemo(
            () => {

                return (
                    usageAnalytics?.usage ||
                    usageAnalytics?.dailyUsage ||
                    usageAnalytics?.daily_usage ||
                    usageAnalytics?.records ||
                    analytics?.usage ||
                    analytics?.dailyUsage ||
                    []
                );

            },
            [
                usageAnalytics,
                analytics
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | Filter users
    |--------------------------------------------------------------------------
    */

    const filteredUsers =
        useMemo(
            () => {

                const query =
                    userSearch
                        .trim()
                        .toLowerCase();


                if (
                    !query
                ) {

                    return users;
                }


                return users.filter(
                    user => {

                        return (
                            user?.name
                                ?.toLowerCase()
                                ?.includes(query) ||
                            user?.email
                                ?.toLowerCase()
                                ?.includes(query) ||
                            String(
                                user?.role ||
                                ""
                            )
                                .toLowerCase()
                                .includes(query)
                        );

                    }
                );

            },
            [
                users,
                userSearch
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | Create admin
    |--------------------------------------------------------------------------
    */

    const handleCreateAdmin =
        async (
            event
        ) => {

            event.preventDefault();


            setAdminError("");
            setAdminSuccess("");


            if (
                adminPassword !==
                adminConfirmPassword
            ) {

                setAdminError(
                    "Passwords do not match."
                );

                return;
            }


            if (
                adminPassword.length <
                8
            ) {

                setAdminError(
                    "Password must contain at least 8 characters."
                );

                return;
            }


            if (
                !adminName.trim() ||
                !adminEmail.trim()
            ) {

                setAdminError(
                    "Name and email are required."
                );

                return;
            }


            setCreatingAdmin(
                true
            );


            try {

                await createAdminUser({
                    name:
                        adminName.trim(),

                    email:
                        adminEmail.trim(),

                    password:
                    adminPassword
                });


                setAdminSuccess(
                    "New administrator created successfully."
                );


                setAdminName("");
                setAdminEmail("");
                setAdminPassword("");
                setAdminConfirmPassword("");


                await loadAdminData(
                    true
                );

            } catch (
                requestError
                ) {

                setAdminError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    requestError?.message ||
                    "Unable to create admin account."
                );

            } finally {

                setCreatingAdmin(
                    false
                );
            }
        };


    /*
    |--------------------------------------------------------------------------
    | Delete user
    |--------------------------------------------------------------------------
    */

    const handleDeleteUser =
        async (
            targetUser
        ) => {

            const userId =
                targetUser?.id ||
                targetUser?.user_id;


            if (
                !userId
            ) {

                setError(
                    "Unable to determine the selected user's ID."
                );

                return;
            }


            const label =
                targetUser?.name ||
                targetUser?.email ||
                "this user";


            const confirmed =
                window.confirm(
                    `Are you sure you want to delete ${label}? This action cannot be undone.`
                );


            if (
                !confirmed
            ) {

                return;
            }


            try {

                setDeletingUserId(
                    String(userId)
                );

                setError("");


                await deleteAdminUser(
                    userId
                );


                setUsers(
                    current =>
                        current.filter(
                            user =>
                                String(
                                    user?.id ||
                                    user?.user_id
                                ) !==
                                String(userId)
                        )
                );

                /*
                 * Reload the overview as well,
                 * so counters remain accurate.
                 */

                await loadAdminData(
                    true
                );

            } catch (
                requestError
                ) {

                setError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    requestError?.message ||
                    "Unable to delete user."
                );

            } finally {

                setDeletingUserId(
                    ""
                );
            }
        };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (
        loading
    ) {

        return (
            <div className="vs-page">

                <div className="mx-auto max-w-7xl space-y-5">

                    <div className="vs-card animate-pulse p-7">

                        <div className="h-4 w-28 rounded bg-white/[0.06]" />

                        <div className="mt-4 h-9 w-80 rounded bg-white/[0.06]" />

                        <div className="mt-3 h-4 w-[28rem] max-w-full rounded bg-white/[0.04]" />

                    </div>


                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

                        {[
                            1,
                            2,
                            3,
                            4,
                            5
                        ].map(
                            item => (
                                <div
                                    key={item}
                                    className="
                                        vs-card
                                        h-28
                                        animate-pulse
                                    "
                                />
                            )
                        )}

                    </div>


                    <div className="grid gap-5 xl:grid-cols-2">

                        <div className="vs-card h-96 animate-pulse" />

                        <div className="vs-card h-96 animate-pulse" />

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

            <div className="mx-auto max-w-7xl space-y-5">

                {/* ============================================================ */}
                {/* HEADER */}
                {/* ============================================================ */}

                <section className="vs-card relative overflow-hidden p-6 sm:p-7">

                    <div
                        className="
                            pointer-events-none
                            absolute
                            right-[-40px]
                            top-[-50px]
                            h-64
                            w-64
                            rounded-full
                            bg-indigo-500/[0.06]
                            blur-3xl
                        "
                    />

                    <div
                        className="
                            relative
                            flex
                            flex-col
                            gap-5
                            lg:flex-row
                            lg:items-end
                            lg:justify-between
                        "
                    >

                        <div>

                            <div className="vs-eyebrow">

                                <Icon
                                    name="shield"
                                    size={13}
                                />

                                Administration

                            </div>


                            <h1 className="vs-title mt-3">
                                Admin Control Center
                            </h1>


                            <p className="vs-subtitle mt-2 max-w-3xl">
                                Monitor users, speech generation, storage,
                                favorites, language trends, voice usage,
                                and platform activity from one secure workspace.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                loadAdminData(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                            className="
                                vs-secondary-button
                                shrink-0
                            "
                        >

                            <Icon
                                name="refresh"
                                size={16}
                            />

                            {refreshing
                                ? "Refreshing..."
                                : "Refresh Data"}

                        </button>

                    </div>

                </section>


                {/* ============================================================ */}
                {/* ERROR */}
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


                {/* ============================================================ */}
                {/* OVERVIEW */}
                {/* ============================================================ */}

                <section>

                    <div className="mb-3 flex items-center gap-2 px-1">

                        <Icon
                            name="chart"
                            size={13}
                        />

                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                            Platform Overview
                        </p>

                    </div>


                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

                        <StatCard
                            label="Total Users"
                            value={
                                formatNumber(
                                    stats.totalUsers
                                )
                            }
                            hint={`${formatNumber(stats.usersToday)} registered today`}
                            icon="users"
                        />


                        <StatCard
                            label="Total Speeches"
                            value={
                                formatNumber(
                                    stats.totalSpeeches
                                )
                            }
                            hint={`${formatNumber(stats.speechesToday)} generated today`}
                            icon="mic"
                        />


                        <StatCard
                            label="Characters Used"
                            value={
                                formatNumber(
                                    stats.totalCharacters
                                )
                            }
                            hint="Across all users"
                            icon="database"
                        />


                        <StatCard
                            label="Favorites"
                            value={
                                formatNumber(
                                    stats.totalFavorites
                                )
                            }
                            hint="Saved speech creations"
                            icon="star"
                        />


                        <StatCard
                            label="Uploaded Files"
                            value={
                                formatNumber(
                                    stats.totalFiles
                                )
                            }
                            hint="TXT · PDF · DOCX"
                            icon="file"
                        />

                    </div>

                </section>


                {/* ============================================================ */}
                {/* CREATE ADMIN */}
                {/* ============================================================ */}

                <section className="vs-card overflow-hidden">

                    <div className="border-b border-white/[0.05] bg-white/[0.012] px-6 py-5">

                        <div className="flex items-start gap-3">

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-violet-400/10
                                    bg-violet-500/[0.06]
                                    text-violet-300
                                "
                            >
                                <Icon
                                    name="shield"
                                    size={17}
                                />
                            </div>


                            <div>

                                <p className="vs-eyebrow">
                                    Administrator Management
                                </p>


                                <h2 className="mt-2 text-lg font-extrabold tracking-tight text-white">
                                    Create New Administrator
                                </h2>


                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                    Create another administrator account with access
                                    to the protected control center.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="p-6">

                        {adminError && (
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
                                    {adminError}
                                </p>

                            </div>
                        )}


                        {adminSuccess && (
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
                                    {adminSuccess}
                                </p>

                            </div>
                        )}


                        <form
                            onSubmit={
                                handleCreateAdmin
                            }
                            className="grid gap-5 md:grid-cols-2"
                        >

                            <div>

                                <label className="vs-label">
                                    Administrator Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        adminName
                                    }
                                    onChange={(event) =>
                                        setAdminName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Administrator name"
                                    maxLength={100}
                                    required
                                    className="vs-input"
                                    disabled={
                                        creatingAdmin
                                    }
                                />

                            </div>


                            <div>

                                <label className="vs-label">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={
                                        adminEmail
                                    }
                                    onChange={(event) =>
                                        setAdminEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="admin@example.com"
                                    required
                                    className="vs-input"
                                    disabled={
                                        creatingAdmin
                                    }
                                />

                            </div>


                            <div>

                                <label className="vs-label">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        adminPassword
                                    }
                                    onChange={(event) =>
                                        setAdminPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Minimum 8 characters"
                                    minLength={8}
                                    required
                                    className="vs-input"
                                    disabled={
                                        creatingAdmin
                                    }
                                />

                            </div>


                            <div>

                                <label className="vs-label">
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    value={
                                        adminConfirmPassword
                                    }
                                    onChange={(event) =>
                                        setAdminConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Confirm password"
                                    minLength={8}
                                    required
                                    className="vs-input"
                                    disabled={
                                        creatingAdmin
                                    }
                                />

                            </div>


                            <div className="md:col-span-2 flex justify-end">

                                <button
                                    type="submit"
                                    disabled={
                                        creatingAdmin
                                    }
                                    className="vs-primary-button"
                                >

                                    {creatingAdmin ? (

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

                                            Creating...

                                        </>

                                    ) : (

                                        <>
                                            <Icon
                                                name="plus"
                                                size={15}
                                            />

                                            Create Administrator
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </section>


                {/* ============================================================ */}
                {/* USERS */}
                {/* ============================================================ */}

                <section className="vs-card overflow-hidden">

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            border-b
                            border-white/[0.05]
                            bg-white/[0.012]
                            px-6
                            py-5
                            lg:flex-row
                            lg:items-end
                            lg:justify-between
                        "
                    >

                        <div>

                            <p className="vs-eyebrow">

                                <Icon
                                    name="users"
                                    size={13}
                                />

                                User Management

                            </p>


                            <h2 className="mt-2 text-lg font-extrabold tracking-tight text-white">
                                Registered users
                            </h2>


                            <p className="mt-1 text-xs text-slate-600">
                                Monitor platform accounts and user activity.
                            </p>

                        </div>


                        <div className="relative w-full lg:w-80">

                            <span
                                className="
                                    pointer-events-none
                                    absolute
                                    left-3.5
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-700
                                "
                            >

                                <Icon
                                    name="search"
                                    size={15}
                                />

                            </span>


                            <input
                                type="text"
                                value={
                                    userSearch
                                }
                                onChange={(event) =>
                                    setUserSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search users..."
                                className="vs-input pl-10"
                            />

                        </div>

                    </div>


                    <div className="border-b border-white/[0.045] px-6 py-3">

                        <span className="vs-badge">

                            {filteredUsers.length} shown

                        </span>

                    </div>


                    {filteredUsers.length === 0 ? (

                        <div className="p-12 text-center">

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
                                    border-white/[0.05]
                                    bg-white/[0.02]
                                    text-slate-700
                                "
                            >

                                <Icon
                                    name="users"
                                    size={22}
                                />

                            </div>


                            <p className="mt-4 text-sm font-semibold text-slate-400">
                                No users found
                            </p>


                            <p className="mt-1 text-xs text-slate-700">
                                Try another search term.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[930px] text-left">

                                <thead>

                                <tr className="border-b border-white/[0.045]">

                                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                                        User
                                    </th>

                                    <th className="px-4 py-4 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                                        Role
                                    </th>

                                    <th className="px-4 py-4 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                                        Characters
                                    </th>

                                    <th className="px-4 py-4 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                                        Requests
                                    </th>

                                    <th className="px-4 py-4 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                                        Joined
                                    </th>

                                    <th className="px-6 py-4 text-right text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                                        Action
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {filteredUsers.map(
                                    (
                                        targetUser,
                                        index
                                    ) => {

                                        const userId =
                                            targetUser?.id ||
                                            targetUser?.user_id ||
                                            index;


                                        const name =
                                            targetUser?.name ||
                                            "Unnamed user";


                                        const email =
                                            targetUser?.email ||
                                            "—";


                                        const role =
                                            targetUser?.role ||
                                            "USER";


                                        const characters =
                                            firstDefined(
                                                targetUser?.characters_used,
                                                targetUser?.charactersUsed,
                                                0
                                            );


                                        const requests =
                                            firstDefined(
                                                targetUser?.request_count,
                                                targetUser?.requestCount,
                                                targetUser?.requests,
                                                0
                                            );


                                        const created =
                                            firstDefined(
                                                targetUser?.created_at,
                                                targetUser?.createdAt
                                            );


                                        const normalizedRole =
                                            String(
                                                role
                                            ).toUpperCase();


                                        const isAdmin =
                                            normalizedRole ===
                                            "ADMIN";


                                        const deleting =
                                            deletingUserId ===
                                            String(
                                                userId
                                            );


                                        return (
                                            <tr
                                                key={
                                                    userId
                                                }
                                                className="
                                                        border-b
                                                        border-white/[0.035]
                                                        transition
                                                        hover:bg-white/[0.012]
                                                    "
                                            >

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div
                                                            className={`
                                                                    flex
                                                                    h-9
                                                                    w-9
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-xl
                                                                    text-xs
                                                                    font-extrabold
                                                                    ${
                                                                isAdmin
                                                                    ? "bg-violet-500/[0.08] text-violet-300"
                                                                    : "bg-indigo-500/[0.07] text-indigo-300"
                                                            }
                                                                `}
                                                        >

                                                            {name
                                                                .charAt(0)
                                                                .toUpperCase()}

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="truncate text-xs font-bold text-slate-300">
                                                                {name}
                                                            </p>


                                                            <p className="truncate text-[10px] text-slate-700">
                                                                {email}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td className="px-4 py-4">

                                                        <span
                                                            className={`
                                                                rounded-full
                                                                border
                                                                px-2.5
                                                                py-1
                                                                text-[9px]
                                                                font-bold
                                                                uppercase
                                                                tracking-[0.08em]
                                                                ${
                                                                isAdmin
                                                                    ? "border-violet-400/10 bg-violet-500/[0.05] text-violet-300"
                                                                    : "border-indigo-400/10 bg-indigo-500/[0.05] text-indigo-300"
                                                            }
                                                            `}
                                                        >

                                                            {role}

                                                        </span>

                                                </td>


                                                <td className="px-4 py-4 text-xs font-semibold text-slate-500">

                                                    {formatNumber(
                                                        characters
                                                    )}

                                                </td>


                                                <td className="px-4 py-4 text-xs font-semibold text-slate-500">

                                                    {formatNumber(
                                                        requests
                                                    )}

                                                </td>


                                                <td className="px-4 py-4 text-xs text-slate-600">

                                                    {formatDate(
                                                        created
                                                    )}

                                                </td>


                                                <td className="px-6 py-4 text-right">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteUser(
                                                                targetUser
                                                            )
                                                        }
                                                        disabled={
                                                            deleting ||
                                                            isAdmin
                                                        }
                                                        title={
                                                            isAdmin
                                                                ? "Administrator accounts cannot be deleted here."
                                                                : "Delete user"
                                                        }
                                                        className="
                                                                inline-flex
                                                                min-h-9
                                                                items-center
                                                                gap-2
                                                                rounded-xl
                                                                border
                                                                border-rose-400/10
                                                                bg-rose-500/[0.03]
                                                                px-3
                                                                text-[10px]
                                                                font-bold
                                                                text-rose-300
                                                                transition
                                                                hover:border-rose-400/20
                                                                hover:bg-rose-500/[0.06]
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-35
                                                            "
                                                    >

                                                        {deleting ? (

                                                            <span
                                                                className="
                                                                        h-3.5
                                                                        w-3.5
                                                                        animate-spin
                                                                        rounded-full
                                                                        border-2
                                                                        border-rose-300/20
                                                                        border-t-rose-300
                                                                    "
                                                            />

                                                        ) : (

                                                            <Icon
                                                                name="trash"
                                                                size={13}
                                                            />

                                                        )}

                                                        {deleting
                                                            ? "Deleting..."
                                                            : "Delete"}

                                                    </button>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* ============================================================ */}
                {/* ANALYTICS */}
                {/* ============================================================ */}

                <section>

                    <div className="mb-3 flex items-center gap-2 px-1">

                        <Icon
                            name="chart"
                            size={13}
                        />

                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                            Speech Intelligence
                        </p>

                    </div>


                    <div className="grid gap-5 xl:grid-cols-2">

                        {/* Languages */}

                        <section className="vs-card p-6">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="vs-eyebrow">
                                        Speech Analytics
                                    </p>


                                    <h2 className="mt-2 text-lg font-extrabold tracking-tight text-white">
                                        Language distribution
                                    </h2>

                                </div>


                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-indigo-400/10
                                        bg-indigo-500/[0.06]
                                        text-indigo-300
                                    "
                                >

                                    <Icon
                                        name="sparkles"
                                        size={16}
                                    />

                                </div>

                            </div>


                            {languageStats.length === 0 ? (

                                <div className="mt-6 rounded-2xl border border-dashed border-white/[0.06] p-8 text-center">

                                    <p className="text-xs text-slate-700">
                                        No language analytics available.
                                    </p>

                                </div>

                            ) : (

                                <div className="mt-6 space-y-3">

                                    {languageStats.map(
                                        (
                                            item,
                                            index
                                        ) => {

                                            const name =
                                                item?.language ||
                                                item?.name ||
                                                item?.code ||
                                                `Language ${index + 1}`;


                                            const count =
                                                Number(
                                                    firstDefined(
                                                        item?.count,
                                                        item?.total,
                                                        item?.speeches,
                                                        item?.speech_count,
                                                        item?.speechCount,
                                                        0
                                                    )
                                                );


                                            const max =
                                                Math.max(
                                                    ...languageStats.map(
                                                        entry =>
                                                            Number(
                                                                firstDefined(
                                                                    entry?.count,
                                                                    entry?.total,
                                                                    entry?.speeches,
                                                                    entry?.speech_count,
                                                                    entry?.speechCount,
                                                                    0
                                                                )
                                                            )
                                                    ),
                                                    1
                                                );


                                            const percentage =
                                                Math.min(
                                                    100,
                                                    (
                                                        count /
                                                        max
                                                    ) *
                                                    100
                                                );


                                            return (
                                                <div
                                                    key={`${name}-${index}`}
                                                    className="
                                                        rounded-2xl
                                                        border
                                                        border-white/[0.045]
                                                        bg-white/[0.015]
                                                        p-4
                                                    "
                                                >

                                                    <div className="flex items-center justify-between gap-4">

                                                        <p className="truncate text-xs font-semibold text-slate-400">
                                                            {name}
                                                        </p>

                                                        <p className="shrink-0 text-xs font-extrabold text-white">
                                                            {formatNumber(
                                                                count
                                                            )}
                                                        </p>

                                                    </div>


                                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">

                                                        <div
                                                            className="
                                                                h-full
                                                                rounded-full
                                                                bg-indigo-400/70
                                                                transition-all
                                                            "
                                                            style={{
                                                                width:
                                                                    `${percentage}%`
                                                            }}
                                                        />

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            )}

                        </section>


                        {/* Voices */}

                        <section className="vs-card p-6">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="vs-eyebrow">
                                        Voice Analytics
                                    </p>


                                    <h2 className="mt-2 text-lg font-extrabold tracking-tight text-white">
                                        Most used voices
                                    </h2>

                                </div>


                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-violet-400/10
                                        bg-violet-500/[0.06]
                                        text-violet-300
                                    "
                                >

                                    <Icon
                                        name="mic"
                                        size={16}
                                    />

                                </div>

                            </div>


                            {voiceStats.length === 0 ? (

                                <div className="mt-6 rounded-2xl border border-dashed border-white/[0.06] p-8 text-center">

                                    <p className="text-xs text-slate-700">
                                        No voice analytics available.
                                    </p>

                                </div>

                            ) : (

                                <div className="mt-6 space-y-3">

                                    {voiceStats.map(
                                        (
                                            item,
                                            index
                                        ) => {

                                            const name =
                                                item?.voice ||
                                                item?.voice_id ||
                                                item?.voiceId ||
                                                item?.name ||
                                                `Voice ${index + 1}`;


                                            const count =
                                                Number(
                                                    firstDefined(
                                                        item?.count,
                                                        item?.total,
                                                        item?.speeches,
                                                        item?.speech_count,
                                                        item?.speechCount,
                                                        0
                                                    )
                                                );


                                            const max =
                                                Math.max(
                                                    ...voiceStats.map(
                                                        entry =>
                                                            Number(
                                                                firstDefined(
                                                                    entry?.count,
                                                                    entry?.total,
                                                                    entry?.speeches,
                                                                    entry?.speech_count,
                                                                    entry?.speechCount,
                                                                    0
                                                                )
                                                            )
                                                    ),
                                                    1
                                                );


                                            const percentage =
                                                Math.min(
                                                    100,
                                                    (
                                                        count /
                                                        max
                                                    ) *
                                                    100
                                                );


                                            return (
                                                <div
                                                    key={`${name}-${index}`}
                                                    className="
                                                        rounded-2xl
                                                        border
                                                        border-white/[0.045]
                                                        bg-white/[0.015]
                                                        p-4
                                                    "
                                                >

                                                    <div className="flex items-center justify-between gap-4">

                                                        <p className="max-w-[72%] truncate text-xs font-semibold text-slate-400">
                                                            {name}
                                                        </p>


                                                        <p className="shrink-0 text-xs font-extrabold text-white">
                                                            {formatNumber(
                                                                count
                                                            )}
                                                        </p>

                                                    </div>


                                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">

                                                        <div
                                                            className="
                                                                h-full
                                                                rounded-full
                                                                bg-violet-400/70
                                                                transition-all
                                                            "
                                                            style={{
                                                                width:
                                                                    `${percentage}%`
                                                            }}
                                                        />

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            )}

                        </section>

                    </div>

                </section>


                {/* ============================================================ */}
                {/* DAILY USAGE */}
                {/* ============================================================ */}

                <section className="vs-card overflow-hidden">

                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                            border-b
                            border-white/[0.05]
                            bg-white/[0.012]
                            px-6
                            py-5
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        <div>

                            <p className="vs-eyebrow">

                                <Icon
                                    name="calendar"
                                    size={13}
                                />

                                Usage Analytics

                            </p>


                            <h2 className="mt-2 text-lg font-extrabold tracking-tight text-white">
                                Daily platform usage
                            </h2>

                        </div>


                        <span className="vs-badge">

                            <Icon
                                name="database"
                                size={11}
                            />

                            {dailyUsage.length} records

                        </span>

                    </div>


                    {dailyUsage.length === 0 ? (

                        <div className="p-12 text-center">

                            <p className="text-xs text-slate-700">
                                No daily usage data available.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[620px] text-left">

                                <thead>

                                <tr className="border-b border-white/[0.045]">

                                    <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                                        Date
                                    </th>

                                    <th className="px-4 py-4 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                                        Characters
                                    </th>

                                    <th className="px-4 py-4 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                                        Requests
                                    </th>

                                    <th className="px-6 py-4 text-right text-[9px] font-bold uppercase tracking-[0.12em] text-slate-700">
                                        Activity
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {dailyUsage.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        const date =
                                            item?.date ||
                                            item?.created_at ||
                                            item?.createdAt ||
                                            `Day ${index + 1}`;


                                        const characters =
                                            Number(
                                                firstDefined(
                                                    item?.characters_used,
                                                    item?.charactersUsed,
                                                    item?.characters,
                                                    0
                                                )
                                            );


                                        const requests =
                                            Number(
                                                firstDefined(
                                                    item?.request_count,
                                                    item?.requestCount,
                                                    item?.requests,
                                                    0
                                                )
                                            );


                                        return (
                                            <tr
                                                key={`${date}-${index}`}
                                                className="
                                                        border-b
                                                        border-white/[0.035]
                                                        transition
                                                        hover:bg-white/[0.012]
                                                    "
                                            >

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <div
                                                            className="
                                                                    flex
                                                                    h-8
                                                                    w-8
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    bg-cyan-500/[0.05]
                                                                    text-cyan-300
                                                                "
                                                        >

                                                            <Icon
                                                                name="calendar"
                                                                size={13}
                                                            />

                                                        </div>


                                                        <span className="text-xs font-semibold text-slate-400">
                                                                {formatDate(
                                                                    date
                                                                )}
                                                            </span>

                                                    </div>

                                                </td>


                                                <td className="px-4 py-4 text-xs font-bold text-slate-400">

                                                    {formatNumber(
                                                        characters
                                                    )}

                                                </td>


                                                <td className="px-4 py-4 text-xs font-bold text-slate-400">

                                                    {formatNumber(
                                                        requests
                                                    )}

                                                </td>


                                                <td className="px-6 py-4">

                                                    <div className="ml-auto max-w-32">

                                                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">

                                                            <div
                                                                className="
                                                                        h-full
                                                                        rounded-full
                                                                        bg-cyan-400/60
                                                                    "
                                                                style={{
                                                                    width:
                                                                        `${Math.min(
                                                                            100,
                                                                            Math.max(
                                                                                4,
                                                                                Math.log10(
                                                                                    Math.max(
                                                                                        characters,
                                                                                        1
                                                                                    ) +
                                                                                    1
                                                                                ) *
                                                                                14
                                                                            )
                                                                        )}%`
                                                                }}
                                                            />

                                                        </div>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* ============================================================ */}
                {/* FOOTER */}
                {/* ============================================================ */}

                <section
                    className="
                        flex
                        flex-col
                        items-start
                        justify-between
                        gap-3
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

                        <span className="text-emerald-300">

                            <Icon
                                name="shield"
                                size={14}
                            />

                        </span>


                        <p className="text-[10px] text-slate-700">
                            Protected administrator workspace
                        </p>

                    </div>


                    <p className="text-[10px] text-slate-800">
                        Voice Studio Admin Control Center
                    </p>

                </section>

            </div>

        </div>
    );
};


export default AdminDashboard;