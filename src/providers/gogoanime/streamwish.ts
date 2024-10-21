import axios from "axios";
import * as cheerio from "cheerio";
import { unpack, detect } from "unpacker";

interface DecData {
  m3u8?: string;
  slides?: string;
}

/**
 * Checks if the script is packed using P.A.C.K.E.R.
 * @param script The JavaScript code as a string.
 * @returns True if packed, false otherwise.
 */
function isPackerEncoded(script: string): boolean {
  return /eval\(function\(p,a,c,k,e,d\)\{/.test(script);
}

/**
 * Unpacks P.A.C.K.E.R. encoded JavaScript using the 'unpacker' package.
 * @param script The packed JavaScript code.
 * @returns The unpacked JavaScript code or null if unpacking fails.
 */
function unpackPacker(script: string): string | null {
  if (detect(script)) {
    try {
      return unpack(script);
    } catch (error) {
      console.error("Error unpacking script with unpacker:", error);
      return null;
    }
  }
  return script; // Return the original script if it's not packed
}

/**
 * Extracts the slides URL from the unpacked script content.
 * @param scriptContent The unpacked JavaScript code as a string.
 * @returns The full slides URL or null if not found.
 */
function extractSlidesUrl(scriptContent: string): string | null {
  const regex = /file\s*:\s*"([^"]+\.jpg[^"]*)"/;
  const match = scriptContent.match(regex);
  if (match && match[1]) {
    // Construct the full URL
    const relativePath = match[1];
    // Assuming the base URL is 'https://awish.pro', adjust if different
    return `https://awish.pro${relativePath}`;
  }
  return null;
}

/**
 * Extracts and processes URLs from the awish.pro embed page.
 * @param embedLink - The embed page URL.
 * @returns The cleaned decrypted data or null if not found.
 */
export const streamwish = async (
  embedLink: string,
): Promise<DecData | null> => {
  try {
    // Fetch the embed page
    const response = await axios.get(embedLink, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    const html = response.data;
    const $ = cheerio.load(html);

    // Select all <script> tags
    const scripts = $("script");

    let scriptContent: string | null = null;

    // Find the script containing 'm3u8'
    scripts.each((_, el) => {
      const script = $(el).html();
      if (script && script.includes("m3u8")) {
        scriptContent = script;
        return false; // Exit the loop once found
      }
    });

    if (!scriptContent) {
      console.warn("No script containing m3u8 found.");
      return null;
    }

    // Check if the script is packed using P.A.C.K.E.R.
    if (isPackerEncoded(scriptContent)) {
      const unpacked = unpackPacker(scriptContent);
      if (unpacked) {
        scriptContent = unpacked;
      } else {
        console.warn("Unpacking failed or resulted in null.");
        return null;
      }
    }

    // Extract the master URL using improved regex
    let masterUrlMatch =
      scriptContent.match(/file\s*:\s*"([^"]+\.m3u8[^"]*)"/) ||
      scriptContent.match(/src\s*:\s*"([^"]+\.m3u8[^"]*)"/);
    const masterUrl = masterUrlMatch ? masterUrlMatch[1] : null;

    let slidesUrl: string | null = null;

    if (!masterUrl) {
      // Alternative extraction method
      masterUrlMatch = scriptContent.match(
        /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/,
      );
      if (masterUrlMatch) {
        slidesUrl = extractSlidesUrl(scriptContent);
      } else {
        console.warn("Master URL not found in script.");
        return null;
      }
    } else {
      // Extract the slides URL
      slidesUrl = extractSlidesUrl(scriptContent);
    }

    // Structure the result to match DecData
    const result: DecData = {};

    if (masterUrl) {
      result.m3u8 = masterUrl;
    }

    if (slidesUrl) {
      result.slides = slidesUrl;
    }

    return result;
  } catch (error) {
    console.error("Error fetching URL:", error);
    return null;
  }
};

// Example usage
// (async () => {
//   const embedLink = 'https://awish.pro/e/62t32zipr5o6';
//   const result = await streamwish(embedLink);

//   if (!result) {
//     console.log('No Master URL or Slides URL found.');
//   } else {
//     if (result.primarySrc) {
//       console.log('Primary Source Found:', result.primarySrc.file);
//     } else {
//       console.log('Primary Source not found.');
//     }

//     if (result.backupSrc) {
//       console.log('Backup Source Found:', result.backupSrc.file);
//     } else {
//       console.log('Backup Source not found.');
//     }
//   }
// })();
