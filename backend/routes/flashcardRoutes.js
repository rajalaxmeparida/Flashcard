const express = require("express");
const multer = require("multer");
const {
  healthCheck,
  uploadPDF
} = require("../controllers/flashcardController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/health", healthCheck);
router.post("/upload-pdf", upload.single("file"), uploadPDF);

module.exports = router;
