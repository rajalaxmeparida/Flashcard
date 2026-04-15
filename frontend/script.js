const openUploadModalBtn = document.getElementById("openUploadModalBtn");
const closeUploadModalBtn = document.getElementById("closeUploadModalBtn");
const uploadModal = document.getElementById("uploadModal");
const dropZone = document.getElementById("dropZone");
const pdfInput = document.getElementById("pdfInput");
const uploadStatus = document.getElementById("uploadStatus");
const selectedFileName = document.getElementById("selectedFileName");
const uploadProgressBar = document.getElementById("uploadProgressBar");
const progressText = document.getElementById("progressText");
const uploadFileBtn = document.getElementById("uploadFileBtn");
const clearFileBtn = document.getElementById("clearFileBtn");
const landingContainer = document.getElementById("landingContainer");
const landingSection = document.getElementById("landingSection");
const flashcardSection = document.getElementById("flashcardSection");
const flashcard3D = document.getElementById("flashcard3D");
const cardProgress = document.getElementById("cardProgress");
const prevCardBtn = document.getElementById("prevCardBtn");
const nextCardBtn = document.getElementById("nextCardBtn");
const wrongBtn = document.getElementById("wrongBtn");
const correctBtn = document.getElementById("correctBtn");
const hardBtn = document.getElementById("hardBtn");
const mediumBtn = document.getElementById("mediumBtn");
const easyBtn = document.getElementById("easyBtn");
const cardFeedback = document.getElementById("cardFeedback");
const wrongCount = document.getElementById("wrongCount");
const correctCount = document.getElementById("correctCount");
const cardQuestion = document.getElementById("cardQuestion");
const cardAnswer = document.getElementById("cardAnswer");

let cards = [
  {
    question: "What is AI?",
    answer: "Artificial Intelligence"
  },
  {
    question: "What is JS?",
    answer: "Programming language"
  }
];

let currentCardIndex = 0;
let selectedPdfFile = null;
let progressTimer = null;
let wrongScore = 0;
let correctScore = 0;
let feedbackTimer = null;
let isFeedbackActive = false;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeQuestionItem(item) {
  const rawType = String(item?.type || "short").toLowerCase().replace(/[\s_-]/g, "");
  const normalizedType = rawType === "truefalse" ? "truefalse" : rawType;
  const incomingOptions = Array.isArray(item?.options) ? item.options : [];
  const options =
    normalizedType === "truefalse"
      ? ["True", "False"]
      : incomingOptions;

  return {
    type: normalizedType || "short",
    question: (item?.question || "Untitled question").trim(),
    answer: (item?.answer || "").trim(),
    options
  };
}

function stripOptionPrefix(text) {
  return String(text || "")
    .replace(/^[A-Da-d]\s*[\)\].:-]\s*/g, "")
    .trim();
}

function openModal() {
  uploadModal.classList.remove("pointer-events-none", "opacity-0");
  uploadModal.classList.add("opacity-100");
  uploadModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  uploadModal.classList.add("pointer-events-none", "opacity-0");
  uploadModal.classList.remove("opacity-100");
  uploadModal.setAttribute("aria-hidden", "true");
}

function resetProgress() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  uploadProgressBar.style.width = "0%";
  progressText.textContent = "0%";
}

function showFlashcards() {
  landingContainer.classList.add("hidden");
  landingSection.classList.add("hidden");
  flashcardSection.classList.remove("hidden");
  flashcardSection.classList.add("flex");
  requestAnimationFrame(() => {
    flashcardSection.classList.remove("opacity-0");
    flashcardSection.classList.add("opacity-100");
  });
}

