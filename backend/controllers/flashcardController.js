const { PDFParse } = require("pdf-parse");
const { generateQuestions } = require("../utils/generateQuestions");

function healthCheck(_req, res) {
  res.json({ status: "ok", service: "flashcards" });
}

async function uploadPDF(req, res) {
  let parser = null;
  try {
    console.log("File received");
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Extracting text...");
    parser = new PDFParse({ data: req.file.buffer });
    const parsedPdf = await parser.getText();
    const extractedText = (parsedPdf?.text || "").trim();

    if (!extractedText) {
      return res.status(422).json({ error: "Could not extract text from PDF." });
    }

    console.log("Calling Gemini...");
    const generated = await generateQuestions(extractedText);

    let questions = [];
    if (Array.isArray(generated)) {
      questions = generated;
    } else if (typeof generated === "string" && generated.trim()) {
      questions = [
        {
          type: "short",
          question: "Generated response",
          answer: generated.trim()
        }
      ];
    }

    return res.json({ questions });
  } catch (error) {
    console.error("uploadPDF: Failed processing PDF.", error);
    return res.status(500).json({ error: error.message });
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (destroyError) {
        console.error("uploadPDF: Failed to destroy parser instance.", destroyError);
      }
    }
  }
}

// Backward-compatible export name for existing routes.
const generateFlashcardsFromPdf = uploadPDF;

module.exports = {
  healthCheck,
  uploadPDF,
  generateFlashcardsFromPdf
};
