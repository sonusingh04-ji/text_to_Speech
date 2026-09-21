import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    deleteFile,
    getFiles,
    uploadFile
} from "../services/filesService.js";

const MAX_FILE_SIZE =
    10 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = [
    ".txt",
    ".pdf",
    ".docx"
];

const getExtension = (
    filename
) => {
    const parts =
        filename
            .toLowerCase()
            .split(".");

    if (
        parts.length < 2
    ) {
        return "";
    }

    return `.${parts.pop()}`;
};

const formatBytes = (
    bytes
) => {
    if (!bytes) {
        return "0 KB";
    }

    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];

    let index = 0;
    let size = bytes;

    while (
        size >= 1024 &&
        index < units.length - 1
        ) {
        size /= 1024;
        index += 1;
    }

    return `${size.toFixed(
        size >= 10 || index === 0
            ? 0
            : 1
    )} ${units[index]}`;
};

const getFileIcon = (
    filename
) => {
    const extension =
        getExtension(
            filename
        );

    if (
        extension === ".pdf"
    ) {
        return "PDF";
    }

    if (
        extension === ".docx"
    ) {
        return "DOCX";
    }

    return "TXT";
};

const FileUpload = ({
                        onTextExtracted
                    }) => {
    const fileInputRef =
        useRef(null);

    const [files, setFiles] =
        useState([]);

    const [loadingFiles, setLoadingFiles] =
        useState(true);

    const [uploading, setUploading] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [dragging, setDragging] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | Load files
    |--------------------------------------------------------------------------
    */

    const loadFiles = async () => {
        try {
            setLoadingFiles(true);

            const response =
                await getFiles();

            setFiles(
                response?.files ||
                []
            );
        } catch (requestError) {
            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                "Unable to load uploaded files."
            );
        } finally {
            setLoadingFiles(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Open file picker
    |--------------------------------------------------------------------------
    */

    const openFilePicker = () => {
        if (
            uploading
        ) {
            return;
        }

        fileInputRef.current?.click();
    };

    /*
    |--------------------------------------------------------------------------
    | Validate + upload file
    |--------------------------------------------------------------------------
    */

    const processFile = async (
        file
    ) => {
        setError("");
        setSuccess("");

        if (!file) {
            return;
        }

        const extension =
            getExtension(
                file.name
            );

        if (
            !SUPPORTED_EXTENSIONS.includes(
                extension
            )
        ) {
            setError(
                "Only TXT, PDF, and DOCX files are supported."
            );
            return;
        }

        if (
            file.size >
            MAX_FILE_SIZE
        ) {
            setError(
                "File size cannot exceed 10 MB."
            );
            return;
        }

        try {
            setUploading(true);

            const response =
                await uploadFile(
                    file
                );

            const uploadedFile =
                response?.file;

            if (!uploadedFile) {
                throw new Error(
                    "Upload succeeded but no file data was returned."
                );
            }

            const extractedText =
                uploadedFile
                    ?.extracted_text ||
                uploadedFile
                    ?.extractedText ||
                "";

            if (
                extractedText.trim()
            ) {
                onTextExtracted(
                    extractedText
                );

                setSuccess(
                    `${file.name} uploaded and extracted successfully.`
                );
            } else {
                setSuccess(
                    `${file.name} uploaded successfully, but no readable text was extracted.`
                );
            }

            await loadFiles();
        } catch (requestError) {
            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                requestError?.message ||
                "File upload failed."
            );
        } finally {
            setUploading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | File picker selection
    |--------------------------------------------------------------------------
    */

    const handleFileSelection = async (
        event
    ) => {
        const file =
            event.target
                .files?.[0];

        /*
         * Allow selecting the same
         * file again.
         */
        event.target.value = "";

        await processFile(file);
    };

    /*
    |--------------------------------------------------------------------------
    | Drag and drop
    |--------------------------------------------------------------------------
    */

    const handleDragOver = (
        event
    ) => {
        event.preventDefault();

        if (!uploading) {
            setDragging(true);
        }
    };

    const handleDragLeave = (
        event
    ) => {
        event.preventDefault();
        setDragging(false);
    };

    const handleDrop = async (
        event
    ) => {
        event.preventDefault();

        setDragging(false);

        if (
            uploading
        ) {
            return;
        }

        const file =
            event.dataTransfer
                ?.files?.[0];

        await processFile(file);
    };

    /*
    |--------------------------------------------------------------------------
    | Delete file
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (
        fileId
    ) => {
        setError("");
        setSuccess("");

        try {
            setDeletingId(fileId);

            await deleteFile(
                fileId
            );

            setFiles(
                (previous) =>
                    previous.filter(
                        (item) =>
                            item.id !==
                            fileId
                    )
            );

            setSuccess(
                "File deleted successfully."
            );
        } catch (requestError) {
            setError(
                requestError
                    ?.response
                    ?.data
                    ?.message ||
                "Unable to delete file."
            );
        } finally {
            setDeletingId(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Use extracted text
    |--------------------------------------------------------------------------
    */

    const handleUseText = (
        file
    ) => {
        const extractedText =
            file?.extracted_text ||
            file?.extractedText ||
            "";

        if (
            !extractedText.trim()
        ) {
            setError(
                "This file does not contain readable extracted text."
            );
            return;
        }

        setError("");

        setSuccess(
            `${file.original_name || file.originalName || "File"} text loaded into the editor.`
        );

        onTextExtracted(
            extractedText
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <section className="vs-card relative overflow-hidden p-6 sm:p-7">

            {/* Ambient glow */}

            <div
                className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-44
                    w-44
                    rounded-full
                    bg-indigo-500/10
                    blur-3xl
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    -bottom-24
                    -left-16
                    h-40
                    w-40
                    rounded-full
                    bg-cyan-500/5
                    blur-3xl
                "
            />

            <div className="relative">

                {/* ---------------------------------------------------------------- */}
                {/* Header */}
                {/* ---------------------------------------------------------------- */}

                <div className="mb-6 flex items-start justify-between gap-4">

                    <div className="min-w-0">

                        <div className="mb-2 flex items-center gap-2">

                            <span
                                className="
                                    inline-flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-indigo-400/20
                                    bg-indigo-500/10
                                    text-indigo-300
                                "
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <path d="M14 2v6h6" />
                                    <path d="M8 13h8" />
                                    <path d="M8 17h5" />
                                </svg>
                            </span>

                            <p className="vs-eyebrow">
                                Document Import
                            </p>

                        </div>

                        <h3 className="vs-title text-2xl">
                            Upload a document
                        </h3>

                        <p className="vs-subtitle mt-2 max-w-xl">
                            Import a TXT, PDF, or DOCX document and instantly
                            convert its extracted text into natural speech.
                        </p>

                    </div>

                    {/* Supported formats */}

                    <div className="hidden shrink-0 items-center gap-2 sm:flex">

                        {SUPPORTED_EXTENSIONS.map(
                            (extension) => (
                                <span
                                    key={extension}
                                    className="
                                        rounded-lg
                                        border
                                        border-white/10
                                        bg-white/[0.03]
                                        px-2.5
                                        py-1.5
                                        text-[10px]
                                        font-bold
                                        tracking-wider
                                        text-slate-400
                                    "
                                >
                                    {extension
                                        .replace(".", "")
                                        .toUpperCase()}
                                </span>
                            )
                        )}

                    </div>

                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Upload Zone */}
                {/* ---------------------------------------------------------------- */}

                <div
                    onDragOver={
                        handleDragOver
                    }
                    onDragLeave={
                        handleDragLeave
                    }
                    onDrop={
                        handleDrop
                    }
                    onClick={
                        openFilePicker
                    }
                    className={`
                        group
                        relative
                        cursor-pointer
                        overflow-hidden
                        rounded-3xl
                        border
                        border-dashed
                        p-7
                        text-center
                        transition-all
                        duration-300
                        sm:p-9

                        ${
                        dragging
                            ? `
                                    border-indigo-400/60
                                    bg-indigo-500/10
                                    shadow-[0_0_40px_rgba(99,102,241,0.12)]
                                `
                            : `
                                    border-white/10
                                    bg-slate-950/40
                                    hover:border-indigo-400/30
                                    hover:bg-indigo-500/[0.04]
                                `
                    }

                        ${
                        uploading
                            ? "cursor-wait opacity-80"
                            : ""
                    }
                    `}
                >

                    {/* Upload icon */}

                    <div
                        className={`
                            mx-auto
                            mb-5
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            transition-all
                            duration-300

                            ${
                            dragging
                                ? `
                                        scale-105
                                        border-indigo-400/30
                                        bg-indigo-500/15
                                        text-indigo-300
                                    `
                                : `
                                        border-white/10
                                        bg-white/[0.04]
                                        text-slate-400
                                        group-hover:border-indigo-400/20
                                        group-hover:bg-indigo-500/10
                                        group-hover:text-indigo-300
                                    `
                        }
                        `}
                    >
                        {uploading ? (
                            <svg
                                className="animate-spin"
                                width="25"
                                height="25"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                    stroke="currentColor"
                                    strokeOpacity="0.2"
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
                            <svg
                                width="26"
                                height="26"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M16 16l-4-4-4 4" />
                                <path d="M12 12v9" />
                                <path d="M20.39 17.39A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 3 16.3" />
                            </svg>
                        )}
                    </div>

                    {/* Upload title */}

                    <p className="text-sm font-semibold text-white">
                        {uploading
                            ? "Uploading and extracting..."
                            : dragging
                                ? "Drop your document here"
                                : "Drag & drop your document here"}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        or click anywhere in this area to browse files
                    </p>

                    {/* Format badges */}

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">

                        <span className="vs-badge">
                            TXT
                        </span>

                        <span className="vs-badge">
                            PDF
                        </span>

                        <span className="vs-badge">
                            DOCX
                        </span>

                        <span
                            className="
                                rounded-full
                                border
                                border-white/10
                                bg-white/[0.02]
                                px-3
                                py-1.5
                                text-[10px]
                                font-medium
                                text-slate-500
                            "
                        >
                            Max 10 MB
                        </span>

                    </div>

                    {/* Hidden input */}

                    <input
                        ref={
                            fileInputRef
                        }
                        type="file"
                        accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={
                            handleFileSelection
                        }
                        className="hidden"
                    />

                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Browse Button */}
                {/* ---------------------------------------------------------------- */}

                <div className="mt-4 flex justify-center">

                    <button
                        type="button"
                        onClick={
                            openFilePicker
                        }
                        disabled={
                            uploading
                        }
                        className="
                            vs-secondary-button
                            inline-flex
                            min-w-[180px]
                            items-center
                            justify-center
                            gap-2
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

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
                            <path d="M4 17.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 1.76-4.27" />
                            <path d="M12 3v11" />
                            <path d="m8 7 4-4 4 4" />
                        </svg>

                        {uploading
                            ? "Processing..."
                            : "Choose a File"}

                    </button>

                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Messages */}
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
                            text-sm
                            text-red-300
                        "
                    >
                        <span
                            className="
                                mt-0.5
                                flex
                                h-5
                                w-5
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-red-500/15
                                text-[11px]
                                font-bold
                            "
                        >
                            !
                        </span>

                        <p className="leading-6">
                            {error}
                        </p>
                    </div>
                )}

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
                            text-sm
                            text-emerald-300
                        "
                    >
                        <span
                            className="
                                mt-0.5
                                flex
                                h-5
                                w-5
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-emerald-500/15
                            "
                        >
                            <svg
                                width="12"
                                height="12"
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

                        <p className="leading-6">
                            {success}
                        </p>
                    </div>
                )}

                {/* ---------------------------------------------------------------- */}
                {/* Uploaded Files */}
                {/* ---------------------------------------------------------------- */}

                <div className="mt-8">

                    <div className="mb-4 flex items-center justify-between gap-4">

                        <div>

                            <div className="flex items-center gap-2">

                                <span className="vs-status-dot" />

                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                                    Uploaded Files
                                </p>

                                {!loadingFiles &&
                                    files.length > 0 && (
                                        <span
                                            className="
                                                rounded-full
                                                border
                                                border-white/10
                                                bg-white/[0.04]
                                                px-2
                                                py-0.5
                                                text-[10px]
                                                font-semibold
                                                text-slate-500
                                            "
                                        >
                                            {files.length}
                                        </span>
                                    )}

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={
                                loadFiles
                            }
                            disabled={
                                loadingFiles
                            }
                            className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-lg
                                px-2.5
                                py-1.5
                                text-xs
                                font-semibold
                                text-indigo-300
                                transition
                                hover:bg-indigo-500/10
                                hover:text-indigo-200
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            <svg
                                className={
                                    loadingFiles
                                        ? "animate-spin"
                                        : ""
                                }
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
                                <path d="M4 5v4h4" />
                                <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
                                <path d="M20 19v-4h-4" />
                            </svg>

                            Refresh
                        </button>

                    </div>

                    {/* Loading */}

                    {loadingFiles ? (
                        <div
                            className="
                                rounded-2xl
                                border
                                border-white/5
                                bg-slate-950/40
                                p-5
                            "
                        >
                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        h-10
                                        w-10
                                        animate-pulse
                                        rounded-xl
                                        bg-white/5
                                    "
                                />

                                <div className="flex-1">

                                    <div
                                        className="
                                            h-3
                                            w-40
                                            animate-pulse
                                            rounded-full
                                            bg-white/5
                                        "
                                    />

                                    <div
                                        className="
                                            mt-2
                                            h-2.5
                                            w-24
                                            animate-pulse
                                            rounded-full
                                            bg-white/[0.03]
                                        "
                                    />

                                </div>

                            </div>
                        </div>

                    ) : files.length === 0 ? (

                        /* Empty state */

                        <div
                            className="
                                rounded-2xl
                                border
                                border-dashed
                                border-white/10
                                bg-slate-950/30
                                px-5
                                py-8
                                text-center
                            "
                        >

                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/[0.03]
                                    text-slate-500
                                "
                            >
                                <svg
                                    width="21"
                                    height="21"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M3 7h5l2 2h11v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                </svg>
                            </div>

                            <p className="mt-3 text-sm font-medium text-slate-400">
                                No uploaded files yet
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                                Your imported documents will appear here.
                            </p>

                        </div>

                    ) : (

                        /* Files */

                        <div className="space-y-3">

                            {files.map(
                                (
                                    file
                                ) => {

                                    const name =
                                        file.original_name ||
                                        file.originalName ||
                                        "Untitled file";

                                    const extractedText =
                                        file.extracted_text ||
                                        file.extractedText ||
                                        "";

                                    const extension =
                                        getExtension(
                                            name
                                        );

                                    const canUseText =
                                        Boolean(
                                            extractedText.trim()
                                        );

                                    return (
                                        <div
                                            key={
                                                file.id
                                            }
                                            className="
                                                group/file
                                                rounded-2xl
                                                border
                                                border-white/[0.07]
                                                bg-slate-950/45
                                                p-4
                                                transition-all
                                                duration-300
                                                hover:border-indigo-400/15
                                                hover:bg-white/[0.025]
                                            "
                                        >

                                            {/* File info */}

                                            <div className="flex items-center gap-3">

                                                {/* File type */}

                                                <div
                                                    className="
                                                        flex
                                                        h-11
                                                        w-11
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        border
                                                        border-indigo-400/10
                                                        bg-indigo-500/[0.08]
                                                        text-[9px]
                                                        font-black
                                                        tracking-wider
                                                        text-indigo-300
                                                    "
                                                >
                                                    {
                                                        getFileIcon(
                                                            name
                                                        )
                                                    }
                                                </div>

                                                {/* Name */}

                                                <div className="min-w-0 flex-1">

                                                    <p
                                                        className="
                                                            truncate
                                                            text-sm
                                                            font-semibold
                                                            text-white
                                                        "
                                                        title={
                                                            name
                                                        }
                                                    >
                                                        {name}
                                                    </p>

                                                    <div className="mt-1.5 flex flex-wrap items-center gap-2">

                                                        <span
                                                            className="
                                                                rounded-md
                                                                bg-white/[0.04]
                                                                px-2
                                                                py-0.5
                                                                text-[9px]
                                                                font-bold
                                                                uppercase
                                                                tracking-wider
                                                                text-slate-500
                                                            "
                                                        >
                                                            {
                                                                extension
                                                                    .replace(
                                                                        ".",
                                                                        ""
                                                                    )
                                                                    .toUpperCase()
                                                                ||
                                                                "FILE"
                                                            }
                                                        </span>

                                                        {file.file_size ||
                                                        file.fileSize ? (
                                                            <span className="text-[10px] text-slate-600">
                                                                {formatBytes(
                                                                    file.file_size ||
                                                                    file.fileSize
                                                                )}
                                                            </span>
                                                        ) : null}

                                                        <span
                                                            className={`
                                                                flex
                                                                items-center
                                                                gap-1.5
                                                                text-[10px]
                                                                ${
                                                                canUseText
                                                                    ? "text-emerald-400/80"
                                                                    : "text-slate-600"
                                                            }
                                                            `}
                                                        >
                                                            <span
                                                                className={`
                                                                    h-1.5
                                                                    w-1.5
                                                                    rounded-full
                                                                    ${
                                                                    canUseText
                                                                        ? "bg-emerald-400"
                                                                        : "bg-slate-600"
                                                                }
                                                                `}
                                                            />

                                                            {canUseText
                                                                ? "Text extracted"
                                                                : "No readable text"}
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* Actions */}

                                            <div className="mt-3 flex gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUseText(
                                                            file
                                                        )
                                                    }
                                                    disabled={
                                                        !canUseText
                                                    }
                                                    className="
                                                        inline-flex
                                                        flex-1
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-xl
                                                        border
                                                        border-indigo-400/10
                                                        bg-indigo-500/[0.07]
                                                        px-3
                                                        py-2.5
                                                        text-xs
                                                        font-semibold
                                                        text-indigo-300
                                                        transition
                                                        hover:border-indigo-400/20
                                                        hover:bg-indigo-500/15
                                                        hover:text-indigo-200
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-30
                                                    "
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                                    </svg>

                                                    Use Extracted Text
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            file.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        file.id
                                                    }
                                                    className="
                                                        inline-flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-xl
                                                        border
                                                        border-red-500/10
                                                        bg-red-500/[0.03]
                                                        px-3
                                                        py-2.5
                                                        text-xs
                                                        font-semibold
                                                        text-red-300/80
                                                        transition
                                                        hover:border-red-500/20
                                                        hover:bg-red-500/10
                                                        hover:text-red-300
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-35
                                                    "
                                                >
                                                    {deletingId ===
                                                    file.id ? (
                                                        <svg
                                                            className="animate-spin"
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                        >
                                                            <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="9"
                                                                stroke="currentColor"
                                                                strokeOpacity="0.2"
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
                                                        <svg
                                                            width="14"
                                                            height="14"
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
                                                            <path d="M10 11v5" />
                                                            <path d="M14 11v5" />
                                                        </svg>
                                                    )}

                                                    {deletingId ===
                                                    file.id
                                                        ? "Deleting"
                                                        : "Delete"}
                                                </button>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Footer */}
                {/* ---------------------------------------------------------------- */}

                <div
                    className="
                        mt-6
                        flex
                        flex-col
                        gap-3
                        border-t
                        border-white/5
                        pt-5
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div className="flex items-center gap-2">

                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-slate-600"
                        >
                            <rect
                                x="3"
                                y="11"
                                width="18"
                                height="10"
                                rx="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>

                        <span className="text-[10px] text-slate-600">
                            Documents are limited to 10 MB
                        </span>

                    </div>

                    <p className="text-[10px] text-slate-600">
                        Text extraction happens automatically after upload.
                    </p>

                </div>

            </div>

        </section>
    );
};

export default FileUpload;