function setCard(index) {
  const card = cards[index];
  if (card.type === "mcq" || card.type === "truefalse") {
    const formattedOptions = card.options.map((option, idx) => ({
      label: String.fromCharCode(65 + idx),
      text: stripOptionPrefix(option)
    }));

    const optionHtml = formattedOptions
      .map((option) => `${option.label}. ${escapeHtml(option.text)}`)
      .join("<br>");

    const cleanAnswer = stripOptionPrefix(card.answer);

    cardQuestion.innerHTML = `${escapeHtml(card.question)}<br><br><span class="text-base text-cyan-100 leading-8">${optionHtml}</span>`;
    cardAnswer.innerHTML = `<span class="text-emerald-300 font-semibold">Correct Answer: ${escapeHtml(cleanAnswer || card.answer)}</span>`;

    // Option-based cards need more vertical space so content stays inside.
    flashcard3D.style.minHeight = card.type === "truefalse" ? "360px" : "460px";
  } else if (card.type === "fill") {
    cardQuestion.textContent = card.question;
    cardAnswer.textContent = card.answer;
    flashcard3D.style.minHeight = "280px";
  } else {
    cardQuestion.textContent = card.question;
    cardAnswer.textContent = card.answer;
    flashcard3D.style.minHeight = "280px";
  }

  cardQuestion.style.whiteSpace = "pre-line";
  cardAnswer.style.whiteSpace = "pre-line";
  cardProgress.textContent = `${index + 1} / ${cards.length}`;
  flashcard3D.classList.remove("is-flipped");
  flashcard3D.classList.remove("feedback-correct", "feedback-wrong");
  cardFeedback.textContent = "\u00a0";
  cardFeedback.classList.remove("feedback-correct-text", "feedback-wrong-text", "opacity-100");
  cardFeedback.classList.add("opacity-0");
}

function showCard(index) {
  if (!cards.length) return;
  setCard(index);
}

function goToNextCard() {
  if (!cards.length) return;
  currentCardIndex = (currentCardIndex + 1) % cards.length;
  showCard(currentCardIndex);
}

function showAnswerFeedback(type) {
  if (isFeedbackActive) return;
  isFeedbackActive = true;

  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }

  const isCorrect = type === "correct";
  flashcard3D.classList.remove("feedback-correct", "feedback-wrong");
  flashcard3D.classList.add(isCorrect ? "feedback-correct" : "feedback-wrong");

  cardFeedback.textContent = isCorrect ? "Got it" : "Better luck next time";
  cardFeedback.classList.remove("feedback-correct-text", "feedback-wrong-text", "opacity-0");
  cardFeedback.classList.add(isCorrect ? "feedback-correct-text" : "feedback-wrong-text", "opacity-100");

  feedbackTimer = setTimeout(() => {
    isFeedbackActive = false;
    goToNextCard();
  }, 700);
}

function setUploadStatus(message, isError = false) {
  uploadStatus.textContent = message;
  uploadStatus.classList.toggle("text-rose-300", isError);
  uploadStatus.classList.toggle("text-emerald-300", !isError);
}

function setSelectedFile(file) {
  if (!file) return;

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    setUploadStatus("Please upload a valid PDF file.", true);
    selectedPdfFile = null;
    selectedFileName.textContent = "No PDF selected yet.";
    resetProgress();
    return;
  }

  selectedPdfFile = file;
  selectedFileName.textContent = `Selected: ${file.name}`;
  setUploadStatus("File ready to upload.");
}

