#!/usr/bin/env node
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { ProxyAgent, fetch as undiciFetch } from "undici";
import { getProxyForUrl } from "proxy-from-env";

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
const fileArgs = argv.filter((arg) => !arg.startsWith("--"));

const options = {
  all: flags.has("--all"),
  stage: flags.has("--stage"),
  strict: flags.has("--strict"),
};

const rootDir = process.cwd();
const contentRoot = path.join(rootDir, "src/content");
const outputRoot = path.join(rootDir, "src/data/search/entries");
const maxChars = Number(process.env.SEARCH_LLM_MAX_CHARS || "12000");
const debugEnabled = process.env.SEARCH_LLM_DEBUG === "1";

const log = (message) => process.stdout.write(`${message}\n`);
const debug = (message) => {
  if (debugEnabled) log(message);
};

const isContentFile = (filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  if (!normalized.startsWith("src/content/")) return false;
  return normalized.endsWith(".md") || normalized.endsWith(".mdx");
};

const resolvePath = (filePath) =>
  path.isAbsolute(filePath) ? filePath : path.join(rootDir, filePath);

const hashContent = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");

const stripQuotes = (value) => {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const parseFrontmatter = (raw) => {
  if (!raw.startsWith("---")) {
    return { data: {}, body: raw };
  }

  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) {
    return { data: {}, body: raw };
  }

  const frontmatter = match[1];
  const body = raw.slice(match[0].length);
  const data = {};

  for (const line of frontmatter.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf(":");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = stripQuotes(trimmed.slice(index + 1));

    if (!key) continue;
    if (value === "true") data[key] = true;
    else if (value === "false") data[key] = false;
    else data[key] = value;
  }

  return { data, body };
};

const stripMarkdown = (text) => {
  let cleaned = text;
  cleaned = cleaned.replace(/```[\s\S]*?```/g, " ");
  cleaned = cleaned.replace(/`[^`]*`/g, " ");
  cleaned = cleaned.replace(/<[^>]+>/g, " ");
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");
  cleaned = cleaned.replace(/_([^_]+)_/g, "$1");
  cleaned = cleaned.replace(/^>\s?/gm, "");
  cleaned = cleaned.replace(/^[#-]+\s?/gm, "");
  cleaned = cleaned.replace(/\s+/g, " ");
  return cleaned.trim();
};

const extractHeadings = (raw) => {
  const headings = [];
  for (const line of raw.split("\n")) {
    const match = line.match(/^#{1,6}\s+(.+)$/);
    if (match?.[1]) headings.push(match[1].trim());
  }
  return headings;
};

const buildLLMContent = (raw, maxCharsLimit) => {
  const plain = stripMarkdown(raw);
  if (plain.length <= maxCharsLimit) return plain;

  const headingLines = extractHeadings(raw);
  const headingText = headingLines.length
    ? stripMarkdown(headingLines.join(" | "))
    : "";

  let headingBudget = headingText ? Math.min(1200, Math.floor(maxCharsLimit * 0.2)) : 0;
  let headBudget = Math.floor(maxCharsLimit * (headingText ? 0.55 : 0.65));
  let tailBudget = maxCharsLimit - headingBudget - headBudget;

  if (tailBudget < 0) {
    headBudget = maxCharsLimit - headingBudget;
    tailBudget = 0;
  }

  if (plain.length <= headBudget + tailBudget) return plain;

  const head = plain.slice(0, headBudget).trim();
  const tail = tailBudget > 0 ? plain.slice(-tailBudget).trim() : "";

  return [headingText.slice(0, headingBudget), head, tail]
    .filter(Boolean)
    .join("\n\n")
    .trim()
    .slice(0, maxCharsLimit);
};

const toCollectionAndSlug = (filePath) => {
  const relative = path.relative(contentRoot, filePath).replace(/\\/g, "/");
  const segments = relative.split("/");
  const collection = segments[0];
  const fileName = segments[segments.length - 1];
  const slug = fileName.replace(/\.[^.]+$/, "");
  return { collection, slug };
};

const unique = (items) => {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const value = item.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
};

const fallbackMeta = ({ title, description, slug }) => {
  const text = `${title || ""} ${description || ""} ${slug || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ");

  const words = text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);

  const keywords = unique(words).slice(0, 12);
  const phrases = unique(
    [title, description]
      .filter(Boolean)
      .map((value) => value.toLowerCase())
      .filter((value) => value.split(" ").length >= 2),
  ).slice(0, 6);

  return {
    keywords,
    phrases,
    summary: description || title || "",
  };
};

const extractJson = (input) => {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = input.slice(start, end + 1);
  return JSON.parse(candidate);
};

const normalizeMeta = (meta, fallback) => {
  const keywords = Array.isArray(meta?.keywords) ? meta.keywords : fallback.keywords;
  const phrases = Array.isArray(meta?.phrases) ? meta.phrases : fallback.phrases;
  const summary = typeof meta?.summary === "string" ? meta.summary : fallback.summary;

  const normalizedKeywords = unique(
    keywords.map((word) => String(word).toLowerCase()),
  );
  const normalizedPhrases = unique(
    phrases.map((phrase) => String(phrase).toLowerCase()),
  );

  return {
    keywords: normalizedKeywords.slice(0, 12),
    phrases: normalizedPhrases.slice(0, 6),
    summary: summary.trim(),
  };
};

