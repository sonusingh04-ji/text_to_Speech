import React, {
    useMemo
} from "react";


/*
|--------------------------------------------------------------------------
| Inline SVG Icon
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

        case "globe":
            return (
                <svg {...commonProps}>
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />
                    <path d="M3 12h18" />
                    <path d="M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9" />
                    <path d="M12 3c-2.2 2.4-3.3 5.4-3.3 9s1.1 6.6 3.3 9" />
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

        case "gauge":
            return (
                <svg {...commonProps}>
                    <path d="M4.5 16a8 8 0 1 1 15 0" />
                    <path d="m12 12 3-3" />
                    <circle
                        cx="12"
                        cy="12"
                        r="1"
                    />
                </svg>
            );

        case "sparkles":
            return (
                <svg {...commonProps}>
                    <path d="M12 3l1.25 4.75L18 9l-4.75 1.25L12 15l-1.25-4.75L6 9l4.75-1.25L12 3Z" />
                    <path d="m19 14 .65 2.35L22 17l-2.35.65L19 20l-.65-2.35L16 17l2.35-.65L19 14Z" />
                </svg>
            );

        case "wand":
            return (
                <svg {...commonProps}>
                    <path d="m15 4 5 5" />
                    <path d="M4 20 17 7" />
                    <path d="m6 4 .6 1.8L8.5 6.5 6.6 7.2 6 9l-.6-1.8-1.9-.7 1.9-.7L6 4Z" />
                    <path d="m19 14 .5 1.5L21 16l-1.5.5L19 18l-.5-1.5L17 16l1.5-.5L19 14Z" />
                </svg>
            );

        case "check":
            return (
                <svg {...commonProps}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );

        case "info":
            return (
                <svg {...commonProps}>
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />
                    <path d="M12 10v6" />
                    <path d="M12 7h.01" />
                </svg>
            );

        default:
            return null;
    }
};


/*
|--------------------------------------------------------------------------
| Language label helper
|--------------------------------------------------------------------------
*/
const getLanguageLabel = (
    languages,
    code
) => {

    if (
        !code
    ) {
        return "Not selected";
    }


    const item =
        languages.find(
            (language) =>
                language?.code === code
        );


    return (
        item?.name ||
        item?.label ||
        code
    );
};


/*
|--------------------------------------------------------------------------
| Voice label helper
|--------------------------------------------------------------------------
*/
const getVoiceLabel = (
    voices,
    id
) => {

    if (
        !id
    ) {
        return "Not selected";
    }


    const item =
        voices.find(
            (voiceItem) =>
                voiceItem?.id === id
        );


    return (
        item?.name ||
        item?.id ||
        id
    );
};


