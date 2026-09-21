import {
    useEffect,
    useRef,
    useState
} from "react";


/*
|--------------------------------------------------------------------------
| Icon
|--------------------------------------------------------------------------
*/
const Icon = ({
                  name,
                  size = 18
              }) => {

    const commonProps = {
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

        case "play":
            return (
                <svg {...commonProps}>
                    <path d="m9 6 9 6-9 6V6Z" />
                </svg>
            );

        case "pause":
            return (
                <svg {...commonProps}>
                    <path d="M8 6v12" />
                    <path d="M16 6v12" />
                </svg>
            );

        case "download":
            return (
                <svg {...commonProps}>
                    <path d="M12 3v11" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 20h14" />
                </svg>
            );

        case "volume":
            return (
                <svg {...commonProps}>
                    <path d="M5 10v4h3l4 3V7l-4 3H5Z" />
                    <path d="M16 9.5a4 4 0 0 1 0 5" />
                    <path d="M18.5 7a7 7 0 0 1 0 10" />
                </svg>
            );

        case "wave":
            return (
                <svg {...commonProps}>
                    <path d="M3 12h2l2-5 3 10 3-10 2 5h6" />
                </svg>
            );

        case "check":
            return (
                <svg {...commonProps}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );

        case "sparkles":
            return (
                <svg {...commonProps}>
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
| Format time
|--------------------------------------------------------------------------
*/
const formatTime = (
    seconds
) => {

    if (
        !Number.isFinite(
            seconds
        ) ||
        seconds < 0
    ) {

        return "0:00";
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return `${minutes}:${String(
        remainingSeconds
    ).padStart(
        2,
        "0"
    )}`;
};


/*
|--------------------------------------------------------------------------
| Audio Player
|--------------------------------------------------------------------------
*/
const AudioPlayer = ({
                         audioUrl,
                         onDownload
                     }) => {

    const audioRef =
        useRef(null);


    /*
    |--------------------------------------------------------------------------
    | Player state
    |--------------------------------------------------------------------------
    */
    const [
        isPlaying,
        setIsPlaying
    ] = useState(false);


    const [
        currentTime,
        setCurrentTime
    ] = useState(0);


    const [
        duration,
        setDuration
    ] = useState(0);


    const [
        volume,
        setVolume
    ] = useState(1);


    const [
        muted,
        setMuted
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Fake waveform
    |--------------------------------------------------------------------------
    |
    | Visual-only bars. Playback still uses the native HTMLAudioElement.
    |--------------------------------------------------------------------------
    */
    const waveformBars = [
        28, 42, 34, 54, 46, 68, 40, 58,
        72, 48, 36, 61, 78, 52, 44, 70,
        57, 39, 66, 50, 73, 45, 34, 59,
        77, 55, 41, 64, 48, 69, 38, 58,
        74, 46, 63, 51, 72, 43, 57, 67
    ];


    /*
    |--------------------------------------------------------------------------
    | Reset player when audio changes
    |--------------------------------------------------------------------------
    */
    useEffect(() => {

        const audio =
            audioRef.current;


        if (
            !audio
        ) {
            return;
        }


        setIsPlaying(false);

        setCurrentTime(0);

        setDuration(
            Number.isFinite(
                audio.duration
            )
                ? audio.duration
                : 0
        );

        audio.currentTime = 0;

    }, [audioUrl]);


    /*
    |--------------------------------------------------------------------------
    | Audio event handlers
    |--------------------------------------------------------------------------
    */
    useEffect(() => {

        const audio =
            audioRef.current;


        if (
            !audio
        ) {
            return;
        }


        const handleLoadedMetadata =
            () => {

                setDuration(
                    Number.isFinite(
                        audio.duration
                    )
                        ? audio.duration
                        : 0
                );
            };


        const handleTimeUpdate =
            () => {

                setCurrentTime(
                    audio.currentTime
                );
            };


        const handlePlay =
            () => {

                setIsPlaying(
                    true
                );
            };


        const handlePause =
            () => {

                setIsPlaying(
                    false
                );
            };


        const handleEnded =
            () => {

                setIsPlaying(
                    false
                );

                setCurrentTime(
                    0
                );

                audio.currentTime = 0;
            };


        audio.addEventListener(
            "loadedmetadata",
            handleLoadedMetadata
        );

        audio.addEventListener(
            "timeupdate",
            handleTimeUpdate
        );

        audio.addEventListener(
            "play",
            handlePlay
        );

        audio.addEventListener(
            "pause",
            handlePause
        );

        audio.addEventListener(
            "ended",
            handleEnded
        );


        return () => {

            audio.removeEventListener(
                "loadedmetadata",
                handleLoadedMetadata
            );

            audio.removeEventListener(
                "timeupdate",
                handleTimeUpdate
            );

            audio.removeEventListener(
                "play",
                handlePlay
            );

            audio.removeEventListener(
                "pause",
                handlePause
            );

            audio.removeEventListener(
                "ended",
                handleEnded
            );

        };

    }, [audioUrl]);


    /*
    |--------------------------------------------------------------------------
    | Play / Pause
    |--------------------------------------------------------------------------
    */
    const togglePlayback = async () => {

        const audio =
            audioRef.current;


        if (
            !audio
        ) {
            return;
        }


        try {

            if (
                audio.paused
            ) {

                await audio.play();

            } else {

                audio.pause();

            }

        } catch (
            error
            ) {

            console.error(
                "Audio playback failed:",
                error
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Seek
    |--------------------------------------------------------------------------
    */
    const handleSeek = (
        event
    ) => {

        const audio =
            audioRef.current;


        if (
            !audio ||
            !duration
        ) {
            return;
        }


        const percentage =
            Number(
                event.target.value
            );


        const newTime =
            (
                percentage /
                100
            ) *
            duration;


        audio.currentTime =
            newTime;


        setCurrentTime(
            newTime
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Volume
    |--------------------------------------------------------------------------
    */
    const handleVolumeChange = (
        event
    ) => {

        const audio =
            audioRef.current;


        if (
            !audio
        ) {
            return;
        }


        const newVolume =
            Number(
                event.target.value
            );


        audio.volume =
            newVolume;


        setVolume(
            newVolume
        );


        setMuted(
            newVolume === 0
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Mute
    |--------------------------------------------------------------------------
    */
    const toggleMute = () => {

        const audio =
            audioRef.current;


        if (
            !audio
        ) {
            return;
        }


        if (
            muted
        ) {

            audio.muted =
                false;


            audio.volume =
                volume > 0
                    ? volume
                    : 1;


            setMuted(
                false
            );

        } else {

            audio.muted =
                true;


            setMuted(
                true
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Progress
    |--------------------------------------------------------------------------
    */
    const progress =
        duration > 0
            ? (
            currentTime /
            duration
        ) * 100
            : 0;


    /*
    |--------------------------------------------------------------------------
    | Empty state
    |--------------------------------------------------------------------------
    */
    if (
        !audioUrl
    ) {

        return (
            <section className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-slate-950/55 p-5 shadow-[0_18px_55px_rgba(2,6,23,0.3)] sm:p-6">

                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/[0.05] blur-3xl" />


                <div className="relative">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-500/[0.07] text-cyan-300">

                            <Icon
                                name="wave"
                                size={20}
                            />

                        </div>


                        <div>

                            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">
                                Output Studio
                            </p>

                            <h2 className="mt-1 text-lg font-bold tracking-tight text-white">
                                Generated Audio
                            </h2>

                        </div>

                    </div>


                    <div className="mt-5 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-12 text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-slate-600">

                            <Icon
                                name="wave"
                                size={23}
                            />

                        </div>


                        <p className="mt-4 text-sm font-semibold text-slate-400">
                            Your generated speech will appear here.
                        </p>


                        <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-slate-600">
                            Create a voice track from your script to start
                            listening, downloading, and sharing.
                        </p>

                    </div>

                </div>

            </section>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Active player
    |--------------------------------------------------------------------------
    */
    return (
        <section className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-slate-950/55 p-5 shadow-[0_18px_55px_rgba(2,6,23,0.3)] sm:p-6">

            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/[0.06] blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-indigo-500/[0.05] blur-3xl" />


            <div className="relative">

                {/* ---------------------------------------------------------- */}
                {/* Header */}
                {/* ---------------------------------------------------------- */}
                <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3">

                        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-500/10 to-indigo-500/[0.07] text-cyan-300">

                            <Icon
                                name="wave"
                                size={20}
                            />

                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-950 bg-emerald-400">

                                <Icon
                                    name="check"
                                    size={9}
                                />

                            </span>

                        </div>


                        <div>

                            <div className="flex items-center gap-2">

                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">
                                    Output Studio
                                </p>

                                <span className="rounded-full border border-emerald-400/10 bg-emerald-500/[0.05] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-300">
                                    Ready
                                </span>

                            </div>


                            <h2 className="mt-1 text-lg font-bold tracking-tight text-white">
                                Generated Audio
                            </h2>

                        </div>

                    </div>


                    <div className="hidden rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-right sm:block">

                        <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-slate-600">
                            Format
                        </p>

                        <p className="mt-0.5 text-xs font-bold text-slate-400">
                            MP3
                        </p>

                    </div>

                </div>


                {/* ---------------------------------------------------------- */}
                {/* Audio element */}
                {/* ---------------------------------------------------------- */}
                <audio
                    ref={
                        audioRef
                    }
                    src={
                        audioUrl
                    }
                    preload="metadata"
                    className="hidden"
                />


                {/* ---------------------------------------------------------- */}
                {/* Waveform */}
                {/* ---------------------------------------------------------- */}
                <div className="mt-6 rounded-2xl border border-white/[0.055] bg-black/10 px-4 py-5">

                    <div className="flex h-20 items-center justify-between gap-[3px] overflow-hidden">

                        {waveformBars.map(
                            (
                                height,
                                index
                            ) => {

                                const barPosition =
                                    (
                                        index /
                                        (
                                            waveformBars.length -
                                            1
                                        )
                                    ) * 100;


                                const active =
                                    barPosition <=
                                    progress;


                                return (

                                    <div
                                        key={
                                            index
                                        }
                                        className={`w-full max-w-[6px] rounded-full transition-all duration-150 ${
                                            active
                                                ? "bg-gradient-to-t from-indigo-500 via-violet-400 to-cyan-300 shadow-[0_0_10px_rgba(99,102,241,0.35)]"
                                                : "bg-slate-800"
                                        }`}
                                        style={{
                                            height:
                                                `${height}%`
                                        }}
                                    />

                                );

                            }
                        )}

                    </div>

                </div>


                {/* ---------------------------------------------------------- */}
                {/* Progress */}
                {/* ---------------------------------------------------------- */}
                <div className="mt-5">

                    <div className="relative">

                        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-slate-800">

                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_14px_rgba(99,102,241,0.3)]"
                                style={{
                                    width:
                                        `${progress}%`
                                }}
                            />

                        </div>


                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={
                                progress
                            }
                            onChange={
                                handleSeek
                            }
                            className="relative h-5 w-full cursor-pointer appearance-none bg-transparent accent-indigo-500"
                            aria-label="Audio progress"
                        />

                    </div>


                    <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-slate-600">

                        <span>
                            {
                                formatTime(
                                    currentTime
                                )
                            }
                        </span>

                        <span>
                            {
                                formatTime(
                                    duration
                                )
                            }
                        </span>

                    </div>

                </div>


                {/* ---------------------------------------------------------- */}
                {/* Main controls */}
                {/* ---------------------------------------------------------- */}
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                        {/* Play / Pause */}
                        <button
                            type="button"
                            onClick={
                                togglePlayback
                            }
                            aria-label={
                                isPlaying
                                    ? "Pause audio"
                                    : "Play audio"
                            }
                            className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-300/20 bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-700 text-white shadow-[0_12px_30px_rgba(79,70,229,0.28)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                        >

                            <Icon
                                name={
                                    isPlaying
                                        ? "pause"
                                        : "play"
                                }
                                size={22}
                            />

                        </button>


                        <div className="hidden sm:block">

                            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-600">
                                Playback
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-400">
                                {isPlaying
                                    ? "Playing generated speech"
                                    : "Ready to play"}

                            </p>

                        </div>

                    </div>


                    {/* Volume */}
                    <div className="flex flex-1 items-center gap-3 sm:max-w-[200px]">

                        <button
                            type="button"
                            onClick={
                                toggleMute
                            }
                            aria-label={
                                muted
                                    ? "Unmute audio"
                                    : "Mute audio"
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-slate-400 transition hover:border-white/[0.12] hover:text-white"
                        >

                            <Icon
                                name="volume"
                                size={16}
                            />

                        </button>


                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={
                                muted
                                    ? 0
                                    : volume
                            }
                            onChange={
                                handleVolumeChange
                            }
                            className="w-full cursor-pointer accent-indigo-500"
                            aria-label="Audio volume"
                        />

                    </div>


                    {/* Download */}
                    <button
                        type="button"
                        onClick={
                            onDownload
                        }
                        className="vs-secondary-button sm:w-auto"
                    >

                        <Icon
                            name="download"
                            size={17}
                        />

                        Download MP3

                    </button>

                </div>


                {/* ---------------------------------------------------------- */}
                {/* Footer */}
                {/* ---------------------------------------------------------- */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.055] pt-4">

                    <div className="flex items-center gap-2">

                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)]" />

                        <span className="text-[10px] font-semibold text-slate-500">
                            Audio ready
                        </span>

                    </div>


                    <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">

                        <Icon
                            name="sparkles"
                            size={12}
                        />

                        Studio playback

                    </div>

                </div>

            </div>

        </section>
    );
};


export default AudioPlayer;