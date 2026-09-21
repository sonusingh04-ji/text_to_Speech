import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    getLanguages,
    getVoices,
    generateSpeech
} from "../services/ttsService.js";

import {
    translateText
} from "../services/translationService.js";

import {
    getUsage
} from "../services/usageService.js";

import {
    useAuth
} from "../context/AuthContext.jsx";

import VoiceSettings from "../components/VoiceSettings.jsx";
import AudioPlayer from "../components/AudioPlayer.jsx";
import AppNavigation from "../components/AppNavigation.jsx";
import FileUpload from "../components/FileUpload.jsx";
import AIEnhancement from "../components/AIEnhancement.jsx";

/*
|--------------------------------------------------------------------------
| Dashboard Configuration
|--------------------------------------------------------------------------
*/

const MAX_TEXT_LENGTH = 40000;

/*
|--------------------------------------------------------------------------
| Inline Icon
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
        case "sparkles":
            return (
                <svg {...commonProps}>
                    <path d="M12 3l1.25 4.75L18 9l-4.75 1.25L12 15l-1.25-4.75L6 9l4.75-1.25L12 3Z" />
                    <path d="m19 14 .65 2.35L22 17l-2.35.65L19 20l-.65-2.35L16 17l2.35-.65L19 14Z" />
                    <path d="m5 14 .5 1.5L7 16l-1.5.5L5 18l-.5-1.5L3 16l1.5-.5L5 14Z" />
                </svg>
            );

        case "arrow":
            return (
                <svg {...commonProps}>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                </svg>
            );

        case "file":
            return (
                <svg {...commonProps}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8" />
                    <path d="M8 17h6" />
                </svg>
            );

        case "wave":
            return (
                <svg {...commonProps}>
                    <path d="M3 12h2l2-5 3 10 3-10 2 5h6" />
                </svg>
            );

        case "globe":
            return (
                <svg {...commonProps}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18" />
                    <path d="M12 3c2.2 2.45 3.3 5.45 3.3 9S14.2 18.55 12 21" />
                    <path d="M12 3c-2.2 2.45-3.3 5.45-3.3 9S9.8 18.55 12 21" />
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

        case "check":
            return (
                <svg {...commonProps}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );

        case "clock":
            return (
                <svg {...commonProps}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            );

        case "refresh":
            return (
                <svg {...commonProps}>
                    <path d="M20 11a8 8 0 0 0-14.9-3" />
                    <path d="M4 4v4h4" />
                    <path d="M4 13a8 8 0 0 0 14.9 3" />
                    <path d="M20 20v-4h-4" />
                </svg>
            );

        default:
            return null;
    }
};

/*
|--------------------------------------------------------------------------
| Mini Stat
|--------------------------------------------------------------------------
*/