const callLLM = async ({ title, description, content }) => {
  const endpoint = process.env.SEARCH_LLM_ENDPOINT;
  const apiKey = process.env.SEARCH_LLM_API_KEY;
  const model = process.env.SEARCH_LLM_MODEL;

  if (!endpoint || !apiKey || !model) {
    return { ok: false, error: "Missing SEARCH_LLM_ENDPOINT/API_KEY/MODEL" };
  }

  const trimmedContent = content.slice(0, maxChars);
  const systemPrompt =
    "You are a search indexing assistant. Return only valid JSON, no markdown.";
  const userPrompt = `Generate search metadata as JSON with:\n"keywords" (5-12 lowercase single words),\n"phrases" (3-6 lowercase multi-word phrases),\n"summary" (1 concise sentence, max 200 chars).\nAvoid generic filler words. Output JSON only.\n\nTITLE: ${title || ""}\nDESCRIPTION: ${description || ""}\nCONTENT: ${trimmedContent}`;

  const url = `${endpoint.replace(/\/$/, "")}/v1/chat/completions`;
  const proxyUrl = process.env.SEARCH_LLM_PROXY || getProxyForUrl(url);
  debug(`Search meta: proxy ${proxyUrl ? proxyUrl : "none"}`);
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  };

  if (proxyUrl) {
    fetchOptions.dispatcher = new ProxyAgent(proxyUrl);
  }

  let response;
  try {
    response = await undiciFetch(url, fetchOptions);
  } catch (error) {
    const cause = error?.cause ? ` (cause: ${error.cause})` : "";
    return {
      ok: false,
      error: `fetch failed${cause}`,
    };
  }

  if (!response.ok) {
    return { ok: false, error: `LLM request failed: ${response.status}` };
  }

  const data = await response.json();
  const contentText = data?.choices?.[0]?.message?.content;

  if (!contentText) {
    return { ok: false, error: "LLM response missing content" };
  }

  try {
    const json = extractJson(contentText);
    if (!json) throw new Error("No JSON found in response");
    return { ok: true, data: json, model };
  } catch (error) {
    return { ok: false, error: error.message || "Invalid JSON response" };
  }
};

const collectMarkdownFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectMarkdownFiles(fullPath)));
      continue;
    }
    if (fullPath.endsWith(".md") || fullPath.endsWith(".mdx")) {
      results.push(fullPath);
    }
  }

  return results;
};

const getStagedFiles = () => {
  const result = spawnSync("git", [
    "diff",
    "--name-only",
    "--cached",
    "--",
    "src/content",
  ]);

  if (result.status !== 0) return [];

  return result.stdout
    .toString()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

const main = async () => {
  let files = [];

  if (options.all) {
    files = await collectMarkdownFiles(contentRoot);
  } else if (fileArgs.length > 0) {
    files = fileArgs.map(resolvePath).filter((filePath) =>
      isContentFile(path.relative(rootDir, filePath)),
    );
  } else {
    files = getStagedFiles().map(resolvePath);
  }

  files = files.filter((filePath) => filePath.startsWith(contentRoot));

  if (files.length === 0) {
    log("Search meta: no content files to process.");
    return;
  }

  const updatedFiles = [];

  for (const filePath of files) {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, body } = parseFrontmatter(raw);
    const { collection, slug } = toCollectionAndSlug(filePath);

    const title = data.title || slug;
    const description = data.description || "";
    const contentHash = hashContent(raw);

    const outputDir = path.join(outputRoot, collection);
    const outputPath = path.join(outputDir, `${slug}.json`);

    let previous = null;
    try {
      const existing = await fs.readFile(outputPath, "utf8");
      previous = JSON.parse(existing);
    } catch {
      previous = null;
    }

    if (previous?.contentHash === contentHash) {
      log(`Search meta: ${collection}/${slug} unchanged.`);
      continue;
    }

    const fallback = fallbackMeta({ title, description, slug });
    const llmContent = buildLLMContent(body, maxChars);

    let meta = fallback;
    let source = "fallback";
    let llmInfo = null;

    const llmResult = await callLLM({
      title,
      description,
      content: llmContent,
    });

    if (llmResult.ok) {
      meta = normalizeMeta(llmResult.data, fallback);
      source = "llm";
      llmInfo = {
        provider: "openai-compatible",
        model: llmResult.model,
      };
    } else {
      log(`Search meta: ${collection}/${slug} using fallback (${llmResult.error}).`);
      if (options.strict) {
        throw new Error(llmResult.error);
      }
    }

    const payload = {
      collection,
      slug,
      title,
      description,
      keywords: meta.keywords,
      phrases: meta.phrases,
      summary: meta.summary,
      contentHash,
      updatedAt: new Date().toISOString(),
      source,
      llm: llmInfo,
    };

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

    updatedFiles.push(outputPath);
    log(`Search meta: updated ${collection}/${slug}.`);
  }

  if (options.stage && updatedFiles.length > 0) {
    const result = spawnSync("git", ["add", ...updatedFiles], {
      stdio: "inherit",
    });

    if (result.status !== 0) {
      if (options.strict) {
        process.exit(result.status ?? 1);
      }
      log("Search meta: git add failed; continuing.");
    }
  }
};

main().catch((error) => {
  console.error(`Search meta: ${error.message}`);
  process.exit(1);
});
