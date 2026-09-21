import multer from "multer";
import path from "path";


/*
|--------------------------------------------------------------------------
| Allowed File Types
|--------------------------------------------------------------------------
*/
const ALLOWED_EXTENSIONS = new Set([
    ".txt",
    ".pdf",
    ".docx"
]);


/*
|--------------------------------------------------------------------------
| Multer Storage
|--------------------------------------------------------------------------
|
| Store the file in memory because the extraction
| service works with req.file.buffer.
|--------------------------------------------------------------------------
*/
const storage = multer.memoryStorage();


/*
|--------------------------------------------------------------------------
| File Filter
|--------------------------------------------------------------------------
*/
const fileFilter = (req, file, cb) => {
    const extension =
        path.extname(file.originalname)
            .toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension)) {
        const error = new Error(
            "Only TXT, PDF, and DOCX files are supported."
        );

        error.statusCode = 400;
        error.code = "UNSUPPORTED_FILE_TYPE";

        return cb(error, false);
    }

    return cb(null, true);
};


/*
|--------------------------------------------------------------------------
| Multer Upload Configuration
|--------------------------------------------------------------------------
*/
const upload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter
});


/*
|--------------------------------------------------------------------------
| Single File Upload
|--------------------------------------------------------------------------
*/
export const uploadSingleFile = upload.single("file");


/*
|--------------------------------------------------------------------------
| Backward-Compatible Alias
|--------------------------------------------------------------------------
*/
export const uploadFile = uploadSingleFile;