async function uploadPdfAndGenerateQuestions() {
  if (!selectedPdfFile) {
    setUploadStatus("Please choose a PDF before uploading.", true);
    return;
  }

  if (progressTimer) return;

  let progress = 10;
  setUploadStatus("Uploading PDF and generating questions...");
  resetProgress();
  uploadFileBtn.disabled = true;
  uploadFileBtn.classList.add("opacity-70", "cursor-not-allowed");

  progressTimer = setInterval(() => {
    progress = Math.min(progress + 5, 90);
    uploadProgressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}%`;
  }, 180);

  try {
    const formData = new FormData();
    formData.append("file", selectedPdfFile);
    // const apiEndpoints = [
    //   "http://localhost:5000/api/upload-pdf",
    //   "http://localhost:5000/api/flashcards/upload-pdf"
    // ];
    const apiEndpoints = [
      "https://pdf-to-flashcard-production.up.railway.app/api/upload-pdf",
      "https://pdf-to-flashcard-production.up.railway.app/api/flashcards/upload-pdf"
    ];

    let data = null;
    let lastErrorMessage = "Upload failed";

    for (const endpoint of apiEndpoints) {
      const requestBody = new FormData();
      requestBody.append("file", selectedPdfFile);

      const response = await fetch(endpoint, {
        method: "POST",
        body: requestBody
      });

      const rawResponseText = await response.text();
      console.log(`upload-pdf raw response (${endpoint}):`, rawResponseText);

      const responseType = response.headers.get("content-type") || "";
      if (!responseType.includes("application/json")) {
        lastErrorMessage = "Backend did not return JSON. Check server logs.";
        continue;
      }

      let parsed = null;
      try {
        parsed = JSON.parse(rawResponseText);
      } catch (parseError) {
        console.error(`Failed to parse JSON response from ${endpoint}:`, parseError);
        lastErrorMessage = "Server returned invalid JSON.";
        continue;
      }

      if (!response.ok) {
        lastErrorMessage = parsed.error || "Upload failed";
        continue;
      }

      data = parsed;
      break;
    }

    if (!data) {
      throw new Error(lastErrorMessage);
    }

    const receivedQuestions = Array.isArray(data.questions) ? data.questions : [];
    if (!receivedQuestions.length) {
      throw new Error("No questions were generated from this PDF.");
    }

    cards = receivedQuestions.map(normalizeQuestionItem);

    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
    uploadProgressBar.style.width = "100%";
    progressText.textContent = "100%";
    setUploadStatus(`Uploaded: ${selectedPdfFile.name}`);

    closeModal();
    showFlashcards();
    currentCardIndex = 0;
    showCard(currentCardIndex);
  } catch (error) {
    setUploadStatus(error.message || "Failed to upload PDF.", true);
    console.error("uploadPdfAndGenerateQuestions:", error);
  } finally {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
    uploadFileBtn.disabled = false;
    uploadFileBtn.classList.remove("opacity-70", "cursor-not-allowed");
  }
}

function clearSelectedFile() {
  selectedPdfFile = null;
  pdfInput.value = "";
  selectedFileName.textContent = "No PDF selected yet.";
  setUploadStatus("Selection cleared.");
  resetProgress();
}

openUploadModalBtn.addEventListener("click", openModal);
closeUploadModalBtn.addEventListener("click", closeModal);

uploadModal.addEventListener("click", (event) => {
  if (event.target === uploadModal) closeModal();
});

pdfInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  setSelectedFile(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-active");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-active");
  });
});

dropZone.addEventListener("drop", (event) => {
  const file = event.dataTransfer.files[0];
  setSelectedFile(file);
});

uploadFileBtn.addEventListener("click", uploadPdfAndGenerateQuestions);
clearFileBtn.addEventListener("click", clearSelectedFile);

flashcard3D.addEventListener("click", () => {
  flashcard3D.classList.toggle("is-flipped");
});

flashcard3D.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    flashcard3D.classList.toggle("is-flipped");
  }
});

prevCardBtn.addEventListener("click", () => {
  if (isFeedbackActive) return;
  if (!cards.length) return;
  currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
  showCard(currentCardIndex);
});

nextCardBtn.addEventListener("click", () => {
  if (isFeedbackActive) return;
  goToNextCard();
});

function pulseButton(button) {
  button.style.transform = "scale(0.96)";
  setTimeout(() => {
    button.style.transform = "";
  }, 120);
}

hardBtn.addEventListener("click", () => {
  if (isFeedbackActive) return;
  pulseButton(hardBtn);
  goToNextCard();
});

mediumBtn.addEventListener("click", () => {
  if (isFeedbackActive) return;
  pulseButton(mediumBtn);
  goToNextCard();
});

easyBtn.addEventListener("click", () => {
  if (isFeedbackActive) return;
  pulseButton(easyBtn);
  goToNextCard();
});

wrongBtn.addEventListener("click", () => {
  if (isFeedbackActive) return;
  wrongScore += 1;
  wrongCount.textContent = wrongScore;
  pulseButton(wrongBtn);
  showAnswerFeedback("wrong");
});

correctBtn.addEventListener("click", () => {
  if (isFeedbackActive) return;
  correctScore += 1;
  correctCount.textContent = correctScore;
  pulseButton(correctBtn);
  showAnswerFeedback("correct");
});
