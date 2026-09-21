import multer from "multer";


const ALLOWED_IMAGE_TYPES =
    new Set([
        "image/jpeg",
        "image/png",
        "image/webp"
    ]);


const MAX_PROFILE_IMAGE_SIZE =
    5 * 1024 * 1024;


const storage =
    multer.memoryStorage();


const upload =
    multer({
        storage,

        limits: {
            fileSize:
            MAX_PROFILE_IMAGE_SIZE,

            files: 1
        },

        fileFilter: (
            req,
            file,
            callback
        ) => {

            if (
                !ALLOWED_IMAGE_TYPES.has(
                    file.mimetype
                )
            ) {

                const error =
                    new Error(
                        "Only JPG, PNG, and WEBP profile images are supported."
                    );

                error.statusCode = 400;
                error.code =
                    "UNSUPPORTED_PROFILE_IMAGE";

                callback(
                    error
                );

                return;
            }


            callback(
                null,
                true
            );
        }
    });


export const uploadProfilePhoto =
    upload.single(
        "photo"
    );