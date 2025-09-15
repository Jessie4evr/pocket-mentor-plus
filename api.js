// ===== Pocket Mentor+ API Wrappers =====

// These are client-side wrappers for the Chrome Built-in AI APIs
// Uses Gemini Nano

export async function summarizeText(text) {
  if (!window.ai?.summarizer) throw new Error("Summarizer API not available.");
  const session = await window.ai.summarizer.create({ model: "gemini-nano" });
  const result = await session.summarize(text);
  await session.destroy();
  return result || "No summary generated.";
}

export async function translateText(text, targetLang = "es") {
  if (!window.ai?.translator) throw new Error("Translator API not available.");
  const session = await window.ai.translator.create({ model: "gemini-nano", targetLanguage: targetLang });
  const result = await session.translate(text);
  await session.destroy();
  return result || "No translation generated.";
}

export async function proofreadText(text) {
  if (!window.ai?.proofreader) throw new Error("Proofreader API not available.");
  const session = await window.ai.proofreader.create({ model: "gemini-nano" });
  const result = await session.proofread(text);
  await session.destroy();
  return result || "No proofread result.";
}

export async function writeText(text, style = "polished") {
  if (!window.ai?.rewriter) throw new Error("Rewriter API not available.");
  const session = await window.ai.rewriter.create({ model: "gemini-nano" });
  const result = await session.rewrite(text, { style });
  await session.destroy();
  return result || "No rewrite result.";
}
