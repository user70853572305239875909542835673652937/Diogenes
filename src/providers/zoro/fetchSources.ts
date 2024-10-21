import axios from "axios";
import crypto from "crypto";
import { cache } from "../../utils/cacheSetup";

// Interface for subtitle tracks
interface Track {
  file: string;
  label?: string;
  kind: string;
  default?: boolean;
}

// Interface for source data
interface Source {
  sources: { url: string; type: string }[];
  tracks: Track[];
  intro: { start: number; end: number };
  outro: { start: number; end: number };
  server: number;
}

// Constants for URLs and headers
const MEGACLOUD_BASE_URL = "https://megacloud.tv";
const SOURCES_URL = `${MEGACLOUD_BASE_URL}/embed-2/ajax/e-1/getSources?id=`;
const SCRIPT_URL = `${MEGACLOUD_BASE_URL}/js/player/a/prod/e1-player.min.js?v=`;
const DEFAULT_HEADERS = {
  Accept: "*/*",
  "X-Requested-With": "XMLHttpRequest",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/58.0.3029.110 Safari/537.3",
  Referer: "https://hianime.to/",
  Host: "megacloud.tv",
};

/**
 * Fetches sources for a given server ID from Zoro.
 * @param provider - The provider name.
 * @param id - The unique ID of the server.
 * @param ep - The episode identifier.
 * @returns The source data or null if not found.
 */
export const fetchSourcesZoro = async (
  provider: string,
  id: string,
  ep: string,
): Promise<Source | null> => {
  const cacheKey = `zoro:sources:${id}`;

  // Check if data is in the cache
  if (await cache.has(cacheKey)) {
    console.log(`Fetching sources for ${id} from cache.`);
    return (await cache.get(cacheKey)) as Source;
  }

  try {
    // Fetch the source data
    const { data: sourceData } = await axios.get(`${SOURCES_URL}${id}`, {
      headers: DEFAULT_HEADERS,
      timeout: 10000,
    });

    if (!sourceData) {
      throw new Error("Invalid response from Megacloud.");
    }

    // Initialize extracted data
    const extractedData: Source = {
      tracks: sourceData.tracks || [],
      intro: sourceData.intro || { start: 0, end: 0 },
      outro: sourceData.outro || { start: 0, end: 0 },
      sources: [],
      server: sourceData.server || 0,
    };

    const encryptedSources = sourceData.sources;

    if (!sourceData.encrypted && Array.isArray(encryptedSources)) {
      extractedData.sources = encryptedSources.map((s: any) => ({
        url: s.file,
        type: s.type,
      }));

      // Cache and return the data
      await cache.set(cacheKey, extractedData);
      return extractedData;
    }

    // Fetch the decryption script
    const { data: scriptData } = await axios.get(`${SCRIPT_URL}${Date.now()}`);

    // Extract variables from the script
    const vars = extractVariables(scriptData);
    if (!vars.length) {
      throw new Error(
        "Cannot find variables; the extractor might be outdated.",
      );
    }

    // Get the secret and encrypted source
    const { secret, encryptedSource } = getSecret(
      encryptedSources as string,
      vars,
    );

    // Decrypt the encrypted source
    const decrypted = decrypt(encryptedSource, secret);

    // Parse and set the decrypted sources
    const sources = JSON.parse(decrypted);
    extractedData.sources = sources.map((s: any) => ({
      url: s.file,
      type: s.type,
    }));

    // Cache and return the data
    await cache.set(cacheKey, extractedData);
    return extractedData;
  } catch (error) {
    console.error(
      `Error fetching sources for ${id}:`,
      axios.isAxiosError(error) ? error.message : error,
    );
    return null;
  }
};

/**
 * Extracts variables needed for decryption from the script.
 * @param scriptText - The script content.
 * @returns An array of variable pairs.
 */
const extractVariables = (scriptText: string): number[][] => {
  const regex =
    /case\s*0x[0-9a-f]+:(?![^;]*=partKey)\s*\w+\s*=\s*(\w+),\s*\w+\s*=\s*(\w+);/g;
  const matches = scriptText.matchAll(regex);

  const vars = Array.from(matches, (match) => {
    const key1 = matchingKey(match[1], scriptText);
    const key2 = matchingKey(match[2], scriptText);
    return [parseInt(key1, 16), parseInt(key2, 16)];
  }).filter((pair) => pair.every((num) => !isNaN(num)));

  return vars;
};

/**
 * Retrieves the secret and encrypted source based on extracted variables.
 * @param encryptedString - The encrypted sources string.
 * @param values - The extracted variable pairs.
 * @returns The secret and encrypted source.
 */
const getSecret = (
  encryptedString: string,
  values: number[][],
): { secret: string; encryptedSource: string } => {
  let secret = "";
  const encryptedSourceArray = encryptedString.split("");
  let currentIndex = 0;

  for (const [startOffset, length] of values) {
    const start = startOffset + currentIndex;
    const end = start + length;

    for (let i = start; i < end; i++) {
      secret += encryptedString[i];
      encryptedSourceArray[i] = "";
    }
    currentIndex += length;
  }

  const encryptedSource = encryptedSourceArray.join("");

  return { secret, encryptedSource };
};

/**
 * Decrypts the encrypted source using the secret.
 * @param encrypted - The encrypted source string.
 * @param secret - The secret key for decryption.
 * @returns The decrypted source string.
 */
const decrypt = (encrypted: string, secret: string): string => {
  const cipherBuffer = Buffer.from(encrypted, "base64");
  const salt = cipherBuffer.subarray(8, 16);
  const password = Buffer.concat([Buffer.from(secret, "binary"), salt]);

  const md5Hashes: Buffer[] = [];
  let digest = password;
  for (let i = 0; i < 3; i++) {
    const hash = crypto.createHash("md5").update(digest).digest();
    md5Hashes.push(hash);
    digest = Buffer.concat([hash, password]);
  }

  const key = Buffer.concat([md5Hashes[0], md5Hashes[1]]);
  const iv = md5Hashes[2];
  const content = cipherBuffer.subarray(16);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = decipher.update(content) + decipher.final("utf8");

  return decrypted;
};

/**
 * Matches and retrieves a key from the script.
 * @param variableName - The variable name to match.
 * @param scriptText - The script content.
 * @returns The matched key in hexadecimal format.
 */
const matchingKey = (variableName: string, scriptText: string): string => {
  const regex = new RegExp(`,${variableName}=((?:0x)?([0-9a-fA-F]+))`);
  const match = scriptText.match(regex);
  if (match) {
    return match[1].replace(/^0x/, "");
  } else {
    throw new Error("Failed to match the key.");
  }
};