/*
|--------------------------------------------------------------------------
| Voice Settings
|--------------------------------------------------------------------------
*/
const VoiceSettings = ({
                           languages,
                           voices,

                           sourceLanguage,
                           targetLanguage,
                           voice,

                           speed,
                           stability,
                           similarityBoost,
                           style,
                           useSpeakerBoost,

                           onSourceLanguageChange,
                           onTargetLanguageChange,
                           onVoiceChange,

                           onSpeedChange,
                           onStabilityChange,
                           onSimilarityChange,
                           onStyleChange,
                           onSpeakerBoostChange
                       }) => {

    /*
    |--------------------------------------------------------------------------
    | Safe collections
    |--------------------------------------------------------------------------
    */
    const safeLanguages =
        Array.isArray(
            languages
        )
            ? languages
            : [];


    const safeVoices =
        Array.isArray(
            voices
        )
            ? voices
            : [];


    /*
    |--------------------------------------------------------------------------
    | Filter voices for selected speech language
    |--------------------------------------------------------------------------
    */
    const filteredVoices =
        safeVoices.filter(
            (
                item
            ) =>
                !item?.language ||
                item.language ===
                "multilingual" ||
                item.language ===
                targetLanguage
        );


    const visibleVoices =
        filteredVoices.length >
        0

            ? filteredVoices

            : safeVoices;


    /*
    |--------------------------------------------------------------------------
    | Derived labels
    |--------------------------------------------------------------------------
    */
    const sourceLanguageLabel =
        useMemo(
            () =>
                getLanguageLabel(
                    safeLanguages,
                    sourceLanguage
                ),
            [
                safeLanguages,
                sourceLanguage
            ]
        );


    const targetLanguageLabel =
        useMemo(
            () =>
                getLanguageLabel(
                    safeLanguages,
                    targetLanguage
                ),
            [
                safeLanguages,
                targetLanguage
            ]
        );


    const voiceLabel =
        useMemo(
            () =>
                getVoiceLabel(
                    safeVoices,
                    voice
                ),
            [
                safeVoices,
                voice
            ]
        );


    return (
        <section className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-slate-950/55 shadow-[0_18px_55px_rgba(2,6,23,0.3)]">

            {/* -------------------------------------------------------------- */}
            {/* Ambient glow */}
            {/* -------------------------------------------------------------- */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/[0.08] blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-indigo-500/[0.06] blur-3xl" />


            {/* -------------------------------------------------------------- */}
            {/* Header */}
            {/* -------------------------------------------------------------- */}
            <div className="relative border-b border-white/[0.06] px-5 py-5 sm:px-6">

                <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-indigo-500/[0.06] text-violet-300 shadow-[0_10px_30px_rgba(124,58,237,0.1)]">

                            <Icon
                                name="volume"
                                size={20}
                            />

                        </div>


                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-300">
                                    Voice Engine
                                </p>


                                <span className="rounded-full border border-emerald-400/10 bg-emerald-500/[0.055] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                                    Active
                                </span>

                            </div>


                            <h2 className="mt-1 text-lg font-bold tracking-tight text-white">
                                Voice Settings
                            </h2>

                        </div>

                    </div>


                    <div className="hidden rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-right sm:block">

                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                            Preset
                        </p>

                        <p className="mt-0.5 text-xs font-bold text-slate-300">
                            Custom
                        </p>

                    </div>

                </div>


                <p className="mt-4 max-w-xl text-xs leading-5 text-slate-500">
                    Fine-tune the language, voice, pace, stability,
                    similarity, and speaking style of your generated speech.
                </p>


                {/* Current configuration */}
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">

                    <ConfigChip
                        icon="globe"
                        label="Source"
                        value={
                            sourceLanguageLabel
                        }
                    />


                    <ConfigChip
                        icon="globe"
                        label="Speech"
                        value={
                            targetLanguageLabel
                        }
                    />


                    <ConfigChip
                        icon="volume"
                        label="Voice"
                        value={
                            voiceLabel
                        }
                    />

                </div>

            </div>


            {/* -------------------------------------------------------------- */}
            {/* Controls */}
            {/* -------------------------------------------------------------- */}
            <div className="relative space-y-3 p-4 sm:p-5">


                {/* ========================================================== */}
                {/* Language group */}
                {/* ========================================================== */}

                <ControlGroup
                    number="01"
                    title="Language & Voice"
                    icon="globe"
                    description="Choose what you are writing and which language the voice should speak."
                >

                    <div className="grid gap-4">

                        <SelectControl
                            label="Original Language"
                            hint="Input"
                            value={
                                sourceLanguage
                            }
                            options={
                                safeLanguages
                            }
                            getOptionValue={
                                (item) =>
                                    item.code
                            }
                            getOptionLabel={
                                (item) =>
                                    item.name ||
                                    item.label ||
                                    item.code
                            }
                            onChange={
                                onSourceLanguageChange
                            }
                        />


                        <SelectControl
                            label="Speech Language"
                            hint="Output"
                            value={
                                targetLanguage
                            }
                            options={
                                safeLanguages
                            }
                            getOptionValue={
                                (item) =>
                                    item.code
                            }
                            getOptionLabel={
                                (item) =>
                                    item.name ||
                                    item.label ||
                                    item.code
                            }
                            onChange={
                                onTargetLanguageChange
                            }
                        />


                        <SelectControl
                            label="Voice"
                            hint={
                                `${visibleVoices.length} available`
                            }
                            value={
                                voice
                            }
                            options={
                                visibleVoices
                            }
                            getOptionValue={
                                (item) =>
                                    item.id
                            }
                            getOptionLabel={
                                (item) => {

                                    const gender =
                                        item.gender &&
                                        item.gender !==
                                        "unknown"

                                            ? ` — ${item.gender}`

                                            : "";


                                    return (
                                            item.name ||
                                            item.id ||
                                            "Voice"
                                        ) +
                                        gender;
                                }
                            }
                            onChange={
                                onVoiceChange
                            }
                        />

                    </div>


                    {visibleVoices.length === 0 && (

                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/10 bg-amber-500/[0.045] px-3 py-2.5">

                            <div className="mt-0.5 text-amber-300">

                                <Icon
                                    name="info"
                                    size={15}
                                />

                            </div>


                            <p className="text-xs leading-5 text-amber-200/75">
                                No configured voices are available for the
                                selected speech language.
                            </p>

                        </div>

                    )}

                </ControlGroup>


                {/* ========================================================== */}
                {/* Voice controls */}
                {/* ========================================================== */}

                <ControlGroup
                    number="02"
                    title="Voice Character"
                    icon="gauge"
                    description="Shape the pacing and personality of the generated voice."
                >

                    <div className="space-y-3">

                        <RangeControl
                            label="Speed"
                            description="Speaking pace"
                            value={
                                speed
                            }
                            min={
                                0.7
                            }
                            max={
                                1.2
                            }
                            step={
                                0.05
                            }
                            onChange={
                                onSpeedChange
                            }
                            formatValue={
                                (value) =>
                                    `${Number(value).toFixed(2)}×`
                            }
                            accent="indigo"
                        />


                        <RangeControl
                            label="Stability"
                            description="Consistency of delivery"
                            value={
                                stability
                            }
                            min={
                                0
                            }
                            max={
                                1
                            }
                            step={
                                0.05
                            }
                            onChange={
                                onStabilityChange
                            }
                            formatValue={
                                (value) =>
                                    `${Math.round(
                                        Number(value) *
                                        100
                                    )}%`
                            }
                            accent="violet"
                        />


                        <RangeControl
                            label="Similarity Boost"
                            description="Voice identity strength"
                            value={
                                similarityBoost
                            }
                            min={
                                0
                            }
                            max={
                                1
                            }
                            step={
                                0.05
                            }
                            onChange={
                                onSimilarityChange
                            }
                            formatValue={
                                (value) =>
                                    `${Math.round(
                                        Number(value) *
                                        100
                                    )}%`
                            }
                            accent="cyan"
                        />


                        <RangeControl
                            label="Style"
                            description="Expressiveness"
                            value={
                                style
                            }
                            min={
                                0
                            }
                            max={
                                1
                            }
                            step={
                                0.05
                            }
                            onChange={
                                onStyleChange
                            }
                            formatValue={
                                (value) =>
                                    `${Math.round(
                                        Number(value) *
                                        100
                                    )}%`
                            }
                            accent="fuchsia"
                        />

                    </div>

                </ControlGroup>


                {/* ========================================================== */}
                {/* Enhancement */}
                {/* ========================================================== */}

                <ControlGroup
                    number="03"
                    title="Enhancement"
                    icon="wand"
                    description="Optional processing designed to improve vocal clarity."
                >

                    <button
                        type="button"
                        onClick={() =>
                            onSpeakerBoostChange(
                                !useSpeakerBoost
                            )
                        }
                        className={`group flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                            useSpeakerBoost
                                ? "border-indigo-400/20 bg-indigo-500/[0.075] shadow-[0_10px_30px_rgba(79,70,229,0.08)]"
                                : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.11] hover:bg-white/[0.035]"
                        }`}
                    >

                        <div className="flex min-w-0 items-center gap-3">

                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                                    useSpeakerBoost
                                        ? "border-indigo-400/15 bg-indigo-500/10 text-indigo-300"
                                        : "border-white/[0.06] bg-white/[0.025] text-slate-500"
                                }`}
                            >

                                <Icon
                                    name="sparkles"
                                    size={17}
                                />

                            </div>


                            <div className="min-w-0">

                                <p className="text-sm font-bold text-slate-100">
                                    Speaker Boost
                                </p>

                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                    Enhance the presence and clarity of the voice.
                                </p>

                            </div>

                        </div>


                        <div
                            className={`relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200 ${
                                useSpeakerBoost
                                    ? "border-indigo-300/20 bg-indigo-500"
                                    : "border-white/10 bg-slate-800"
                            }`}
                        >

                            <span
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                                    useSpeakerBoost
                                        ? "translate-x-5"
                                        : "translate-x-1"
                                }`}
                            />

                        </div>

                    </button>

                </ControlGroup>


                {/* ========================================================== */}
                {/* Bottom status */}
                {/* ========================================================== */}

                <div className="rounded-2xl border border-white/[0.055] bg-gradient-to-r from-white/[0.025] to-transparent px-4 py-3">

                    <div className="flex items-center justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-2">

                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" />

                            <p className="truncate text-xs font-semibold text-slate-400">
                                Voice configuration ready
                            </p>

                        </div>


                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">

                            <Icon
                                name="check"
                                size={12}
                            />

                            Synced

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
};


