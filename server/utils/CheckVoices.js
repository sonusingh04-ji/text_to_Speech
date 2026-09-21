import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
    console.error("ELEVENLABS_API_KEY is missing from .env");
    process.exit(1);
}

try {
    const response = await fetch(
        "https://api.elevenlabs.io/v1/voices",
        {
            method: "GET",
            headers: {
                "xi-api-key": apiKey
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("ElevenLabs error:", data);
        process.exit(1);
    }

    console.log(
        JSON.stringify(data.voices, null, 2)
    );
} catch (error) {
    console.error("Request failed:", error.message);
    process.exit(1);
}