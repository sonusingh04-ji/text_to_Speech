import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    getFavorites,
    removeFavorite
} from "../services/favoriteService.js";


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

        case "star":
            return (
                <svg {...props}>
                    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
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


        case "download":
            return (
                <svg {...props}>
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M4 20h16" />
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


        case "play":
            return (
                <svg {...props}>
                    <path d="m9 6 9 6-9 6V6Z" />
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


        case "clock":
            return (
                <svg {...props}>
                    <circle
                        cx="12"
                        cy="12"
                        r="8.5"
                    />
                    <path d="M12 7v5l3 2" />
                </svg>
            );


        case "language":
            return (
                <svg {...props}>
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />
                    <path d="M3 12h18" />
                    <path d="M12 3c2.2 2.5 3.3 5.5 3.3 9s-1.1 6.5-3.3 9c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" />
                </svg>
            );


        case "sparkles":
            return (
                <svg {...props}>
                    <path d="M12 3l1.25 4.75L18 9l-4.75 1.25L12 15l-1.25-4.75L6 9l4.75-1.25L12 3Z" />
                    <path d="m19 14 .65 2.35L22 17l-2.35.65L19 20l-.65-2.35L16 17l2.35-.65L19 14Z" />
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
| Resolve history record
|--------------------------------------------------------------------------
*/

const getHistoryRecord = (
    favorite
) => {

    return (
        favorite?.speechHistory ||
        favorite?.history ||
        favorite
    );
};


/*
|--------------------------------------------------------------------------
| Resolve history ID
|--------------------------------------------------------------------------
*/

const getHistoryId = (
    favorite
) => {

    const history =
        getHistoryRecord(
            favorite
        );


    return (
        favorite?.speech_history_id ||
        favorite?.speechHistoryId ||
        history?.id ||
        favorite?.historyId ||
        ""
    );
};


/*
|--------------------------------------------------------------------------
| Format date
|--------------------------------------------------------------------------
*/

const formatDate = (
    value
) => {

    if (
        !value
    ) {
        return "Unknown date";
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


    return date.toLocaleString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
};


/*
|--------------------------------------------------------------------------
| Download
|--------------------------------------------------------------------------
*/

const downloadAudio = (
    item
) => {

    const history =
        getHistoryRecord(
            item
        );


    if (
        !history?.audioUrl
    ) {
        return false;
    }


    const link =
        document.createElement(
            "a"
        );


    link.href =
        history.audioUrl;


    link.download =
        `favorite-${getHistoryId(item) || "speech"}.${history.audioFormat || "mp3"}`;


    link.target =
        "_blank";


    link.rel =
        "noopener noreferrer";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    return true;
};


/*
|--------------------------------------------------------------------------
| Favorites
|--------------------------------------------------------------------------
*/

const Favorites = () => {

    const [
        favorites,
        setFavorites
    ] = useState([]);


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
        removingId,
        setRemovingId
    ] = useState("");


    const [
        search,
        setSearch
    ] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadFavorites();

    }, []);


    const loadFavorites = async (
        showRefresh = false
    ) => {

        try {

            if (
                showRefresh
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


            const response =
                await getFavorites();


            const data =
                response?.data;


            const records =
                Array.isArray(data)
                    ? data
                    : data?.favorites ||
                    data?.records ||
                    [];


            setFavorites(
                records
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
                "Unable to load favorites."
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


    /*
    |--------------------------------------------------------------------------
    | Remove
    |--------------------------------------------------------------------------
    */

    const handleRemove =
        async (
            favorite
        ) => {

            const historyId =
                getHistoryId(
                    favorite
                );


            if (
                !historyId
            ) {

                setError(
                    "Unable to determine favorite history ID."
                );

                return;
            }


            try {

                setRemovingId(
                    historyId
                );

                setError("");


                await removeFavorite(
                    historyId
                );


                setFavorites(
                    (current) =>
                        current.filter(
                            (item) =>
                                getHistoryId(
                                    item
                                ) !==
                                historyId
                        )
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
                    "Unable to remove favorite."
                );

            } finally {

                setRemovingId(
                    ""
                );
            }
        };


    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const filteredFavorites =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                if (
                    !query
                ) {
                    return favorites;
                }


                return favorites.filter(
                    (
                        favorite
                    ) => {

                        const history =
                            getHistoryRecord(
                                favorite
                            );


                        return (
                            history?.text
                                ?.toLowerCase()
                                ?.includes(
                                    query
                                ) ||
                            history?.language
                                ?.toLowerCase()
                                ?.includes(
                                    query
                                ) ||
                            history?.voiceId
                                ?.toLowerCase()
                                ?.includes(
                                    query
                                )
                        );

                    }
                );

            },
            [
                favorites,
                search
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

    const stats =
        useMemo(
            () => {

                const total =
                    favorites.length;


                const audioReady =
                    favorites.filter(
                        (
                            favorite
                        ) => {

                            const history =
                                getHistoryRecord(
                                    favorite
                                );

                            return Boolean(
                                history?.audioUrl
                            );
                        }
                    ).length;


                const languages =
                    new Set(
                        favorites
                            .map(
                                (
                                    favorite
                                ) =>
                                    getHistoryRecord(
                                        favorite
                                    )?.language
                            )
                            .filter(Boolean)
                    ).size;


                return {
                    total,
                    audioReady,
                    languages
                };

            },
            [
                favorites
            ]
        );


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

                <div className="mx-auto max-w-7xl">

                    <div className="vs-card animate-pulse p-7">

                        <div className="h-4 w-24 rounded bg-white/[0.06]" />

                        <div className="mt-4 h-9 w-72 max-w-full rounded bg-white/[0.06]" />

                        <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/[0.04]" />

                    </div>


                    <div className="mt-5 grid gap-4 sm:grid-cols-3">

                        {[1, 2, 3].map(
                            (
                                item
                            ) => (
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


                    <div className="mt-5 space-y-4">

                        {[1, 2, 3].map(
                            (
                                item
                            ) => (
                                <div
                                    key={item}
                                    className="
                                        vs-card
                                        h-56
                                        animate-pulse
                                    "
                                />
                            )
                        )}

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
                            right-[-30px]
                            top-[-50px]
                            h-60
                            w-60
                            rounded-full
                            bg-amber-400/[0.045]
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
                                    name="star"
                                    size={13}
                                />

                                Saved Creations

                            </div>


                            <h1 className="vs-title mt-3">
                                Your favorites
                            </h1>


                            <p className="vs-subtitle mt-2 max-w-2xl">
                                Keep your best generated voices close.
                                Replay, download, and manage your saved
                                speech creations from one place.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                loadFavorites(
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
                                : "Refresh"}

                        </button>

                    </div>

                </section>


                {/* ============================================================ */}
                {/* STATS */}
                {/* ============================================================ */}

                <section className="grid gap-4 sm:grid-cols-3">

                    {[
                        {
                            label: "Saved favorites",
                            value: stats.total,
                            icon: "star"
                        },
                        {
                            label: "Audio ready",
                            value: stats.audioReady,
                            icon: "play"
                        },
                        {
                            label: "Languages",
                            value: stats.languages,
                            icon: "language"
                        }
                    ].map(
                        (
                            stat
                        ) => (
                            <div
                                key={
                                    stat.label
                                }
                                className="vs-card p-5"
                            >

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
                                            border-amber-400/10
                                            bg-amber-400/[0.05]
                                            text-amber-300
                                        "
                                    >
                                        <Icon
                                            name={
                                                stat.icon
                                            }
                                            size={17}
                                        />
                                    </div>


                                    <span className="text-2xl font-extrabold tracking-tight text-white">
                                        {stat.value}
                                    </span>

                                </div>


                                <p className="mt-4 text-xs font-medium text-slate-600">
                                    {stat.label}
                                </p>

                            </div>
                        )
                    )}

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
                {/* SEARCH */}
                {/* ============================================================ */}

                {favorites.length > 0 && (
                    <section className="vs-card p-4 sm:p-5">

                        <div className="relative max-w-lg">

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
                                    name="search"
                                    size={16}
                                />
                            </span>


                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search your favorites..."
                                className="vs-input pl-11"
                            />

                        </div>

                    </section>
                )}


                {/* ============================================================ */}
                {/* EMPTY */}
                {/* ============================================================ */}

                {filteredFavorites.length === 0 && (
                    <section className="vs-card flex min-h-[390px] items-center justify-center p-8">

                        <div className="max-w-md text-center">

                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-amber-400/10
                                    bg-amber-400/[0.05]
                                    text-amber-300
                                "
                            >
                                <Icon
                                    name="star"
                                    size={25}
                                />
                            </div>


                            <h2 className="mt-5 text-xl font-bold tracking-tight text-white">
                                {favorites.length === 0
                                    ? "No favorites yet"
                                    : "No matching favorites"}
                            </h2>


                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {favorites.length === 0
                                    ? "Save a generated speech from your history to build your personal collection."
                                    : "Try a different search term to find your saved speech."}
                            </p>


                            {favorites.length === 0 && (
                                <Link
                                    to="/history"
                                    className="
                                        vs-primary-button
                                        mt-6
                                    "
                                >
                                    Browse History

                                    <Icon
                                        name="arrow"
                                        size={16}
                                    />
                                </Link>
                            )}

                        </div>

                    </section>
                )}


                {/* ============================================================ */}
                {/* FAVORITES */}
                {/* ============================================================ */}

                {filteredFavorites.length > 0 && (
                    <section className="space-y-4">

                        <div className="flex items-center justify-between px-1">

                            <p className="text-xs font-semibold text-slate-600">

                                <span className="text-slate-400">
                                    {filteredFavorites.length}
                                </span>{" "}

                                saved{" "}

                                {filteredFavorites.length === 1
                                    ? "creation"
                                    : "creations"}

                            </p>


                            {search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="
                                        text-[11px]
                                        font-semibold
                                        text-indigo-300
                                        hover:text-indigo-200
                                    "
                                >
                                    Clear search
                                </button>
                            )}

                        </div>


                        {filteredFavorites.map(
                            (
                                favorite,
                                index
                            ) => {

                                const history =
                                    getHistoryRecord(
                                        favorite
                                    );


                                const historyId =
                                    getHistoryId(
                                        favorite
                                    );


                                const audioUrl =
                                    history?.audioUrl ||
                                    history?.audio_url ||
                                    "";


                                const language =
                                    history?.language ||
                                    "Unknown language";


                                const voiceId =
                                    history?.voiceId ||
                                    history?.voice_id ||
                                    "Default voice";


                                const audioFormat =
                                    history?.audioFormat ||
                                    history?.audio_format ||
                                    "mp3";


                                const text =
                                    history?.text ||
                                    "No text available";


                                const createdAt =
                                    history?.createdAt ||
                                    history?.created_at;


                                const duration =
                                    history?.durationSeconds ??
                                    history?.duration_seconds ??
                                    null;


                                return (
                                    <article
                                        key={
                                            favorite?.id ||
                                            historyId ||
                                            index
                                        }
                                        className="
                                            vs-card
                                            group
                                            overflow-hidden
                                            p-0
                                        "
                                    >

                                        {/* Header bar */}

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                border-b
                                                border-white/[0.045]
                                                bg-white/[0.012]
                                                px-5
                                                py-3
                                                sm:px-6
                                            "
                                        >

                                            <div className="flex min-w-0 items-center gap-3">

                                                <div
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        border
                                                        border-amber-400/10
                                                        bg-amber-400/[0.05]
                                                        text-amber-300
                                                    "
                                                >
                                                    <Icon
                                                        name="star"
                                                        size={14}
                                                    />
                                                </div>


                                                <div className="min-w-0">

                                                    <p className="text-[11px] font-bold text-slate-400">
                                                        Favorite #{index + 1}
                                                    </p>

                                                    <p className="truncate text-[10px] text-slate-700">
                                                        {formatDate(
                                                            createdAt
                                                        )}
                                                    </p>

                                                </div>

                                            </div>


                                            <span
                                                className="
                                                    rounded-full
                                                    border
                                                    border-amber-400/10
                                                    bg-amber-400/[0.05]
                                                    px-2.5
                                                    py-1
                                                    text-[9px]
                                                    font-bold
                                                    tracking-[0.08em]
                                                    text-amber-300
                                                "
                                            >
                                                SAVED
                                            </span>

                                        </div>


                                        {/* Body */}

                                        <div className="p-5 sm:p-6">

                                            <div
                                                className="
                                                    grid
                                                    gap-6
                                                    xl:grid-cols-[1fr_360px]
                                                "
                                            >

                                                {/* Main content */}

                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap gap-2">

                                                        <span className="vs-badge">
                                                            {language}
                                                        </span>


                                                        <span className="vs-badge">
                                                            {audioFormat.toUpperCase()}
                                                        </span>

                                                    </div>


                                                    <div
                                                        className="
                                                            mt-4
                                                            rounded-2xl
                                                            border
                                                            border-white/[0.05]
                                                            bg-black/10
                                                            p-4
                                                            sm:p-5
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                whitespace-pre-wrap
                                                                break-words
                                                                text-sm
                                                                leading-7
                                                                text-slate-400
                                                            "
                                                        >
                                                            {text}
                                                        </p>

                                                    </div>


                                                    {/* Metadata */}

                                                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">

                                                        <div className="flex items-center gap-2 text-[10px] text-slate-600">

                                                            <Icon
                                                                name="mic"
                                                                size={12}
                                                            />

                                                            <span>
                                                                Voice:
                                                            </span>

                                                            <span className="max-w-[180px] truncate font-semibold text-slate-500">
                                                                {voiceId}
                                                            </span>

                                                        </div>


                                                        <div className="flex items-center gap-2 text-[10px] text-slate-600">

                                                            <Icon
                                                                name="language"
                                                                size={12}
                                                            />

                                                            <span>
                                                                Language:
                                                            </span>

                                                            <span className="font-semibold text-slate-500">
                                                                {language}
                                                            </span>

                                                        </div>


                                                        {duration !==
                                                            null &&
                                                            duration !==
                                                            undefined && (
                                                                <div className="flex items-center gap-2 text-[10px] text-slate-600">

                                                                    <Icon
                                                                        name="clock"
                                                                        size={12}
                                                                    />

                                                                    <span>
                                                                        Duration:
                                                                    </span>

                                                                    <span className="font-semibold text-slate-500">
                                                                        {Number(
                                                                            duration
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                        s
                                                                    </span>

                                                                </div>
                                                            )}

                                                    </div>

                                                </div>


                                                {/* Audio panel */}

                                                <div>

                                                    <div
                                                        className="
                                                            rounded-2xl
                                                            border
                                                            border-white/[0.05]
                                                            bg-black/10
                                                            p-4
                                                        "
                                                    >

                                                        <div className="mb-3 flex items-center justify-between">

                                                            <div>

                                                                <p className="text-xs font-bold text-slate-300">
                                                                    Audio Preview
                                                                </p>

                                                                <p className="mt-0.5 text-[10px] text-slate-700">
                                                                    {audioUrl
                                                                        ? "Your saved creation"
                                                                        : "Audio unavailable"}
                                                                </p>

                                                            </div>


                                                            <div
                                                                className={`
                                                                    flex
                                                                    h-8
                                                                    w-8
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    ${
                                                                    audioUrl
                                                                        ? "bg-emerald-500/[0.07] text-emerald-300"
                                                                        : "bg-slate-500/[0.06] text-slate-700"
                                                                }
                                                                `}
                                                            >
                                                                <Icon
                                                                    name={
                                                                        audioUrl
                                                                            ? "play"
                                                                            : "mic"
                                                                    }
                                                                    size={14}
                                                                />
                                                            </div>

                                                        </div>


                                                        {audioUrl ? (

                                                            <audio
                                                                controls
                                                                preload="none"
                                                                src={
                                                                    audioUrl
                                                                }
                                                                className="
                                                                    vs-audio
                                                                    w-full
                                                                "
                                                            >
                                                                Your browser does not support audio playback.
                                                            </audio>

                                                        ) : (

                                                            <div
                                                                className="
                                                                    rounded-xl
                                                                    border
                                                                    border-dashed
                                                                    border-white/[0.06]
                                                                    px-4
                                                                    py-5
                                                                    text-center
                                                                "
                                                            >
                                                                <p className="text-[11px] text-slate-700">
                                                                    Audio is not available for this favorite.
                                                                </p>
                                                            </div>

                                                        )}

                                                    </div>


                                                    {/* Actions */}

                                                    <div className="mt-3 grid grid-cols-2 gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                const success =
                                                                    downloadAudio(
                                                                        favorite
                                                                    );


                                                                if (
                                                                    !success
                                                                ) {

                                                                    setError(
                                                                        "Audio is not available for this favorite."
                                                                    );
                                                                }

                                                            }}
                                                            disabled={
                                                                !audioUrl
                                                            }
                                                            className="
                                                                vs-secondary-button
                                                                !min-h-11
                                                                !px-3
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-40
                                                            "
                                                        >

                                                            <Icon
                                                                name="download"
                                                                size={15}
                                                            />

                                                            Download

                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemove(
                                                                    favorite
                                                                )
                                                            }
                                                            disabled={
                                                                removingId ===
                                                                historyId
                                                            }
                                                            className="
                                                                flex
                                                                min-h-11
                                                                items-center
                                                                justify-center
                                                                gap-2
                                                                rounded-xl
                                                                border
                                                                border-rose-400/10
                                                                bg-rose-500/[0.03]
                                                                px-3
                                                                text-xs
                                                                font-semibold
                                                                text-rose-300
                                                                transition
                                                                hover:border-rose-400/20
                                                                hover:bg-rose-500/[0.06]
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-50
                                                            "
                                                        >

                                                            {removingId ===
                                                            historyId ? (

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
                                                                    size={15}
                                                                />

                                                            )}


                                                            {removingId ===
                                                            historyId
                                                                ? "Removing..."
                                                                : "Remove"}

                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </section>
                )}

            </div>

        </div>
    );
};


export default Favorites;