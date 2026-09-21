export const getHealth = (req, res) => {
    res.status(200).json({
        success: true,
        status: "UP",
        message: "Text-to-Speech backend is healthy",
        timestamp: new Date().toISOString(),
        service: "text-to-speech-server"
    });
};