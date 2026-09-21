/*
|--------------------------------------------------------------------------
| Supported Languages
|--------------------------------------------------------------------------
|
| These languages are supported by ElevenLabs Multilingual v2.
|
|--------------------------------------------------------------------------
*/

export const languages = [
    {
        code: "en-US",
        name: "English",
        elevenLabsCode: "en"
    },
    {
        code: "hi-IN",
        name: "Hindi",
        elevenLabsCode: "hi"
    },
    {
        code: "gu-IN",
        name: "Gujarati",
        elevenLabsCode: "gu"
    },
    {
        code: "mr-IN",
        name: "Marathi",
        elevenLabsCode: "mr"
    },
    {
        code: "ta-IN",
        name: "Tamil",
        elevenLabsCode: "ta"
    },
    {
        code: "de-DE",
        name: "German",
        elevenLabsCode: "de"
    },
    {
        code: "fr-FR",
        name: "French",
        elevenLabsCode: "fr"
    },
    {
        code: "es-ES",
        name: "Spanish",
        elevenLabsCode: "es"
    },
    {
        code: "it-IT",
        name: "Italian",
        elevenLabsCode: "it"
    },
    {
        code: "pt-BR",
        name: "Portuguese",
        elevenLabsCode: "pt"
    },
    {
        code: "ja-JP",
        name: "Japanese",
        elevenLabsCode: "ja"
    },
    {
        code: "zh-CN",
        name: "Chinese",
        elevenLabsCode: "zh"
    },
    {
        code: "ko-KR",
        name: "Korean",
        elevenLabsCode: "ko"
    },
    {
        code: "id-ID",
        name: "Indonesian",
        elevenLabsCode: "id"
    },
    {
        code: "nl-NL",
        name: "Dutch",
        elevenLabsCode: "nl"
    },
    {
        code: "tr-TR",
        name: "Turkish",
        elevenLabsCode: "tr"
    },
    {
        code: "fil-PH",
        name: "Filipino",
        elevenLabsCode: "fil"
    },
    {
        code: "pl-PL",
        name: "Polish",
        elevenLabsCode: "pl"
    },
    {
        code: "sv-SE",
        name: "Swedish",
        elevenLabsCode: "sv"
    },
    {
        code: "bg-BG",
        name: "Bulgarian",
        elevenLabsCode: "bg"
    },
    {
        code: "ro-RO",
        name: "Romanian",
        elevenLabsCode: "ro"
    },
    {
        code: "ar-SA",
        name: "Arabic",
        elevenLabsCode: "ar"
    },
    {
        code: "cs-CZ",
        name: "Czech",
        elevenLabsCode: "cs"
    },
    {
        code: "el-GR",
        name: "Greek",
        elevenLabsCode: "el"
    },
    {
        code: "fi-FI",
        name: "Finnish",
        elevenLabsCode: "fi"
    },
    {
        code: "hr-HR",
        name: "Croatian",
        elevenLabsCode: "hr"
    },
    {
        code: "ms-MY",
        name: "Malay",
        elevenLabsCode: "ms"
    },
    {
        code: "sk-SK",
        name: "Slovak",
        elevenLabsCode: "sk"
    },
    {
        code: "da-DK",
        name: "Danish",
        elevenLabsCode: "da"
    },
    {
        code: "uk-UA",
        name: "Ukrainian",
        elevenLabsCode: "uk"
    },
    {
        code: "ru-RU",
        name: "Russian",
        elevenLabsCode: "ru"
    }
];


/*
|--------------------------------------------------------------------------
| Configured Voices
|--------------------------------------------------------------------------
|
| Put actual voice IDs in .env.
|
| Existing voice:
| ELEVENLABS_VOICE_ID
|
| Additional voices:
| ELEVENLABS_MALE_VOICE_ID
| ELEVENLABS_FEMALE_VOICE_ID
| ELEVENLABS_MALE_VOICE_ID_2
| ELEVENLABS_FEMALE_VOICE_ID_2
|
|--------------------------------------------------------------------------
*/

export const getConfiguredVoices = () => {

    const voices = [];


    const addVoice = ({
                          envName,
                          name,
                          gender,
                          description
                      }) => {

        const voiceId =
            process.env[envName];


        if (
            !voiceId ||
            !voiceId.trim()
        ) {
            return;
        }


        /*
        * Prevent the same voice ID from
        * appearing twice in the frontend.
        */
        const alreadyExists =
            voices.some(
                (voice) =>
                    voice.id ===
                    voiceId.trim()
            );


        if (
            alreadyExists
        ) {
            return;
        }


        voices.push({

            id:
                voiceId.trim(),

            name,

            language:
                "multilingual",

            gender,

            description,

            provider:
                "elevenlabs"
        });
    };


    /*
    |--------------------------------------------------------------------------
    | Existing configured voice
    |--------------------------------------------------------------------------
    */
    addVoice({
        envName:
            "ELEVENLABS_VOICE_ID",

        name:
            "Default Voice",

        gender:
            "unknown",

        description:
            "Default configured ElevenLabs voice"
    });


    /*
    |--------------------------------------------------------------------------
    | Male Voice
    |--------------------------------------------------------------------------
    */
    addVoice({
        envName:
            "ELEVENLABS_MALE_VOICE_ID",

        name:
            "Male Voice",

        gender:
            "male",

        description:
            "Configured male multilingual voice"
    });


    /*
    |--------------------------------------------------------------------------
    | Second Male Voice
    |--------------------------------------------------------------------------
    */
    addVoice({
        envName:
            "ELEVENLABS_MALE_VOICE_ID_2",

        name:
            "Male Voice 2",

        gender:
            "male",

        description:
            "Additional configured male voice"
    });


    /*
    |--------------------------------------------------------------------------
    | Female Voice
    |--------------------------------------------------------------------------
    */
    addVoice({
        envName:
            "ELEVENLABS_FEMALE_VOICE_ID",

        name:
            "Female Voice",

        gender:
            "female",

        description:
            "Configured female multilingual voice"
    });


    /*
    |--------------------------------------------------------------------------
    | Second Female Voice
    |--------------------------------------------------------------------------
    */
    addVoice({
        envName:
            "ELEVENLABS_FEMALE_VOICE_ID_2",

        name:
            "Female Voice 2",

        gender:
            "female",

        description:
            "Additional configured female voice"
    });


    return voices;
};