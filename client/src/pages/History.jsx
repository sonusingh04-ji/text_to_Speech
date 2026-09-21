import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    getHistory,
    deleteHistory
} from "../services/historyService.js";

import {
    addFavorite,
    getFavorites,
    removeFavorite
} from "../services/favoriteService.js";


/*
|--------------------------------------------------------------------------
| Normalize history record
|--------------------------------------------------------------------------
*/

const normalizeHistoryItem = (
    item
) => {
    return {
        id:
            item?.id || "",

        text:
            item?.text ||
            "",

        language:
            item?.language ||
            "",

        voiceId:
            item?.voiceId ||
            item?.voice_id ||
            "",

        audioUrl:
            item?.audioUrl ||
            item?.audio_url ||
            "",

        audioFormat:
            item?.audioFormat ||
            item?.audio_format ||
            "mp3",

        durationSeconds:
            item?.durationSeconds ??
            item?.duration_seconds ??
            null,

        createdAt:
            item?.createdAt ||
            item?.created_at ||
            null
    };
};


/*
|--------------------------------------------------------------------------
| Extract history records
|--------------------------------------------------------------------------
*/

const extractHistoryRecords = (
    response
) => {
    const data =
        response?.data;

    if (
        Array.isArray(data)
    ) {
        return data;
    }

    if (
        Array.isArray(
            data?.history
        )
    ) {
        return data.history;
    }

    if (
        Array.isArray(
            data?.records
        )
    ) {
        return data.records;
    }

    return [];
};


/*
|--------------------------------------------------------------------------
| Extract favorite IDs
|--------------------------------------------------------------------------
*/

const extractFavoriteIds = (
    response
) => {
    const data =
        response?.data;

    const records =
        Array.isArray(data)
            ? data
            : data?.favorites ||
            data?.records ||
            [];

    return new Set(
        records
            .map(
                (item) =>
                    item?.speech_history_id ||
                    item?.speechHistoryId ||
                    item?.historyId ||
                    item?.speechHistory?.id ||
                    item?.history?.id
            )
            .filter(Boolean)
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

        case "history":
            return (
                <svg {...props}>
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <path d="M3 4v5h5" />
                    <path d="M12 7v5l3 2" />
                </svg>
            );

        case "refresh":
            return (
                <svg {...props}>
                    <path d="M20 11a8 8 0 0 0-14.9-3" />
                    <path d="M4 4v4h4" />
                    <path d="M4 13a8 8 0 0 0 14.9 3" />
                    <path d="M20 20v-4h-4" />
                </svg>
            );

        case "search":
            return (
                <svg {...props}>
                    <circle
                        cx="11"
                        cy="11"
                        r="7"
                    />
                    <path d="m20 20-4-4" />
                </svg>
            );

        case "star":
            return (
                <svg
                    {...props}
                    fill="currentColor"
                >
                    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
                </svg>
            );

        case "play":
            return (
                <svg {...props}>
                    <path
                        d="m9 6 9 6-9 6V6Z"
                        fill="currentColor"
                        stroke="none"
                    />
                </svg>
            );

        case "download":
            return (
                <svg {...props}>
                    <path d="M12 3v11" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                </svg>
            );

        case "trash":
            return (
                <svg {...props}>
                    <path d="M4 7h16" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M6 7l1 14h10l1-14" />
                    <path d="M9 7V4h6v3" />
                </svg>
            );

        case "volume":
            return (
                <svg {...props}>
                    <path d="M5 10v4h3l4 3V7l-4 3H5Z" />
                    <path d="M16 9.5a4 4 0 0 1 0 5" />
                    <path d="M18.5 7a7 7 0 0 1 0 10" />
                </svg>
            );

        case "globe":
            return (
                <svg {...props}>
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />
                    <path d="M3 12h18" />
                    <path d="M12 3c2.2 2.45 3.3 5.45 3.3 9S14.2 18.55 12 21" />
                    <path d="M12 3c-2.2 2.45-3.3 5.45-3.3 9S9.8 18.55 12 21" />
                </svg>
            );

        case "check":
            return (
                <svg {...props}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );

        case "clock":
            return (
                <svg {...props}>
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />
                    <path d="M12 7v5l3 2" />
                </svg>
            );

        default:
            return null;
    }
};


