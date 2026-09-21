import {
    useState
} from "react";

import {
    summarizeText,
    correctGrammar,
    rewriteText,
    makeConversational
} from "../services/aiService.js";

const AIEnhancement = ({
                           text,
                           onApplyText
                       }) => {
    const [processingOperation, setProcessingOperation] =
        useState("");

    const [result, setResult] =
        useState("");

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | Operation configuration
    |--------------------------------------------------------------------------
    */

    const operations = [
        {
            key: "summarize",
            label: "Summarize",
            description:
                "Create a shorter, focused version of your content.",
            accent: "indigo",
            icon: (
                <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 5h16" />
                    <path d="M4 9h12" />
                    <path d="M4 13h16" />
                    <path d="M4 17h9" />
                </svg>
            )
        },
        {
            key: "grammar",
            label: "Grammar",
            description:
                "Correct common grammar, spelling, and punctuation issues.",
            accent: "cyan",
            icon: (
                <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M4 19h4" />
                    <path d="M6 5v14" />
                    <path d="M4 5h7" />
                    <path d="M4 5c4 0 6 2 6 5s-2 5-6 5" />
                    <path d="M14 18l3-9 3 9" />
                    <path d="M15 15h4" />
                </svg>
            )
        },
        {
            key: "rewrite",
            label: "Rewrite",
            description:
                "Turn your content into a cleaner and more polished version.",
            accent: "violet",
            icon: (
                <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                </svg>
            )
        },
        {
            key: "conversational",
            label: "Conversational",
            description:
                "Make the text sound natural, friendly, and easier to listen to.",
            accent: "fuchsia",
            icon: (
                <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.7 9.7 0 0 1-4.6-1.1L3 20l1.5-3.8A8.2 8.2 0 0 1 3 11.5 8.6 8.6 0 0 1 12 3a8.6 8.6 0 0 1 9 8.5Z" />
                    <path d="M8 12h.01" />
                    <path d="M12 12h.01" />
                    <path d="M16 12h.01" />
                </svg>
            )
        }
    ];

    /*
    |--------------------------------------------------------------------------
    | Operation label
    |--------------------------------------------------------------------------
    */

    const getOperationLabel = (
        operation
    ) => {
        const item =
            operations.find(
                (entry) =>
                    entry.key === operation
            );

        return (
            item?.label ||
            "AI enhancement"
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Run AI operation
    |--------------------------------------------------------------------------
    */

    const runOperation = async (
        operation
    ) => {
        setError("");
        setSuccess("");
        setResult("");

        if (
            !text ||
            !text.trim()
        ) {
            setError(
                "Enter some text before using AI enhancement."
            );

            return;
        }

        try {
            setProcessingOperation(
                operation
            );

            let response;

            switch (
                operation
                ) {
                case "summarize":
                    response =
                        await summarizeText(
                            text
                        );
                    break;

                case "grammar":
                    response =
                        await correctGrammar(
                            text
                        );
                    break;

                case "rewrite":
                    response =
                        await rewriteText(
                            text
                        );
                    break;

                case "conversational":
                    response =
                        await makeConversational(
                            text
                        );
                    break;

                default:
                    throw new Error(
                        "Unsupported AI operation."
                    );
            }

            const enhancedText =
                response?.enhancedText ||
                "";

            if (
                !enhancedText.trim()
            ) {
                throw new Error(
                    "AI enhancement returned empty text."
                );
            }

            setResult(
                enhancedText
            );

            setSuccess(
                `${getOperationLabel(operation)} completed successfully.`
            );
        } catch (
            requestError
            ) {
            const message =
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                requestError?.message ||
                "AI enhancement failed.";

            setError(
                message
            );
        } finally {
            setProcessingOperation(
                ""
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Apply result
    |--------------------------------------------------------------------------
    */

    const applyResult = () => {
        if (
            !result.trim()
        ) {
            return;
        }

        onApplyText(
            result
        );

        setSuccess(
            "AI-enhanced text applied to the editor."
        );

        setError("");
    };

    /*
    |--------------------------------------------------------------------------
    | Clear result
    |--------------------------------------------------------------------------
    */

    const clearResult = () => {
        setResult("");
        setError("");
        setSuccess("");
    };

    /*
    |--------------------------------------------------------------------------
    | Loading state
    |--------------------------------------------------------------------------
    */

    const isProcessing =
        Boolean(
            processingOperation
        );

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <section
            className="
                vs-card
                relative
                overflow-hidden
                p-6
                sm:p-7
            "
        >

            {/* Ambient AI glow */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -right-24
                    -top-24
                    h-56
                    w-56
                    rounded-full
                    bg-violet-500/10
                    blur-3xl
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    -bottom-28
                    -left-16
                    h-48
                    w-48
                    rounded-full
                    bg-cyan-500/5
                    blur-3xl
                "
            />

            <div className="relative">

                {/* ---------------------------------------------------------------- */}
                {/* Header */}
                {/* ---------------------------------------------------------------- */}

                <div className="mb-7">

                    <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                            <div className="mb-3 flex items-center gap-2">

                                <div
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-violet-400/20
                                        bg-violet-500/10
                                        text-violet-300
                                    "
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m12 3-1.3 3.7L7 8l3.7 1.3L12 13l1.3-3.7L17 8l-3.7-1.3Z" />
                                        <path d="m19 13-.7 2.3L16 16l2.3.7L19 19l.7-2.3L22 16l-2.3-.7Z" />
                                        <path d="m5 14-.7 2.3L2 17l2.3.7L5 20l.7-2.3L8 17l-2.3-.7Z" />
                                    </svg>
                                </div>

                                <p className="vs-eyebrow">
                                    AI Copilot
                                </p>

                            </div>

                            <h2 className="vs-title text-2xl sm:text-3xl">
                                Enhance your text
                            </h2>

                            <p className="vs-subtitle mt-2 max-w-2xl">
                                Refine, simplify, or transform your content
                                before sending it to the speech engine.
                            </p>

                        </div>

                        {/* AI status */}

                        <div
                            className="
                                hidden
                                shrink-0
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-emerald-400/10
                                bg-emerald-400/[0.05]
                                px-3
                                py-1.5
                                sm:flex
                            "
                        >
                            <span
                                className="
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-emerald-400
                                    shadow-[0_0_8px_rgba(52,211,153,0.7)]
                                "
                            />

                            <span className="text-[10px] font-semibold text-emerald-300">
                                AI READY
                            </span>
                        </div>

                    </div>

                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Operations */}
                {/* ---------------------------------------------------------------- */}

                <div className="grid gap-3 sm:grid-cols-2">

                    {operations.map(
                        (
                            item
                        ) => {

                            const isItemProcessing =
                                processingOperation ===
                                item.key;

                            const disabled =
                                isProcessing;

                            return (
                                <button
                                    key={
                                        item.key
                                    }
                                    type="button"
                                    onClick={() =>
                                        runOperation(
                                            item.key
                                        )
                                    }
                                    disabled={
                                        disabled
                                    }
                                    className="
                                        group
                                        relative
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-white/[0.07]
                                        bg-slate-950/45
                                        p-4
                                        text-left
                                        transition-all
                                        duration-300
                                        hover:border-indigo-400/20
                                        hover:bg-white/[0.025]
                                        hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-45
                                    "
                                >

                                    {/* Hover glow */}

                                    <div
                                        className="
                                            pointer-events-none
                                            absolute
                                            -right-8
                                            -top-8
                                            h-20
                                            w-20
                                            rounded-full
                                            bg-indigo-500/0
                                            blur-2xl
                                            transition
                                            duration-300
                                            group-hover:bg-indigo-500/10
                                        "
                                    />

                                    <div className="relative">

                                        <div className="flex items-start gap-3">

                                            {/* Icon */}

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
                                                    border-white/[0.07]
                                                    bg-white/[0.03]
                                                    text-indigo-300
                                                    transition
                                                    group-hover:border-indigo-400/20
                                                    group-hover:bg-indigo-500/10
                                                "
                                            >
                                                {isItemProcessing ? (
                                                    <svg
                                                        className="animate-spin"
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="9"
                                                            stroke="currentColor"
                                                            strokeOpacity="0.18"
                                                            strokeWidth="2"
                                                        />

                                                        <path
                                                            d="M21 12a9 9 0 0 0-9-9"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                ) : (
                                                    item.icon
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <div className="flex items-center justify-between gap-3">

                                                    <span className="text-sm font-semibold text-white">
                                                        {isItemProcessing
                                                            ? "Processing..."
                                                            : item.label}
                                                    </span>

                                                    <span
                                                        className="
                                                            text-slate-600
                                                            transition
                                                            group-hover:translate-x-0.5
                                                            group-hover:text-indigo-300
                                                        "
                                                    >
                                                        <svg
                                                            width="15"
                                                            height="15"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.8"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d="M5 12h13" />
                                                            <path d="m13 6 6 6-6 6" />
                                                        </svg>
                                                    </span>

                                                </div>

                                                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                                                    {item.description}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </button>
                            );
                        }
                    )}

                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Helper text */}
                {/* ---------------------------------------------------------------- */}

                <div
                    className="
                        mt-4
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-white/5
                        bg-white/[0.02]
                        px-3.5
                        py-2.5
                    "
                >

                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-slate-600"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        />

                        <path d="M12 11v5" />
                        <path d="M12 8h.01" />
                    </svg>

                    <p className="text-[10px] leading-5 text-slate-600">
                        AI tools work with the text currently loaded in your speech editor.
                    </p>

                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Error */}
                {/* ---------------------------------------------------------------- */}

                {error && (
                    <div
                        className="
                            mt-5
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-red-500/20
                            bg-red-500/[0.07]
                            px-4
                            py-3.5
                        "
                    >

                        <span
                            className="
                                flex
                                h-6
                                w-6
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-red-500/10
                                text-xs
                                font-bold
                                text-red-300
                            "
                        >
                            !
                        </span>

                        <p className="pt-0.5 text-sm leading-6 text-red-300">
                            {error}
                        </p>

                    </div>
                )}

                {/* ---------------------------------------------------------------- */}
                {/* Success */}
                {/* ---------------------------------------------------------------- */}

                {success && (
                    <div
                        className="
                            mt-5
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-emerald-500/20
                            bg-emerald-500/[0.07]
                            px-4
                            py-3.5
                        "
                    >

                        <span
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
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m5 12 4 4L19 6" />
                            </svg>
                        </span>

                        <p className="pt-0.5 text-sm leading-6 text-emerald-300">
                            {success}
                        </p>

                    </div>
                )}

                {/* ---------------------------------------------------------------- */}
                {/* Enhanced result */}
                {/* ---------------------------------------------------------------- */}

                {result && (
                    <div
                        className="
                            mt-7
                            overflow-hidden
                            rounded-3xl
                            border
                            border-indigo-400/10
                            bg-slate-950/45
                        "
                    >

                        {/* Result header */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                                border-b
                                border-white/5
                                p-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                sm:px-5
                            "
                        >

                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-indigo-400/15
                                        bg-indigo-500/10
                                        text-indigo-300
                                    "
                                >
                                    <svg
                                        width="17"
                                        height="17"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M4 6h16" />
                                        <path d="M4 10h11" />
                                        <path d="M4 14h16" />
                                        <path d="M4 18h8" />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
                                        Enhanced Result
                                    </p>

                                    <p className="mt-1 text-[10px] text-slate-600">
                                        Review and edit before applying
                                    </p>
                                </div>

                            </div>

                            <div className="flex items-center gap-2">

                                <button
                                    type="button"
                                    onClick={
                                        clearResult
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-1.5
                                        rounded-xl
                                        border
                                        border-white/8
                                        bg-white/[0.02]
                                        px-3
                                        py-2.5
                                        text-xs
                                        font-semibold
                                        text-slate-400
                                        transition
                                        hover:bg-white/[0.05]
                                        hover:text-white
                                    "
                                >
                                    <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4h8v2" />
                                        <path d="M19 6l-1 14H6L5 6" />
                                    </svg>

                                    Clear
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        applyResult
                                    }
                                    className="
                                        vs-primary-button
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        px-4
                                        py-2.5
                                        text-xs
                                    "
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M5 12h14" />
                                        <path d="m13 6 6 6-6 6" />
                                    </svg>

                                    Use This Text
                                </button>

                            </div>

                        </div>

                        {/* Result editor */}

                        <div className="p-4 sm:p-5">

                            <textarea
                                value={
                                    result
                                }
                                onChange={(
                                    event
                                ) =>
                                    setResult(
                                        event.target.value
                                    )
                                }
                                className="
                                    vs-textarea
                                    min-h-[240px]
                                    w-full
                                    resize-y
                                    leading-7
                                "
                                placeholder="Your enhanced text will appear here..."
                            />

                            {/* Result meta */}

                            <div
                                className="
                                    mt-3
                                    flex
                                    flex-wrap
                                    items-center
                                    justify-between
                                    gap-2
                                "
                            >

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        text-[10px]
                                        text-slate-600
                                    "
                                >
                                    <span className="vs-status-dot" />
                                    Editable AI output
                                </span>

                                <span className="text-[10px] text-slate-600">
                                    {result.length.toLocaleString()} characters
                                </span>

                            </div>

                        </div>

                    </div>
                )}

            </div>

        </section>
    );
};

export default AIEnhancement;