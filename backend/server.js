// const path = require("path");
// require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// const express = require("express");
// const cors = require("cors");
// const flashcardRoutes = require("./routes/flashcardRoutes");

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// app.get("/", (_req, res) => {
//   res.json({ message: "Flashcard API is running." });
// });

// app.use("/api", flashcardRoutes);
// app.use("/api/flashcards", flashcardRoutes);

// app.use((req, res) => {
//   return res.status(404).json({ error: "Route not found" });
// });

// app.use((err, req, res, next) => {
//   console.error("Unhandled server error:", err);
//   return res.status(500).json({ error: err.message || "Something went wrong" });
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const flashcardRoutes = require("./routes/flashcardRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Flashcard API is running." });
});

app.use("/api", flashcardRoutes);

// ❌ REMOVE THIS (duplicate route)
/// app.use("/api/flashcards", flashcardRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  return res.status(500).json({ error: err.message || "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});