/*
|--------------------------------------------------------------------------
| Configuration chip
|--------------------------------------------------------------------------
*/
const ConfigChip = ({
                        icon,
                        label,
                        value
                    }) => {

    return (
        <div className="min-w-0 rounded-xl border border-white/[0.055] bg-white/[0.02] px-3 py-2.5">

            <div className="flex items-center gap-2">

                <span className="shrink-0 text-slate-600">

                    <Icon
                        name={icon}
                        size={13}
                    />

                </span>


                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
                    {label}
                </p>

            </div>


            <p className="mt-1 truncate text-xs font-semibold text-slate-300">
                {value}
            </p>

        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Control Group
|--------------------------------------------------------------------------
*/
const ControlGroup = ({
                          number,
                          title,
                          icon,
                          description,
                          children
                      }) => {

    return (
        <div className="rounded-2xl border border-white/[0.055] bg-white/[0.018] p-3.5 sm:p-4">

            <div className="mb-4 flex items-start gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-slate-950/60 text-indigo-300">

                    <Icon
                        name={icon}
                        size={15}
                    />

                </div>


                <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                        <span className="text-[9px] font-extrabold tracking-[0.16em] text-indigo-400/70">
                            {number}
                        </span>


                        <h3 className="text-sm font-bold text-white">
                            {title}
                        </h3>

                    </div>


                    <p className="mt-1 text-[11px] leading-5 text-slate-600">
                        {description}
                    </p>

                </div>

            </div>


            {children}

        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Select Control
|--------------------------------------------------------------------------
*/
const SelectControl = ({
                           label,
                           hint,
                           value,
                           options,
                           getOptionValue,
                           getOptionLabel,
                           onChange
                       }) => {

    return (
        <div>

            <div className="mb-2 flex items-center justify-between gap-3">

                <label className="text-xs font-semibold text-slate-400">
                    {label}
                </label>


                <span className="text-[10px] font-semibold text-slate-600">
                    {hint}
                </span>

            </div>


            <div className="relative">

                <select
                    value={
                        value
                    }
                    onChange={(
                        event
                    ) =>
                        onChange(
                            event.target.value
                        )
                    }
                    className="w-full cursor-pointer appearance-none rounded-xl border border-white/[0.07] bg-slate-950/80 px-4 py-3 pr-10 text-sm font-medium text-slate-100 outline-none transition-all duration-200 hover:border-indigo-400/15 focus:border-indigo-400/40 focus:bg-slate-950 focus:ring-4 focus:ring-indigo-500/[0.06]"
                >

                    {options.map(
                        (
                            item
                        ) => {

                            const optionValue =
                                getOptionValue(
                                    item
                                );


                            return (

                                <option
                                    key={
                                        optionValue
                                    }
                                    value={
                                        optionValue
                                    }
                                >
                                    {
                                        getOptionLabel(
                                            item
                                        )
                                    }
                                </option>

                            );

                        }
                    )}

                </select>


                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">

                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>

                </div>

            </div>

        </div>
    );
};


/*
|--------------------------------------------------------------------------
| Range Control
|--------------------------------------------------------------------------
*/
const RangeControl = ({
                          label,
                          description,
                          value,
                          min,
                          max,
                          step,
                          onChange,
                          formatValue,
                          accent = "indigo"
                      }) => {

    const numericValue =
        Number(
            value
        );


    const percentage =
        Math.min(
            100,
            Math.max(
                0,
                (
                    (
                        numericValue -
                        min
                    ) /
                    (
                        max -
                        min
                    )
                ) *
                100
            )
        );


    const accentClassMap = {

        indigo: {
            text:
                "text-indigo-300",

            fill:
                "bg-indigo-500",

            glow:
                "shadow-[0_0_14px_rgba(99,102,241,0.4)]"
        },

        violet: {
            text:
                "text-violet-300",

            fill:
                "bg-violet-500",

            glow:
                "shadow-[0_0_14px_rgba(139,92,246,0.4)]"
        },

        cyan: {
            text:
                "text-cyan-300",

            fill:
                "bg-cyan-400",

            glow:
                "shadow-[0_0_14px_rgba(34,211,238,0.35)]"
        },

        fuchsia: {
            text:
                "text-fuchsia-300",

            fill:
                "bg-fuchsia-500",

            glow:
                "shadow-[0_0_14px_rgba(217,70,239,0.35)]"
        }

    };


    const accentClasses =
        accentClassMap[
            accent
            ] ||
        accentClassMap.indigo;


    return (
        <div className="rounded-xl border border-white/[0.045] bg-slate-950/45 p-3.5">

            <div className="mb-3 flex items-center justify-between gap-4">

                <div className="min-w-0">

                    <p className="text-xs font-bold text-slate-200">
                        {label}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-600">
                        {description}
                    </p>

                </div>


                <div className={`shrink-0 rounded-lg border border-white/[0.055] bg-white/[0.025] px-2.5 py-1.5 text-xs font-extrabold ${accentClasses.text}`}>
                    {
                        formatValue
                            ? formatValue(
                                numericValue
                            )
                            : numericValue.toFixed(2)
                    }
                </div>

            </div>


            <div className="relative h-5">

                {/* Track */}
                <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-slate-800">

                    <div
                        className={`h-full rounded-full ${accentClasses.fill} transition-[width] duration-150 ${accentClasses.glow}`}
                        style={{
                            width:
                                `${percentage}%`
                        }}
                    />

                </div>


                {/* Native range */}
                <input
                    type="range"
                    min={
                        min
                    }
                    max={
                        max
                    }
                    step={
                        step
                    }
                    value={
                        value
                    }
                    onChange={(
                        event
                    ) =>
                        onChange(
                            Number(
                                event.target.value
                            )
                        )
                    }
                    className="absolute inset-0 h-5 w-full cursor-pointer appearance-none bg-transparent accent-indigo-500"
                    style={{
                        WebkitAppearance:
                            "none"
                    }}
                />

            </div>


            <div className="mt-1 flex justify-between text-[9px] font-semibold text-slate-700">

                <span>
                    {min}
                </span>

                <span>
                    {max}
                </span>

            </div>

        </div>
    );
};


export default VoiceSettings;