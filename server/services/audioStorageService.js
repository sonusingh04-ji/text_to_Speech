import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIO_DIRECTORY = path.resolve(
    __dirname,
    "../uploads/audio"
);

/*
|--------------------------------------------------------------------------
| Ensure audio directory exists
|--------------------------------------------------------------------------
*/
export const ensureAudioDirectory = async () => {
    await fs.mkdir(AUDIO_DIRECTORY, {
        recursive: true
    });
};

/*
|--------------------------------------------------------------------------
| Save Audio Buffer
|--------------------------------------------------------------------------
*/
export const saveAudioBuffer = async (
    audioBuffer,
    extension = "mp3"
) => {
    await ensureAudioDirectory();

    const safeExtension =
        String(extension)
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase() || "mp3";

    const fileName =
        `${randomUUID()}.${safeExtension}`;

    const filePath =
        path.join(
            AUDIO_DIRECTORY,
            fileName
        );

    await fs.writeFile(
        filePath,
        audioBuffer
    );

    return {
        fileName,
        filePath
    };
};

/*
|--------------------------------------------------------------------------
| Delete Audio File
|--------------------------------------------------------------------------
*/
export const deleteAudioFile = async (
    fileName
) => {
    if (!fileName) {
        return false;
    }

    const safeFileName =
        path.basename(fileName);

    const filePath =
        path.join(
            AUDIO_DIRECTORY,
            safeFileName
        );

    try {
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        if (error.code === "ENOENT") {
            return false;
        }

        throw error;
    }
};