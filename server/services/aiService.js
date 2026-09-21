/*
|--------------------------------------------------------------------------
| Local AI Text Enhancement Service
|--------------------------------------------------------------------------
|
| Free deterministic development implementation.
| No external AI API key is required.
|
| Supported operations:
|   - summarize
|   - grammar
|   - rewrite
|   - conversational
|
| The service also detects programming/code-like input and
| applies code-aware behavior.
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Text Utilities
|--------------------------------------------------------------------------
*/

const normalizeWhitespace = (
    text
) => {

    return text
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};


const collapseForAnalysis = (
    text
) => {

    return text
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n+/g, "\n")
        .trim();
};


const getWords = (
    text
) => {

    return text
        .toLowerCase()
        .match(
            /[a-zA-Z]{3,}/g
        ) || [];
};


/*
|--------------------------------------------------------------------------
| Sentence Extraction
|--------------------------------------------------------------------------
*/
const getSentences = (
    text
) => {

    return text
        .replace(/\r\n/g, "\n")
        .split(
            /(?<=[.!?])\s+/
        )
        .map(
            (sentence) =>
                sentence.trim()
        )
        .filter(Boolean);
};


/*
|--------------------------------------------------------------------------
| Detect Code
|--------------------------------------------------------------------------
*/
const isCodeLike = (
    text
) => {

    const codeIndicators = [

        /\b#include\s*[<"].+[>"]/,

        /\busing\s+namespace\s+\w+/,

        /\bpublic\s+class\s+\w+/,

        /\bprivate\s+\w+\s+\w+\(/,

        /\bfunc\s+\w+\(/,

        /\bdef\s+\w+\s*\(/,

        /\bimport\s+[A-Za-z0-9_.*]+/,

        /\bconst\s+\w+\s*=/,

        /\blet\s+\w+\s*=/,

        /\bfunction\s+\w+\s*\(/,

        /=>/,

        /\bprintf\s*\(/,

        /\bscanf\s*\(/,

        /\bSystem\.out\.println\s*\(/,

        /\bconsole\.log\s*\(/,

        /\bmalloc\s*\(/,

        /\bfree\s*\(/,

        /\breturn\s+[^;]+;/,

        /\bif\s*\(.+\)\s*\{/,

        /\bfor\s*\(.+\)\s*\{/,

        /\bwhile\s*\(.+\)\s*\{/,

        /\bstruct\s+\w+/,

        /\bclass\s+\w+/,

        /[{};]{2,}/

    ];


    const matches =
        codeIndicators.filter(
            (pattern) =>
                pattern.test(text)
        ).length;


    const lines =
        text
            .split("\n")
            .length;


    const codeLines =
        text
            .split("\n")
            .filter(
                (line) =>
                    /[{};]|#include|->|::|\breturn\b/
                        .test(line)
            )
            .length;


    return (
        matches >= 2 ||
        codeLines >= 3 ||
        (
            lines >= 5 &&
            codeLines / lines >= 0.35
        )
    );
};


/*
|--------------------------------------------------------------------------
| Detect Programming Language
|--------------------------------------------------------------------------
*/
const detectCodeLanguage = (
    text
) => {

    if (
        /#include\s*[<"](?:stdio|stdlib|string|math)\./.test(
            text
        )
    ) {
        return "C";
    }


    if (
        /#include\s*[<"](?:iostream|vector|string|map|set)\./.test(
            text
        ) ||
        /\busing\s+namespace\s+std\b/.test(
            text
        )
    ) {
        return "C++";
    }


    if (
        /\bpublic\s+class\s+\w+/.test(
            text
        ) ||
        /\bSystem\.out\.println\b/.test(
            text
        )
    ) {
        return "Java";
    }


    if (
        /\bdef\s+\w+\s*\(/.test(
            text
        ) ||
        /\bprint\s*\(/.test(
            text
        ) &&
        !/\bprintf\s*\(/.test(
            text
        )
    ) {
        return "Python";
    }


    if (
        /\bimport\s+.*from\s+['"]/.test(
            text
        ) ||
        /\bconsole\.log\s*\(/.test(
            text
        ) ||
        /\bconst\s+\w+\s*=/.test(
            text
        )
    ) {
        return "JavaScript";
    }


    if (
        /\bfunc\s+\w+\s*\(/.test(
            text
        )
    ) {
        return "Go";
    }


    return "Programming";
};


/*
|--------------------------------------------------------------------------
| Keyword Frequency
|--------------------------------------------------------------------------
*/
const getImportantWords = (
    text
) => {

    const stopWords =
        new Set([
            "the",
            "and",
            "that",
            "this",
            "with",
            "from",
            "into",
            "have",
            "will",
            "your",
            "their",
            "there",
            "they",
            "them",
            "then",
            "than",
            "which",
            "where",
            "when",
            "what",
            "about",
            "using",
            "used",
            "were",
            "been",
            "being",
            "for",
            "are",
            "was",
            "has",
            "its",
            "you",
            "can",
            "not",
            "but",
            "also",
            "our",
            "out",
            "all",
            "one"
        ]);


    const counts =
        new Map();


    for (
        const word of getWords(text)
        ) {

        if (
            stopWords.has(word)
        ) {
            continue;
        }


        counts.set(
            word,
            (counts.get(word) || 0) + 1
        );
    }


    return [...counts.entries()]
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .slice(0, 8)
        .map(
            ([word]) =>
                word
        );
};


/*
|--------------------------------------------------------------------------
| Normal Text Summary
|--------------------------------------------------------------------------
*/
const summarizeNormalText = (
    text
) => {

    const cleaned =
        collapseForAnalysis(
            text
        );


    const sentences =
        getSentences(
            cleaned
        );


    /*
    |--------------------------------------------------------------------------
    | Very short content
    |--------------------------------------------------------------------------
    */
    if (
        sentences.length <= 2
    ) {
        return cleaned;
    }


    /*
    |--------------------------------------------------------------------------
    | Select informative sentences
    |--------------------------------------------------------------------------
    */
    const importantWords =
        new Set(
            getImportantWords(
                cleaned
            )
        );


    const scored =
        sentences.map(
            (sentence, index) => {

                const words =
                    getWords(
                        sentence
                    );


                let score = 0;


                for (
                    const word of words
                    ) {

                    if (
                        importantWords.has(
                            word
                        )
                    ) {
                        score += 1;
                    }
                }


                /*
                * Slight preference for
                * early introductory sentences.
                */
                score +=
                    Math.max(
                        0,
                        2 - index * 0.25
                    );


                return {
                    sentence,
                    index,
                    score
                };
            }
        );


    const targetCount =
        sentences.length >= 6
            ? 3
            : Math.min(
                3,
                Math.ceil(
                    sentences.length / 2
                )
            );


    return scored
        .sort(
            (a, b) =>
                b.score - a.score
        )
        .slice(
            0,
            targetCount
        )
        .sort(
            (a, b) =>
                a.index - b.index
        )
        .map(
            (item) =>
                item.sentence
        )
        .join(" ");
};


/*
|--------------------------------------------------------------------------
| Code Structure Extraction
|--------------------------------------------------------------------------
*/
const analyzeCodeStructure = (
    text
) => {

    const language =
        detectCodeLanguage(
            text
        );


    const functions = [
        ...text.matchAll(
            /\b(?:void|int|float|double|char|bool|string|def|function|func|public\s+\w+|\w+)\s+([A-Za-z_]\w*)\s*\(/g
        )
    ]
        .map(
            (match) =>
                match[1]
        )
        .filter(Boolean);


    const hasLoop =
        /\b(for|while|do)\b/
            .test(text);


    const hasConditional =
        /\b(if|else|switch|case)\b/
            .test(text);


    const hasPointers =
        /[*]&|\bmalloc\b|\bfree\b|->/
            .test(text);


    const hasDataStructure =
        /\b(struct|class|Node|vector|array|list|queue|stack|map|set)\b/
            .test(text);


    return {
        language,
        functions:
            [...new Set(functions)]
                .slice(0, 8),
        hasLoop,
        hasConditional,
        hasPointers,
        hasDataStructure
    };
};


/*
|--------------------------------------------------------------------------
| Code Summary
|--------------------------------------------------------------------------
*/
const summarizeCode = (
    text
) => {

    const analysis =
        analyzeCodeStructure(
            text
        );


    const details = [];


    details.push(
        `This is a ${analysis.language} program.`
    );


    if (
        analysis.hasDataStructure
    ) {

        details.push(
            "It defines or uses a data structure such as a class, struct, node, or collection."
        );
    }


    if (
        analysis.hasLoop
    ) {

        details.push(
            "The program contains loop-based processing."
        );
    }


    if (
        analysis.hasConditional
    ) {

        details.push(
            "The program contains conditional or branching logic."
        );
    }


    if (
        analysis.hasPointers
    ) {

        details.push(
            "It uses pointer or dynamic-memory related operations."
        );
    }


    if (
        analysis.functions.length > 0
    ) {

        details.push(
            `Detected functions include: ${analysis.functions.join(", ")}.`
        );
    }


    if (
        /queue/i.test(text)
    ) {

        details.push(
            "The code appears to implement queue-related operations such as insertion, deletion, or traversal."
        );
    }


    if (
        /linked\s*list|Node\s*\*/i.test(
            text
        )
    ) {

        details.push(
            "The implementation uses linked-list or node-based structures."
        );
    }


    return details.join(
        " "
    );
};


/*
|--------------------------------------------------------------------------
| Code Grammar
|--------------------------------------------------------------------------
|
| We intentionally do not rewrite actual source code as if it were
| natural language. Instead, we return the source code unchanged after
| confirming that it was detected as code.
|--------------------------------------------------------------------------
*/
const correctCodeGrammar = (
    text
) => {

    return text.trim();
};


/*
|--------------------------------------------------------------------------
| Normal Grammar Correction
|--------------------------------------------------------------------------
*/
const correctGrammar = (
    text
) => {

    let result =
        text.trim();


    /*
    |--------------------------------------------------------------------------
    | Normalize spaces
    |--------------------------------------------------------------------------
    */
    result =
        result.replace(
            /\s+/g,
            " "
        );


    /*
    |--------------------------------------------------------------------------
    | Remove spaces before punctuation
    |--------------------------------------------------------------------------
    */
    result =
        result.replace(
            /\s+([,.!?;:])/g,
            "$1"
        );


    /*
    |--------------------------------------------------------------------------
    | Add spaces after punctuation
    |--------------------------------------------------------------------------
    */
    result =
        result.replace(
            /([,.!?;:])([A-Za-z])/g,
            "$1 $2"
        );


    /*
    |--------------------------------------------------------------------------
    | Common contractions
    |--------------------------------------------------------------------------
    */
    const replacements = [

        [
            /\bdont\b/gi,
            "don't"
        ],

        [
            /\bdoesnt\b/gi,
            "doesn't"
        ],

        [
            /\bcant\b/gi,
            "can't"
        ],

        [
            /\bwont\b/gi,
            "won't"
        ],

        [
            /\bisnt\b/gi,
            "isn't"
        ],

        [
            /\bwasnt\b/gi,
            "wasn't"
        ],

        [
            /\bshouldnt\b/gi,
            "shouldn't"
        ],

        [
            /\bcouldnt\b/gi,
            "couldn't"
        ],

        [
            /\bwouldnt\b/gi,
            "wouldn't"
        ],

        [
            /\bim\b/gi,
            "I'm"
        ]
    ];


    for (
        const [
            pattern,
            replacement
        ] of replacements
        ) {

        result =
            result.replace(
                pattern,
                replacement
            );
    }


    /*
    |--------------------------------------------------------------------------
    | Capitalize beginning
    |--------------------------------------------------------------------------
    */
    if (
        result.length > 0
    ) {

        result =
            result.charAt(0)
                .toUpperCase() +
            result.slice(1);
    }


    /*
    |--------------------------------------------------------------------------
    | Add ending punctuation
    |--------------------------------------------------------------------------
    */
    if (
        result &&
        !/[.!?]$/.test(
            result
        )
    ) {

        result += ".";
    }


    return result;
};


/*
|--------------------------------------------------------------------------
| Normal Rewrite
|--------------------------------------------------------------------------
*/
const rewriteText = (
    text
) => {

    const cleaned =
        normalizeWhitespace(
            text
        );


    return cleaned

        .replace(
            /\bUsers can\b/gi,
            "Users are able to"
        )

        .replace(
            /\bUsers may\b/gi,
            "Users are able to"
        )

        .replace(
            /\bThe application\b/gi,
            "This application"
        )

        .replace(
            /\bIt can\b/gi,
            "It is able to"
        )

        .replace(
            /\bin order to\b/gi,
            "to"
        )

        .replace(
            /\ba lot of\b/gi,
            "many"
        );
};


/*
|--------------------------------------------------------------------------
| Conversational Rewrite
|--------------------------------------------------------------------------
*/
const conversationalText = (
    text
) => {

    const cleaned =
        normalizeWhitespace(
            text
        );


    return cleaned

        .replace(
            /\bUsers can\b/gi,
            "You can"
        )

        .replace(
            /\bUsers are able to\b/gi,
            "You can"
        )

        .replace(
            /\bUsers may\b/gi,
            "You can"
        )

        .replace(
            /\bThe application\b/gi,
            "This app"
        )

        .replace(
            /\bThis application\b/gi,
            "This app"
        )

        .replace(
            /\bin order to\b/gi,
            "to"
        );
};


/*
|--------------------------------------------------------------------------
| Code Rewrite
|--------------------------------------------------------------------------
|
| We do not alter source code semantics.
| Instead, we return a concise human-readable explanation.
|--------------------------------------------------------------------------
*/
const rewriteCode = (
    text
) => {

    const summary =
        summarizeCode(
            text
        );


    return (
        `${summary} ` +
        "The source code itself has not been modified."
    );
};


/*
|--------------------------------------------------------------------------
| Code Conversational Explanation
|--------------------------------------------------------------------------
*/
const conversationalCode = (
    text
) => {

    const analysis =
        analyzeCodeStructure(
            text
        );


    let result =
        `This ${analysis.language} program`;


    if (
        analysis.hasDataStructure
    ) {

        result +=
            " works with a data structure";
    }


    if (
        analysis.hasLoop
    ) {

        result +=
            " and uses loops";
    }


    if (
        analysis.hasConditional
    ) {

        result +=
            " with conditional logic";
    }


    if (
        analysis.hasPointers
    ) {

        result +=
            " and pointer or memory operations";
    }


    if (
        analysis.functions.length > 0
    ) {

        result +=
            `. Some of the detected functions are ${analysis.functions.join(", ")}`;
    }


    result += ".";


    return result;
};


/*
|--------------------------------------------------------------------------
| Main AI Enhancement Function
|--------------------------------------------------------------------------
*/
export const enhanceText =
    async ({
               text,
               operation
           }) => {

        /*
        |--------------------------------------------------------------------------
        | Validate text
        |--------------------------------------------------------------------------
        */
        if (
            typeof text !==
            "string" ||
            !text.trim()
        ) {

            const error =
                new Error(
                    "Text is required."
                );


            error.statusCode =
                400;


            error.code =
                "TEXT_REQUIRED";


            throw error;
        }


        /*
        |--------------------------------------------------------------------------
        | Validate operation
        |--------------------------------------------------------------------------
        */
        const supportedOperations =
            new Set([
                "summarize",
                "grammar",
                "rewrite",
                "conversational"
            ]);


        if (
            !supportedOperations.has(
                operation
            )
        ) {

            const error =
                new Error(
                    "Unsupported AI enhancement operation."
                );


            error.statusCode =
                400;


            error.code =
                "UNSUPPORTED_AI_OPERATION";


            throw error;
        }


        const cleanedText =
            text.trim();


        const codeDetected =
            isCodeLike(
                cleanedText
            );


        let enhancedText;


        /*
        |--------------------------------------------------------------------------
        | Code-aware AI
        |--------------------------------------------------------------------------
        */
        if (
            codeDetected
        ) {

            switch (
                operation
                ) {

                case "summarize":

                    enhancedText =
                        summarizeCode(
                            cleanedText
                        );

                    break;


                case "grammar":

                    enhancedText =
                        correctCodeGrammar(
                            cleanedText
                        );

                    break;


                case "rewrite":

                    enhancedText =
                        rewriteCode(
                            cleanedText
                        );

                    break;


                case "conversational":

                    enhancedText =
                        conversationalCode(
                            cleanedText
                        );

                    break;
            }

        } else {

            /*
            |--------------------------------------------------------------------------
            | Normal text AI
            |--------------------------------------------------------------------------
            */
            switch (
                operation
                ) {

                case "summarize":

                    enhancedText =
                        summarizeNormalText(
                            cleanedText
                        );

                    break;


                case "grammar":

                    enhancedText =
                        correctGrammar(
                            cleanedText
                        );

                    break;


                case "rewrite":

                    enhancedText =
                        rewriteText(
                            cleanedText
                        );

                    break;


                case "conversational":

                    enhancedText =
                        conversationalText(
                            cleanedText
                        );

                    break;
            }
        }


        return {

            operation,

            model:
                codeDetected
                    ? "local-dev-code-aware"
                    : "local-dev",

            provider:
                "local",

            text:
            enhancedText,

            metadata: {
                codeDetected,

                language:
                    codeDetected
                        ? detectCodeLanguage(
                            cleanedText
                        )
                        : null
            }
        };
    };