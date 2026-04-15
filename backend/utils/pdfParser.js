function parsePdfText(rawText) {
  return rawText.replace(/\s+/g, " ").trim();
}

module.exports = {
  parsePdfText
};