const MiniStat = ({
                      icon,
                      label,
                      value
                  }) => {
    return (
        <div className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 transition duration-200 hover:border-indigo-400/15 hover:bg-white/[0.045]">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/[0.07] text-indigo-300">
                <Icon
                    name={icon}
                    size={16}
                />
            </div>

            <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {label}
                </p>

                <p className="mt-0.5 truncate text-sm font-bold text-slate-100">
                    {value}
                </p>
            </div>

        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

const Dashboard = () => {
    const {
        user
    } = useAuth();

    /*
    |--------------------------------------------------------------------------
    | Editor State
    |--------------------------------------------------------------------------
    */

    const [
        text,
        setText
    ] = useState("");

    const [
        translatedText,
        setTranslatedText
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Language / Voice State
    |--------------------------------------------------------------------------
    */

    const [
        languages,
        setLanguages
    ] = useState([]);

    const [
        voices,
        setVoices
    ] = useState([]);

    const [
        sourceLanguage,
        setSourceLanguage
    ] = useState("");

    const [
        targetLanguage,
        setTargetLanguage
    ] = useState("");

    const [
        voice,
        setVoice
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Voice Settings
    |--------------------------------------------------------------------------
    */

    const [
        speed,
        setSpeed
    ] = useState(1);

    const [
        stability,
        setStability
    ] = useState(0.5);

    const [
        similarityBoost,
        setSimilarityBoost
    ] = useState(0.75);

    const [
        style,
        setStyle
    ] = useState(0);

    const [
        useSpeakerBoost,
        setUseSpeakerBoost
    ] = useState(true);

    /*
    |--------------------------------------------------------------------------
    | Audio
    |--------------------------------------------------------------------------
    */

    const [
        audioUrl,
        setAudioUrl
    ] = useState("");

    const [
        audioBlob,
        setAudioBlob
    ] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Usage
    |--------------------------------------------------------------------------
    */

    const [
        usage,
        setUsage
    ] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | UI State
    |--------------------------------------------------------------------------
    */

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        generating,
        setGenerating
    ] = useState(false);

    const [
        translating,
        setTranslating
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
    | File Text
    |--------------------------------------------------------------------------
    */

    const handleTextExtracted = (
        extractedText
    ) => {
        const nextText =
            extractedText || "";

        setText(
            nextText
        );

        setTranslatedText("");

        setError("");

        setSuccess(
            "Extracted text loaded into the editor."
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Load Languages, Voices and Usage
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let mounted = true;

        const loadConfiguration = async () => {
            try {
                setLoading(true);

                setError("");

                const [
                    languagesResponse,
                    voicesResponse,
                    usageResponse
                ] = await Promise.all([
                    getLanguages(),
                    getVoices(),
                    getUsage()
                ]);

                if (!mounted) {
                    return;
                }

                const loadedLanguages =
                    languagesResponse?.languages ||
                    [];

                const loadedVoices =
                    voicesResponse?.voices ||
                    [];

                setLanguages(
                    loadedLanguages
                );

                setVoices(
                    loadedVoices
                );

                setUsage(
                    usageResponse?.usage ||
                    null
                );

                /*
                |--------------------------------------------------------------------------
                | Default Language
                |--------------------------------------------------------------------------
                */

                if (
                    loadedLanguages.length > 0
                ) {
                    const defaultLanguage =
                        loadedLanguages.find(
                            (item) =>
                                item?.code ===
                                "en-US"
                        ) ||
                        loadedLanguages[0];

                    setSourceLanguage(
                        defaultLanguage.code
                    );

                    setTargetLanguage(
                        defaultLanguage.code
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Default Voice
                |--------------------------------------------------------------------------
                */

                if (
                    loadedVoices.length > 0
                ) {
                    setVoice(
                        loadedVoices[0].id
                    );
                }
            } catch (
                requestError
                ) {
                if (!mounted) {
                    return;
                }

                setError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    requestError?.message ||
                    "Unable to load TTS configuration."
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadConfiguration();

        return () => {
            mounted = false;
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Cleanup Audio URL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        return () => {
            if (
                audioUrl &&
                audioUrl.startsWith(
                    "blob:"
                )
            ) {
                URL.revokeObjectURL(
                    audioUrl
                );
            }
        };
    }, [audioUrl]);

    /*
    |--------------------------------------------------------------------------
    | Character Count
    |--------------------------------------------------------------------------
    */

    const characterCount =
        useMemo(() => {
            return Array.from(
                text
            ).length;
        }, [text]);

    /*
    |--------------------------------------------------------------------------
    | Word Count
    |--------------------------------------------------------------------------
    */

    const wordCount =
        useMemo(() => {
            const trimmed =
                text.trim();

            if (!trimmed) {
                return 0;
            }

            return trimmed.split(
                /\s+/
            ).length;
        }, [text]);

    /*
    |--------------------------------------------------------------------------
    | Usage Percentage
    |--------------------------------------------------------------------------
    */

    const usagePercentage =
        useMemo(() => {
            const limit =
                Number(
                    usage
                        ?.limits
                        ?.dailyCharacterLimit
                );

            const used =
                Number(
                    usage?.charactersUsed
                );

            if (
                !limit ||
                Number.isNaN(
                    limit
                ) ||
                Number.isNaN(
                    used
                )
            ) {
                return 0;
            }

            return Math.min(
                (used / limit) * 100,
                100
            );
        }, [usage]);

    /*
    |--------------------------------------------------------------------------
    | Usage Helpers
    |--------------------------------------------------------------------------
    */

    const remainingCharacters =
        Number(
            usage?.charactersRemaining ??
            0
        );

    const remainingRequests =
        Number(
            usage?.requestsRemaining ??
            0
        );

    const usageLimit =
        Number(
            usage
                ?.limits
                ?.dailyCharacterLimit ??
            0
        );

    /*
    |--------------------------------------------------------------------------
    | Friendly Error Handler
    |--------------------------------------------------------------------------
    */

    const getFriendlyError = (
        requestError
    ) => {
        const responseData =
            requestError
                ?.response
                ?.data;

        const message =
            responseData?.message ||
            requestError?.message ||
            "";

        const code =
            responseData?.code ||
            requestError?.code ||
            "";

        const status =
            requestError
                ?.response
                ?.status ||
            requestError?.status;

        if (
            code ===
            "USAGE_LIMIT_EXCEEDED"
        ) {
            return (
                message ||
                "Your daily application usage limit has been exceeded."
            );
        }

        if (
            code ===
            "TTS_QUOTA_EXCEEDED"
        ) {
            return (
                "ElevenLabs provider quota exceeded. " +
                message
            );
        }

        if (
            code ===
            "TTS_AUTHENTICATION_FAILED" &&
            (
                message
                    .toLowerCase()
                    .includes(
                        "quota"
                    ) ||
                message
                    .toLowerCase()
                    .includes(
                        "credits"
                    )
            )
        ) {
            return (
                "ElevenLabs provider quota exceeded. " +
                message
            );
        }

        if (
            code ===
            "TTS_MAX_CHARACTER_LIMIT_EXCEEDED"
        ) {
            return (
                message ||
                "The selected TTS model does not support this many characters in one request."
            );
        }

        if (
            code ===
            "TTS_RATE_LIMITED"
        ) {
            return (
                "The TTS provider is temporarily rate-limiting requests. Please try again later."
            );
        }

        if (
            status === 429
        ) {
            return (
                message ||
                "The TTS provider quota or rate limit has been exceeded. Please try again later."
            );
        }

        if (
            code ===
            "TTS_PROVIDER_UNAVAILABLE" ||
            code ===
            "TTS_PROVIDER_NETWORK_ERROR"
        ) {
            return (
                "The TTS provider is temporarily unavailable. Please try again later."
            );
        }

        if (
            code ===
            "TTS_PROVIDER_NOT_CONFIGURED"
        ) {
            return (
                "The TTS provider is not configured correctly on the backend."
            );
        }

        if (
            code ===
            "TTS_VOICE_NOT_CONFIGURED"
        ) {
            return (
                "The ElevenLabs voice is not configured correctly."
            );
        }

        if (
            code ===
            "LOCAL_TRANSLATION_FAILED" ||
            code ===
            "LOCAL_TRANSLATOR_NOT_CONFIGURED"
        ) {
            return (
                "Local translation is currently unavailable. Please check the translation service."
            );
        }

        if (
            code ===
            "EMPTY_TRANSLATION_RESULT"
        ) {
            return (
                "Translation returned empty text."
            );
        }

        return (
            message ||
            "Speech generation failed."
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Generate Speech
    |--------------------------------------------------------------------------
    */

    const handleGenerate =
        async () => {
            setError("");

            setSuccess("");

            if (!text.trim()) {
                setError(
                    "Please enter some text first."
                );

                return;
            }

            if (
                characterCount >
                MAX_TEXT_LENGTH
            ) {
                setError(
                    `Text cannot exceed ${MAX_TEXT_LENGTH.toLocaleString()} characters.`
                );

                return;
            }

            if (!sourceLanguage) {
                setError(
                    "Please select the original language."
                );

                return;
            }

            if (!targetLanguage) {
                setError(
                    "Please select the speech language."
                );

                return;
            }

            if (!voice) {
                setError(
                    "Please select a voice."
                );

                return;
            }

            if (
                usage?.charactersRemaining !==
                undefined &&
                characterCount >
                Number(
                    usage.charactersRemaining
                )
            ) {
                setError(
                    `This request requires ${characterCount.toLocaleString()} characters, but only ${Number(
                        usage.charactersRemaining
                    ).toLocaleString()} application characters remain today.`
                );

                return;
            }

            if (
                usage?.requestsRemaining !==
                undefined &&
                Number(
                    usage.requestsRemaining
                ) <= 0
            ) {
                setError(
                    "Your daily application request limit has been reached."
                );

                return;
            }

            try {
                setGenerating(true);

                let speechText =
                    text.trim();

                /*
                |--------------------------------------------------------------------------
                | Translation
                |--------------------------------------------------------------------------
                */

                if (
                    sourceLanguage !==
                    targetLanguage
                ) {
                    setTranslating(true);

                    const translation =
                        await translateText({
                            text:
                                text.trim(),

                            sourceLanguage,

                            targetLanguage
                        });

                    speechText =
                        translation
                            ?.translatedText ||
                        "";

                    setTranslatedText(
                        speechText
                    );

                    if (
                        !speechText.trim()
                    ) {
                        throw new Error(
                            "Translation returned empty text."
                        );
                    }
                } else {
                    setTranslatedText(
                        text.trim()
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Generate
                |--------------------------------------------------------------------------
                */

                const result =
                    await generateSpeech({
                        text:
                        speechText,

                        language:
                        targetLanguage,

                        voice,

                        speed,

                        stability,

                        similarityBoost,

                        style,

                        useSpeakerBoost
                    });

                /*
                |--------------------------------------------------------------------------
                | Cleanup Existing Audio
                |--------------------------------------------------------------------------
                */

                if (
                    audioUrl &&
                    audioUrl.startsWith(
                        "blob:"
                    )
                ) {
                    URL.revokeObjectURL(
                        audioUrl
                    );
                }

                setAudioUrl(
                    result.audioUrl
                );

                setAudioBlob(
                    result.blob
                );

                /*
                |--------------------------------------------------------------------------
                | Refresh Usage
                |--------------------------------------------------------------------------
                */

                try {
                    const updatedUsage =
                        await getUsage();

                    setUsage(
                        updatedUsage?.usage ||
                        null
                    );
                } catch {
                    /*
                     * Keep successful TTS
                     * successful even if
                     * usage refresh fails.
                     */
                }

                setSuccess(
                    sourceLanguage !==
                    targetLanguage
                        ? "Text translated and speech generated successfully."
                        : "Speech generated successfully."
                );
            } catch (
                requestError
                ) {
                setError(
                    getFriendlyError(
                        requestError
                    )
                );
            } finally {
                setGenerating(false);

                setTranslating(false);
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Clear Workspace
    |--------------------------------------------------------------------------
    */

    const clearText = () => {
        setText("");

        setTranslatedText("");

        setError("");

        setSuccess("");

        if (
            audioUrl &&
            audioUrl.startsWith(
                "blob:"
            )
        ) {
            URL.revokeObjectURL(
                audioUrl
            );
        }

        setAudioUrl("");

        setAudioBlob(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Download Audio
    |--------------------------------------------------------------------------
    */

    const downloadAudio = () => {
        if (
            !audioBlob ||
            !audioUrl
        ) {
            setError(
                "Generate speech before downloading."
            );

            return;
        }

        const link =
            document.createElement(
                "a"
            );

        link.href =
            audioUrl;

        link.download =
            "speech.mp3";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();
    };

    /*
    |--------------------------------------------------------------------------
    | Language Handlers
    |--------------------------------------------------------------------------
    */

    const handleSourceLanguageChange = (
        value
    ) => {
        setSourceLanguage(
            value
        );

        setTranslatedText("");

        setError("");

        setSuccess("");
    };

    const handleTargetLanguageChange = (
        value
    ) => {
        setTargetLanguage(
            value
        );

        setTranslatedText("");

        setError("");

        setSuccess("");
    };

    const handleVoiceChange = (
        value
    ) => {
        setVoice(
            value
        );

        setError("");

        setSuccess("");
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <main className="min-h-screen bg-transparent text-white">

            <AppNavigation />

            <div className="relative overflow-hidden">

                {/* Ambient background */}

                <div className="pointer-events-none absolute inset-0">

                    <div className="absolute left-[8%] top-[4%] h-72 w-72 rounded-full bg-indigo-600/[0.08] blur-3xl" />

                    <div className="absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-violet-500/[0.06] blur-3xl" />

                    <div className="absolute bottom-[10%] left-[40%] h-80 w-80 rounded-full bg-cyan-400/[0.035] blur-3xl" />

                </div>

                <div className="relative mx-auto max-w-[1480px] px-5 py-8 sm:px-6 lg:px-8 lg:py-10">

                    {/* =====================================================
                        HERO
                    ===================================================== */}

                    <section className="mb-8">

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                            <div className="max-w-4xl">

                                <div className="mb-3 flex flex-wrap items-center gap-2">

                                    <span className="vs-badge">

                                        <span className="vs-status-dot" />

                                        AI VOICE WORKSPACE

                                    </span>

                                    <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-[11px] font-semibold text-slate-500">

                                        {languages.length || "30+"}
                                        {" "}
                                        languages

                                    </span>

                                </div>

                                <p className="vs-eyebrow">

                                    <Icon
                                        name="sparkles"
                                        size={14}
                                    />

                                    Create

                                </p>

                                <h1 className="vs-title max-w-4xl text-[clamp(2.25rem,5vw,4.1rem)]">

                                    Turn your ideas into{" "}

                                    <span className="vs-gradient-text">
                                        natural voice.
                                    </span>

                                </h1>

                                <p className="vs-subtitle max-w-3xl text-base sm:text-lg">

                                    Write, translate, enhance, and generate
                                    studio-quality speech from one intelligent
                                    workspace.

                                </p>

                                {user?.email && (
                                    <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">

                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]" />

                                        Signed in as{" "}

                                        <span className="font-medium text-slate-400">
                                            {user.email}
                                        </span>

                                    </div>
                                )}

                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[440px]">

                                <MiniStat
                                    icon="globe"
                                    label="Languages"
                                    value={
                                        languages.length ||
                                        "Loading..."
                                    }
                                />

                                <MiniStat
                                    icon="volume"
                                    label="Voices"
                                    value={
                                        voices.length ||
                                        "Loading..."
                                    }
                                />

                                <MiniStat
                                    icon="wave"
                                    label="Characters"
                                    value={
                                        characterCount.toLocaleString()
                                    }
                                />

                            </div>

                        </div>

                    </section>

                    {/* =====================================================
                        ALERTS
                    ===================================================== */}

                    {error && (
                        <div className="vs-fade-up mb-6 rounded-2xl border border-rose-400/15 bg-rose-500/[0.07] p-4">

                            <div className="flex items-start gap-3">

                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300">
                                    !
                                </div>

                                <div className="min-w-0">

                                    <p className="text-sm font-semibold text-rose-200">
                                        Something needs your attention
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-rose-300/80">
                                        {error}
                                    </p>

                                    {error
                                            .toLowerCase()
                                            .includes(
                                                "elevenlabs"
                                            ) &&
                                        error
                                            .toLowerCase()
                                            .includes(
                                                "quota"
                                            ) && (
                                            <p className="mt-2 text-xs leading-5 text-rose-400/75">
                                                Your application usage limit
                                                and ElevenLabs provider quota
                                                are separate.
                                            </p>
                                        )}

                                </div>

                            </div>

                        </div>
                    )}

                    {success && (
                        <div className="vs-fade-up mb-6 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] p-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">

                                    <Icon
                                        name="check"
                                        size={17}
                                    />

                                </div>

                                <p className="text-sm font-semibold text-emerald-200">
                                    {success}
                                </p>

                            </div>

                        </div>
                    )}

                    {/* =====================================================
                        USAGE
                    ===================================================== */}

                    {usage && (
                        <section className="vs-card vs-glow mb-7 overflow-hidden p-5 sm:p-6">

                            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                                <div className="flex-1">

                                    <div className="flex flex-wrap items-center gap-3">

                                        <span className="vs-eyebrow">
                                            Usage
                                        </span>

                                        <span className="rounded-full border border-indigo-400/10 bg-indigo-500/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-300">
                                            Daily allowance
                                        </span>

                                    </div>

                                    <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">

                                        <span className="text-2xl font-extrabold tracking-tight text-white">
                                            {Number(
                                                usage.charactersUsed || 0
                                            ).toLocaleString()}
                                        </span>

                                        <span className="pb-0.5 text-sm text-slate-500">

                                            /

                                            {" "}

                                            {usageLimit.toLocaleString()}

                                            {" characters"}

                                        </span>

                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">

                                        {Number(
                                            usage.requestCount || 0
                                        ).toLocaleString()}

                                        {" / "}

                                        {Number(
                                            usage
                                                ?.limits
                                                ?.dailyRequestLimit || 0
                                        ).toLocaleString()}

                                        {" requests used today"}

                                    </p>

                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[460px]">

                                    <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">

                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                                            Remaining
                                        </p>

                                        <p className="mt-1 text-xl font-extrabold text-white">
                                            {remainingCharacters.toLocaleString()}
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-slate-600">
                                            characters
                                        </p>

                                    </div>

                                    <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">

                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                                            Requests
                                        </p>

                                        <p className="mt-1 text-xl font-extrabold text-white">
                                            {remainingRequests.toLocaleString()}
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-slate-600">
                                            remaining
                                        </p>

                                    </div>

                                    <div className="col-span-2 rounded-2xl border border-white/[0.06] bg-black/10 p-4 sm:col-span-1">

                                        <div className="flex items-center justify-between">

                                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                                                Used
                                            </p>

                                            <p className="text-sm font-bold text-indigo-200">

                                                {Math.round(
                                                    usagePercentage
                                                )}
                                                %

                                            </p>

                                        </div>

                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800/90">

                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_18px_rgba(99,102,241,0.35)] transition-all duration-700"
                                                style={{
                                                    width:
                                                        `${usagePercentage}%`
                                                }}
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </section>
                    )}

                    {/* =====================================================
                        UPLOAD + AI
                        HORIZONTAL RECTANGULAR ROW
                    ===================================================== */}

                    <section className="mb-7 grid items-start gap-6 lg:grid-cols-2">

                        {/* =================================================
                            UPLOAD
                        ================================================= */}

                        <section className="vs-card overflow-hidden">

                            <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-500/[0.07] text-cyan-300">

                                        <Icon
                                            name="file"
                                            size={19}
                                        />

                                    </div>

                                    <div>

                                        <p className="vs-eyebrow text-[10px]">
                                            Import
                                        </p>

                                        <h2 className="mt-1 text-lg font-bold text-white">
                                            Upload document
                                        </h2>

                                    </div>

                                </div>

                                <div className="flex items-center gap-2">

                                    <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[10px] font-bold text-slate-500">
                                        TXT
                                    </span>

                                    <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[10px] font-bold text-slate-500">
                                        PDF
                                    </span>

                                    <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[10px] font-bold text-slate-500">
                                        DOCX
                                    </span>

                                </div>

                            </div>

                            <div className="p-4 sm:p-5">

                                <p className="mb-4 text-sm leading-6 text-slate-500">
                                    Import your TXT, PDF, or DOCX content
                                    directly into the speech editor.
                                </p>

                                <FileUpload
                                    onTextExtracted={
                                        handleTextExtracted
                                    }
                                />

                            </div>

                        </section>

                        {/* =================================================
                            AI COPILOT
                        ================================================= */}

                        <section className="vs-card overflow-hidden">

                            <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-500/[0.08] text-violet-300">

                                        <Icon
                                            name="sparkles"
                                            size={19}
                                        />

                                    </div>

                                    <div>

                                        <p className="vs-eyebrow text-[10px]">
                                            Intelligence
                                        </p>

                                        <h2 className="mt-1 text-lg font-bold text-white">
                                            AI Copilot
                                        </h2>

                                    </div>

                                </div>

                                <span className="self-start rounded-full border border-emerald-400/10 bg-emerald-500/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300 sm:self-auto">
                                    AI Ready
                                </span>

                            </div>

                            <div className="p-4 sm:p-5">

                                <p className="mb-4 text-sm leading-6 text-slate-500">
                                    Refine, simplify, rewrite, or improve
                                    your text before speech generation.
                                </p>

                                <AIEnhancement
                                    text={
                                        text
                                    }
                                    onApplyText={
                                        (enhancedText) => {
                                            setText(
                                                enhancedText ||
                                                ""
                                            );

                                            setTranslatedText("");

                                            setError("");

                                            setSuccess(
                                                "AI-enhanced text applied to the editor."
                                            );
                                        }
                                    }
                                />

                            </div>

                        </section>

                    </section>

                    {/* =====================================================
                        MAIN WORKSPACE
                    ===================================================== */}

                    <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(370px,0.72fr)]">

                        {/* =================================================
                            LEFT - VOICE INPUT
                        ================================================= */}

                        <section className="vs-card overflow-hidden">

                            <div className="flex flex-col gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.08] text-indigo-300 shadow-[0_8px_24px_rgba(79,70,229,0.12)]">

                                        <Icon
                                            name="wave"
                                            size={20}
                                        />

                                    </div>

                                    <div>

                                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-300">
                                            Voice Input
                                        </p>

                                        <h2 className="mt-1 text-lg font-bold text-white">
                                            Your script
                                        </h2>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        clearText
                                    }
                                    disabled={
                                        !text &&
                                        !translatedText &&
                                        !audioUrl
                                    }
                                    className="vs-secondary-button sm:w-auto"
                                >
                                    Clear workspace
                                </button>

                            </div>

                            <div className="p-5 sm:p-6">

                                {/* Editor toolbar */}

                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">

                                    <div className="flex items-center gap-2 text-xs text-slate-500">

                                        <span className="flex items-center gap-1.5">

                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />

                                            Maximum
                                            {" "}
                                            {MAX_TEXT_LENGTH.toLocaleString()}
                                            {" characters"}

                                        </span>

                                    </div>

                                    <div
                                        className={
                                            `rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                                characterCount >=
                                                MAX_TEXT_LENGTH * 0.9
                                                    ? "border-rose-400/15 bg-rose-500/[0.06] text-rose-300"
                                                    : "border-white/[0.06] bg-white/[0.025] text-slate-500"
                                            }`
                                        }
                                    >
                                        {characterCount.toLocaleString()}
                                        {" / "}
                                        {MAX_TEXT_LENGTH.toLocaleString()}
                                    </div>

                                </div>

                                {/* Text Editor */}

                                <div className="relative">

                                    <textarea
                                        value={
                                            text
                                        }
                                        maxLength={
                                            MAX_TEXT_LENGTH
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            setText(
                                                event.target.value
                                            );

                                            setTranslatedText("");

                                            setError("");

                                            setSuccess("");
                                        }}
                                        placeholder={
                                            "Write your script here...\n\nTell a story.\nCreate a voiceover.\nDraft a lesson.\nWrite an announcement.\nOr paste your document content."
                                        }
                                        className="vs-textarea min-h-[430px] resize-y !rounded-[22px] !p-5 sm:!min-h-[500px] sm:!p-6"
                                    />

                                    <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-between sm:bottom-5 sm:left-5 sm:right-5">

                                        <div className="rounded-full border border-white/[0.05] bg-slate-950/75 px-3 py-1.5 text-[10px] font-semibold text-slate-600 backdrop-blur-xl">

                                            {wordCount.toLocaleString()}

                                            {" "}

                                            {wordCount ===
                                            1
                                                ? "word"
                                                : "words"}

                                        </div>

                                        <div className="rounded-full border border-white/[0.05] bg-slate-950/75 px-3 py-1.5 text-[10px] font-semibold text-slate-500 backdrop-blur-xl">
                                            UTF-8
                                        </div>

                                    </div>

                                </div>

                                {/* Editor stats */}

                                <div className="mt-4 grid gap-3 sm:grid-cols-3">

                                    <MiniStat
                                        icon="wave"
                                        label="Characters"
                                        value={
                                            characterCount.toLocaleString()
                                        }
                                    />

                                    <MiniStat
                                        icon="file"
                                        label="Words"
                                        value={
                                            wordCount.toLocaleString()
                                        }
                                    />

                                    <MiniStat
                                        icon="globe"
                                        label="Target"
                                        value={
                                            targetLanguage ||
                                            "Not selected"
                                        }
                                    />

                                </div>

                                {/* Translation preview */}

                                {translatedText &&
                                    sourceLanguage !==
                                    targetLanguage && (
                                        <div className="vs-fade-up mt-5 overflow-hidden rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.045]">

                                            <div className="flex items-center justify-between border-b border-indigo-400/[0.08] px-4 py-3">

                                                <div className="flex items-center gap-2">

                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">

                                                        <Icon
                                                            name="globe"
                                                            size={14}
                                                        />

                                                    </div>

                                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-200">
                                                        Translation preview
                                                    </p>

                                                </div>

                                                <span className="rounded-full bg-indigo-500/[0.08] px-2.5 py-1 text-[10px] font-bold text-indigo-300">
                                                    {targetLanguage}
                                                </span>

                                            </div>

                                            <p className="max-h-52 overflow-y-auto whitespace-pre-wrap px-4 py-4 text-sm leading-7 text-slate-300">
                                                {translatedText}
                                            </p>

                                        </div>
                                    )}

                                {/* Generate */}

                                <button
                                    type="button"
                                    onClick={
                                        handleGenerate
                                    }
                                    disabled={
                                        loading ||
                                        generating ||
                                        !text.trim() ||
                                        characterCount >
                                        MAX_TEXT_LENGTH
                                    }
                                    className="vs-primary-button mt-5 w-full !rounded-2xl !py-4 text-sm sm:text-base"
                                >

                                    {translating ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />

                                            Translating your script...
                                        </>
                                    ) : generating ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />

                                            Generating your voice...
                                        </>
                                    ) : (
                                        <>
                                            <Icon
                                                name="sparkles"
                                                size={19}
                                            />

                                            {sourceLanguage !==
                                            targetLanguage
                                                ? "Translate & Generate Speech"
                                                : "Generate Speech"}

                                            <Icon
                                                name="arrow"
                                                size={17}
                                            />
                                        </>
                                    )}

                                </button>

                                {loading && (
                                    <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-600">

                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />

                                        Loading your voice workspace...

                                    </div>
                                )}

                            </div>

                        </section>

                        {/* =================================================
                            RIGHT - VOICE SETTINGS + STATUS
                        ================================================= */}

                        <div className="space-y-6">

                            {/* Voice Settings */}

                            <section className="vs-card overflow-hidden">

                                <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">

                                    <div className="flex items-center justify-between gap-4">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/10 bg-violet-500/[0.08] text-violet-300">

                                                <Icon
                                                    name="volume"
                                                    size={19}
                                                />

                                            </div>

                                            <div>

                                                <p className="vs-eyebrow text-[10px]">
                                                    Voice Engine
                                                </p>

                                                <h2 className="mt-1 text-lg font-bold text-white">
                                                    Voice settings
                                                </h2>

                                            </div>

                                        </div>

                                        <span className="rounded-full border border-emerald-400/10 bg-emerald-500/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                                            Ready
                                        </span>

                                    </div>

                                    <p className="mt-3 text-xs leading-5 text-slate-500">
                                        Tune language, voice, speed, stability,
                                        similarity, and speaking style.
                                    </p>

                                </div>

                                <div className="p-3 sm:p-4">

                                    <VoiceSettings
                                        languages={
                                            languages
                                        }

                                        voices={
                                            voices
                                        }

                                        sourceLanguage={
                                            sourceLanguage
                                        }

                                        targetLanguage={
                                            targetLanguage
                                        }

                                        voice={
                                            voice
                                        }

                                        speed={
                                            speed
                                        }

                                        stability={
                                            stability
                                        }

                                        similarityBoost={
                                            similarityBoost
                                        }

                                        style={
                                            style
                                        }

                                        useSpeakerBoost={
                                            useSpeakerBoost
                                        }

                                        onSourceLanguageChange={
                                            handleSourceLanguageChange
                                        }

                                        onTargetLanguageChange={
                                            handleTargetLanguageChange
                                        }

                                        onVoiceChange={
                                            handleVoiceChange
                                        }

                                        onSpeedChange={
                                            (value) =>
                                                setSpeed(
                                                    value
                                                )
                                        }

                                        onStabilityChange={
                                            (value) =>
                                                setStability(
                                                    value
                                                )
                                        }

                                        onSimilarityChange={
                                            (value) =>
                                                setSimilarityBoost(
                                                    value
                                                )
                                        }

                                        onStyleChange={
                                            (value) =>
                                                setStyle(
                                                    value
                                                )
                                        }

                                        onSpeakerBoostChange={
                                            (value) =>
                                                setUseSpeakerBoost(
                                                    value
                                                )
                                        }
                                    />

                                </div>

                            </section>

                            {/* Workspace Status */}

                            <section className="vs-glass rounded-3xl p-5">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="vs-eyebrow text-[10px]">
                                            Workspace status
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-slate-200">

                                            {generating
                                                ? "Generating speech..."
                                                : audioUrl
                                                    ? "Audio ready"
                                                    : "Ready to create"}

                                        </p>

                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-500/[0.05] text-emerald-300">

                                        <Icon
                                            name={
                                                generating
                                                    ? "clock"
                                                    : "check"
                                            }
                                            size={17}
                                        />

                                    </div>

                                </div>

                                <div className="mt-4 h-px bg-white/[0.06]" />

                                <div className="mt-4 grid grid-cols-2 gap-3">

                                    <div>

                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                                            Source
                                        </p>

                                        <p className="mt-1 truncate text-xs font-semibold text-slate-300">
                                            {sourceLanguage ||
                                                "Not selected"}
                                        </p>

                                    </div>

                                    <div>

                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                                            Speech
                                        </p>

                                        <p className="mt-1 truncate text-xs font-semibold text-slate-300">
                                            {targetLanguage ||
                                                "Not selected"}
                                        </p>

                                    </div>

                                </div>

                            </section>

                        </div>

                    </section>

                    {/* =====================================================
                        GENERATED AUDIO
                        FULL WIDTH BELOW MAIN WORKSPACE
                    ===================================================== */}

                    <section className="vs-card mt-6 overflow-hidden">

                        <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">

                            <div className="flex items-center justify-between gap-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-500/[0.07] text-cyan-300">

                                        <Icon
                                            name="wave"
                                            size={20}
                                        />

                                    </div>

                                    <div>

                                        <p className="vs-eyebrow text-[10px]">
                                            Output Studio
                                        </p>

                                        <h2 className="mt-1 text-lg font-bold text-white">
                                            Generated audio
                                        </h2>

                                    </div>

                                </div>

                                {audioUrl && (
                                    <span className="rounded-full border border-emerald-400/10 bg-emerald-500/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                                        Audio Ready
                                    </span>
                                )}

                            </div>

                        </div>

                        <div className="p-4 sm:p-5">

                            <AudioPlayer
                                audioUrl={
                                    audioUrl
                                }

                                onDownload={
                                    downloadAudio
                                }
                            />

                        </div>

                    </section>

                    {/* =====================================================
                        FOOTER CTA
                    ===================================================== */}

                    <section className="relative mt-6 overflow-hidden rounded-[28px] border border-indigo-400/10 bg-gradient-to-r from-indigo-500/[0.08] via-violet-500/[0.055] to-cyan-400/[0.035] p-6 sm:p-7">

                        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/[0.08] blur-3xl" />

                        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                            <div>

                                <p className="vs-eyebrow text-[10px]">
                                    Voice Studio
                                </p>

                                <h3 className="mt-2 text-xl font-bold tracking-tight text-white">
                                    Build your next voice experience.
                                </h3>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    Create, refine, translate, and store speech
                                    from one polished workspace.
                                </p>

                            </div>

                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">

                                <Icon
                                    name="refresh"
                                    size={15}
                                />

                                Your workspace is synced with your account.

                            </div>

                        </div>

                    </section>

                </div>

            </div>

        </main>
    );
};

export default Dashboard;