/*
|--------------------------------------------------------------------------
| History Page
|--------------------------------------------------------------------------
*/

const History = () => {

    const [
        history,
        setHistory
    ] = useState([]);

    const [
        favoriteIds,
        setFavoriteIds
    ] = useState(
        new Set()
    );

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
        success,
        setSuccess
    ] = useState("");

    const [
        deletingId,
        setDeletingId
    ] = useState("");

    const [
        favoriteLoadingId,
        setFavoriteLoadingId
    ] = useState("");

    const [
        search,
        setSearch
    ] = useState("");

    const [
        filter,
        setFilter
    ] = useState("all");


    /*
    |--------------------------------------------------------------------------
    | Initial load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadPage();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | Load page data
    |--------------------------------------------------------------------------
    */

    const loadPage = async (
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

            setSuccess("");

            const [
                historyResponse,
                favoritesResponse
            ] = await Promise.all([
                getHistory(),
                getFavorites()
            ]);

            const historyRecords =
                extractHistoryRecords(
                    historyResponse
                );

            setHistory(
                historyRecords.map(
                    normalizeHistoryItem
                )
            );

            setFavoriteIds(
                extractFavoriteIds(
                    favoritesResponse
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
                "Unable to load speech history."
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
    | Favorite toggle
    |--------------------------------------------------------------------------
    */

    const handleFavoriteToggle =
        async (
            historyId
        ) => {

            if (
                !historyId
            ) {
                return;
            }

            try {

                setFavoriteLoadingId(
                    historyId
                );

                setError("");

                setSuccess("");

                const currentlyFavorite =
                    favoriteIds.has(
                        historyId
                    );

                if (
                    currentlyFavorite
                ) {

                    await removeFavorite(
                        historyId
                    );

                    setFavoriteIds(
                        (current) => {

                            const updated =
                                new Set(
                                    current
                                );

                            updated.delete(
                                historyId
                            );

                            return updated;
                        }
                    );

                    setSuccess(
                        "Removed from favorites."
                    );

                } else {

                    await addFavorite(
                        historyId
                    );

                    setFavoriteIds(
                        (current) => {

                            const updated =
                                new Set(
                                    current
                                );

                            updated.add(
                                historyId
                            );

                            return updated;
                        }
                    );

                    setSuccess(
                        "Added to favorites."
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
                    "Unable to update favorite."
                );

            } finally {

                setFavoriteLoadingId(
                    ""
                );
            }
        };


    /*
    |--------------------------------------------------------------------------
    | Delete history
    |--------------------------------------------------------------------------
    */

    const handleDelete =
        async (
            id
        ) => {

            const confirmed =
                window.confirm(
                    "Delete this speech history item?"
                );

            if (
                !confirmed
            ) {
                return;
            }

            try {

                setDeletingId(
                    id
                );

                setError("");

                setSuccess("");

                await deleteHistory(
                    id
                );

                setHistory(
                    (current) =>
                        current.filter(
                            (item) =>
                                item.id !==
                                id
                        )
                );

                setFavoriteIds(
                    (current) => {

                        const updated =
                            new Set(
                                current
                            );

                        updated.delete(
                            id
                        );

                        return updated;
                    }
                );

                setSuccess(
                    "Speech history deleted successfully."
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
                    "Unable to delete history item."
                );

            } finally {

                setDeletingId(
                    ""
                );
            }
        };


    /*
    |--------------------------------------------------------------------------
    | Date formatter
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
                dateStyle:
                    "medium",
                timeStyle:
                    "short"
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Search matching
    |--------------------------------------------------------------------------
    */

    const filteredHistory =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();

            return history.filter(
                (item) => {

                    const matchesSearch =
                        !query ||
                        item.text
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        item.language
                            .toLowerCase()
                            .includes(
                                query
                            ) ||
                        item.voiceId
                            .toLowerCase()
                            .includes(
                                query
                            );

                    const isFavorite =
                        favoriteIds.has(
                            item.id
                        );

                    const matchesFilter =
                        filter ===
                        "all" ||
                        (
                            filter ===
                            "favorites" &&
                            isFavorite
                        ) ||
                        (
                            filter ===
                            "audio" &&
                            Boolean(
                                item.audioUrl
                            )
                        );

                    return (
                        matchesSearch &&
                        matchesFilter
                    );
                }
            );

        }, [
            history,
            favoriteIds,
            search,
            filter
        ]);


    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

    const statistics =
        useMemo(() => {

            const total =
                history.length;

            const audioReady =
                history.filter(
                    (item) =>
                        Boolean(
                            item.audioUrl
                        )
                ).length;

            const favorites =
                history.filter(
                    (item) =>
                        favoriteIds.has(
                            item.id
                        )
                ).length;

            const languages =
                new Set(
                    history
                        .map(
                            (item) =>
                                item.language
                        )
                        .filter(Boolean)
                ).size;

            return {
                total,
                audioReady,
                favorites,
                languages
            };

        }, [
            history,
            favoriteIds
        ]);


    /*
    |--------------------------------------------------------------------------
    | Download audio
    |--------------------------------------------------------------------------
    */

    const downloadAudio = (
        item
    ) => {

        if (
            !item.audioUrl
        ) {

            setError(
                "Audio is not available for this history item."
            );

            return;
        }

        const link =
            document.createElement(
                "a"
            );

        link.href =
            item.audioUrl;

        link.download =
            `speech-${item.id || "audio"}.mp3`;

        link.target =
            "_blank";

        link.rel =
            "noopener noreferrer";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();
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
            <main className="min-h-screen bg-transparent text-white">

                <div className="mx-auto max-w-[1480px] px-5 py-10 sm:px-6 lg:px-8">

                    <div className="vs-card flex min-h-[420px] items-center justify-center">

                        <div className="text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.08] text-indigo-300">

                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-300/20 border-t-indigo-300" />

                            </div>

                            <p className="mt-5 text-sm font-semibold text-slate-300">
                                Loading your speech library...
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                                Fetching your generated speech history
                            </p>

                        </div>

                    </div>

                </div>

            </main>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <main className="min-h-screen bg-transparent text-white">

            <div className="relative overflow-hidden">

                {/* Ambient background */}

                <div className="pointer-events-none absolute inset-0">

                    <div className="absolute left-[10%] top-[5%] h-72 w-72 rounded-full bg-indigo-500/[0.06] blur-3xl" />

                    <div className="absolute right-[10%] top-[20%] h-80 w-80 rounded-full bg-violet-500/[0.045] blur-3xl" />

                </div>

                <div className="relative mx-auto max-w-[1480px] px-5 py-8 sm:px-6 lg:px-8 lg:py-10">

                    {/* =====================================================
                        HEADER
                    ===================================================== */}

                    <section className="mb-7">

                        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

                            <div>

                                <div className="flex items-center gap-3">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.08] text-indigo-300">

                                        <Icon
                                            name="history"
                                            size={21}
                                        />

                                    </div>

                                    <div>

                                        <p className="vs-eyebrow text-[10px]">
                                            Speech Library
                                        </p>

                                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                            Your speech history
                                        </h1>

                                    </div>

                                </div>

                                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">

                                    Review, replay, favorite, download, and
                                    manage every speech track created from
                                    your Voice Studio workspace.

                                </p>

                            </div>

                            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">

                                <div className="relative min-w-0 flex-1 sm:min-w-[280px]">

                                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">

                                        <Icon
                                            name="search"
                                            size={17}
                                        />

                                    </span>

                                    <input
                                        type="search"
                                        value={
                                            search
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search your speech..."
                                        className="vs-input pl-11"
                                    />

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        loadPage(
                                            true
                                        )
                                    }
                                    disabled={
                                        refreshing
                                    }
                                    className="vs-secondary-button sm:w-auto"

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

                        </div>

                    </section>


                    {/* =====================================================
                        MESSAGES
                    ===================================================== */}

                    {error && (
                        <div className="vs-fade-up mb-5 rounded-2xl border border-rose-400/15 bg-rose-500/[0.07] px-4 py-3">

                            <div className="flex items-center gap-3">

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300">
                                    !
                                </div>

                                <p className="text-sm font-medium text-rose-200">
                                    {error}
                                </p>

                            </div>

                        </div>
                    )}

                    {success && (
                        <div className="vs-fade-up mb-5 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] px-4 py-3">

                            <div className="flex items-center gap-3">

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">

                                    <Icon
                                        name="check"
                                        size={15}
                                    />

                                </div>

                                <p className="text-sm font-medium text-emerald-200">
                                    {success}
                                </p>

                            </div>

                        </div>
                    )}


                    {/* =====================================================
                        STATISTICS
                    ===================================================== */}

                    <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <div className="vs-card p-5">

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/[0.07] text-indigo-300">

                                    <Icon
                                        name="history"
                                        size={18}
                                    />

                                </div>

                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                                    Library
                                </span>

                            </div>

                            <p className="mt-5 text-2xl font-extrabold text-white">
                                {statistics.total}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Total speeches
                            </p>

                        </div>


                        <div className="vs-card p-5">

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-500/[0.07] text-cyan-300">

                                    <Icon
                                        name="volume"
                                        size={18}
                                    />

                                </div>

                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                                    Ready
                                </span>

                            </div>

                            <p className="mt-5 text-2xl font-extrabold text-white">
                                {statistics.audioReady}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Audio available
                            </p>

                        </div>


                        <div className="vs-card p-5">

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/10 bg-amber-500/[0.07] text-amber-300">

                                    <Icon
                                        name="star"
                                        size={17}
                                    />

                                </div>

                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                                    Saved
                                </span>

                            </div>

                            <p className="mt-5 text-2xl font-extrabold text-white">
                                {statistics.favorites}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Favorite speeches
                            </p>

                        </div>


                        <div className="vs-card p-5">

                            <div className="flex items-center justify-between">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-500/[0.07] text-violet-300">

                                    <Icon
                                        name="globe"
                                        size={18}
                                    />

                                </div>

                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                                    Languages
                                </span>

                            </div>

                            <p className="mt-5 text-2xl font-extrabold text-white">
                                {statistics.languages}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Languages used
                            </p>

                        </div>

                    </section>


                    {/* =====================================================
                        FILTER BAR
                    ===================================================== */}

                    <section className="vs-card mb-6 p-2">

                        <div className="flex flex-wrap items-center gap-2">

                            {[
                                {
                                    id:
                                        "all",
                                    label:
                                        "All Speeches"
                                },
                                {
                                    id:
                                        "favorites",
                                    label:
                                        "Favorites"
                                },
                                {
                                    id:
                                        "audio",
                                    label:
                                        "Audio Ready"
                                }
                            ].map(
                                (
                                    item
                                ) => {

                                    const active =
                                        filter ===
                                        item.id;

                                    return (
                                        <button
                                            key={
                                                item.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                setFilter(
                                                    item.id
                                                )
                                            }
                                            className={
                                                active
                                                    ? "rounded-xl bg-indigo-500/15 px-4 py-2.5 text-xs font-bold text-indigo-200 shadow-[inset_0_0_0_1px_rgba(129,140,248,0.18)]"
                                                    : "rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-white/[0.035] hover:text-slate-200"
                                            }
                                        >
                                            {item.label}
                                        </button>
                                    );

                                }
                            )}

                            <div className="ml-auto hidden pr-3 text-[11px] font-semibold text-slate-600 sm:block">

                                {filteredHistory.length}
                                {" "}
                                {filteredHistory.length ===
                                1
                                    ? "result"
                                    : "results"}

                            </div>

                        </div>

                    </section>


                    {/* =====================================================
                        EMPTY STATE
                    ===================================================== */}

                    {history.length ===
                        0 && (

                            <section className="vs-card flex min-h-[430px] items-center justify-center p-8">

                                <div className="max-w-md text-center">

                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.07] text-indigo-300">

                                        <Icon
                                            name="volume"
                                            size={25}
                                        />

                                    </div>

                                    <p className="vs-eyebrow mt-6 text-[10px]">
                                        Empty Library
                                    </p>

                                    <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
                                        No speech history yet
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                        Generate your first speech from the
                                        dashboard and it will appear here with
                                        playback and management controls.
                                    </p>

                                </div>

                            </section>
                        )}


                    {/* =====================================================
                        NO FILTER RESULTS
                    ===================================================== */}

                    {history.length > 0 &&
                        filteredHistory.length ===
                        0 && (

                            <section className="vs-card flex min-h-[320px] items-center justify-center p-8">

                                <div className="max-w-md text-center">

                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-slate-400">

                                        <Icon
                                            name="search"
                                            size={22}
                                        />

                                    </div>

                                    <h2 className="mt-5 text-xl font-bold text-white">
                                        No matching speeches
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Try another search term or change the
                                        selected filter.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            setFilter(
                                                "all"
                                            );
                                        }}
                                        className="vs-secondary-button mt-5 sm:w-auto"
                                    >
                                        Clear filters
                                    </button>

                                </div>

                            </section>
                        )}


                    {/* =====================================================
                        HISTORY LIST
                    ===================================================== */}

                    {filteredHistory.length >
                        0 && (

                            <section className="space-y-5">

                                {filteredHistory.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        const isFavorite =
                                            favoriteIds.has(
                                                item.id
                                            );

                                        const isFavoriteLoading =
                                            favoriteLoadingId ===
                                            item.id;

                                        const isDeleting =
                                            deletingId ===
                                            item.id;

                                        return (
                                            <article
                                                key={
                                                    item.id ||
                                                    index
                                                }
                                                className="vs-card overflow-hidden"
                                            >

                                                {/* Card header */}

                                                <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">

                                                    <div className="min-w-0 flex-1">

                                                        <div className="flex flex-wrap items-center gap-2">

                                                        <span className="rounded-full border border-indigo-400/10 bg-indigo-500/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-indigo-200">

                                                            {item.language ||
                                                                "Unknown language"}

                                                        </span>

                                                            <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-slate-500">

                                                            {(
                                                                item.audioFormat ||
                                                                "mp3"
                                                            ).toUpperCase()}

                                                        </span>

                                                            {isFavorite && (
                                                                <span className="rounded-full border border-amber-400/10 bg-amber-500/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.10em] text-amber-300">

                                                                <span className="mr-1">
                                                                    ★
                                                                </span>

                                                                Favorite

                                                            </span>
                                                            )}

                                                        </div>

                                                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">

                                                            <Icon
                                                                name="clock"
                                                                size={13}
                                                            />

                                                            {formatDate(
                                                                item.createdAt
                                                            )}

                                                        </div>

                                                    </div>


                                                    {/* Actions */}

                                                    <div className="flex flex-wrap gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleFavoriteToggle(
                                                                    item.id
                                                                )
                                                            }
                                                            disabled={
                                                                isFavoriteLoading ||
                                                                isDeleting
                                                            }
                                                            aria-label={
                                                                isFavorite
                                                                    ? "Remove from favorites"
                                                                    : "Add to favorites"
                                                            }
                                                            className={
                                                                isFavorite
                                                                    ? "inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/[0.08] px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/[0.13] disabled:opacity-50"
                                                                    : "inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-bold text-slate-400 transition hover:border-amber-400/20 hover:text-amber-300 disabled:opacity-50"
                                                            }
                                                        >

                                                            <Icon
                                                                name="star"
                                                                size={14}
                                                            />

                                                            {isFavoriteLoading
                                                                ? "Saving..."
                                                                : isFavorite
                                                                    ? "Saved"
                                                                    : "Favorite"}

                                                        </button>


                                                        {item.audioUrl && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    downloadAudio(
                                                                        item
                                                                    )
                                                                }
                                                                disabled={
                                                                    isDeleting
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-bold text-slate-400 transition hover:border-indigo-400/20 hover:text-indigo-200 disabled:opacity-50"
                                                            >

                                                                <Icon
                                                                    name="download"
                                                                    size={14}
                                                                />

                                                                Download

                                                            </button>
                                                        )}


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item.id
                                                                )
                                                            }
                                                            disabled={
                                                                isDeleting
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-xl border border-rose-400/10 bg-rose-500/[0.03] px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/[0.08] disabled:opacity-50"
                                                        >

                                                            <Icon
                                                                name="trash"
                                                                size={14}
                                                            />

                                                            {isDeleting
                                                                ? "Deleting..."
                                                                : "Delete"}

                                                        </button>

                                                    </div>

                                                </div>


                                                {/* Card content */}

                                                <div className="p-5 sm:p-6">

                                                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

                                                        {/* Text */}

                                                        <div className="min-w-0">

                                                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                                                                Script
                                                            </p>

                                                            <div className="rounded-2xl border border-white/[0.06] bg-[#091626] p-5">

                                                                <p className="max-h-[280px] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                                                                    {item.text ||
                                                                        "No text available."}
                                                                </p>

                                                            </div>


                                                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-600">

                                                                {item.voiceId && (
                                                                    <span>
                                                                    Voice:
                                                                        {" "}
                                                                        <span className="text-slate-400">
                                                                        {item.voiceId}
                                                                    </span>
                                                                </span>
                                                                )}

                                                                {item.durationSeconds !==
                                                                    null && (
                                                                        <span>
                                                                    Duration:
                                                                            {" "}
                                                                            <span className="text-slate-400">
                                                                        {Number(
                                                                            item.durationSeconds
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                                s
                                                                    </span>
                                                                </span>
                                                                    )}

                                                            </div>

                                                        </div>


                                                        {/* Audio */}

                                                        <div>

                                                            <div className="mb-3 flex items-center justify-between">

                                                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                                                                    Audio Preview
                                                                </p>

                                                                {item.audioUrl && (
                                                                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.10em] text-emerald-300">

                                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                                                    Ready

                                                                </span>
                                                                )}

                                                            </div>


                                                            {item.audioUrl ? (

                                                                <div className="rounded-2xl border border-cyan-400/10 bg-[#081626] p-4">

                                                                    <div className="mb-4 flex items-center gap-3">

                                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-500/[0.07] text-cyan-300">

                                                                            <Icon
                                                                                name="play"
                                                                                size={16}
                                                                            />

                                                                        </div>

                                                                        <div>

                                                                            <p className="text-sm font-bold text-slate-200">
                                                                                Speech track
                                                                            </p>

                                                                            <p className="text-[10px] text-slate-600">
                                                                                Ready for playback
                                                                            </p>

                                                                        </div>

                                                                    </div>

                                                                    <audio
                                                                        controls
                                                                        preload="metadata"
                                                                        src={
                                                                            item.audioUrl
                                                                        }
                                                                        className="w-full"
                                                                    />

                                                                </div>

                                                            ) : (

                                                                <div className="flex min-h-[130px] items-center justify-center rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.015] p-5 text-center">

                                                                    <div>

                                                                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.025] text-slate-600">

                                                                            <Icon
                                                                                name="volume"
                                                                                size={17}
                                                                            />

                                                                        </div>

                                                                        <p className="mt-3 text-xs font-semibold text-slate-500">
                                                                            Audio unavailable
                                                                        </p>

                                                                    </div>

                                                                </div>

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                            </article>
                                        );
                                    }
                                )}

                            </section>
                        )}


                    {/* =====================================================
                        FOOTER
                    ===================================================== */}

                    <section className="relative mt-8 overflow-hidden rounded-[28px] border border-indigo-400/10 bg-gradient-to-r from-indigo-500/[0.07] via-violet-500/[0.045] to-cyan-400/[0.03] p-6 sm:p-7">

                        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-indigo-500/[0.08] blur-3xl" />

                        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div>

                                <p className="vs-eyebrow text-[10px]">
                                    Voice Library
                                </p>

                                <h2 className="mt-2 text-xl font-bold text-white">
                                    Your generated voices, organized.
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Keep your best speech tracks close,
                                    replay them anytime, and save favorites
                                    for quick access.
                                </p>

                            </div>

                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">

                                <Icon
                                    name="check"
                                    size={15}
                                />

                                {history.length}
                                {" "}
                                saved
                                {" "}
                                {history.length ===
                                1
                                    ? "speech"
                                    : "speeches"}

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>
    );
};

export default History;