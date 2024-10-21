import axios from "axios";
import * as cheerio from "cheerio";
import CryptoJS from "crypto-js";

interface DecData {
  m3u8?: string;
  m3u8_bk?: string;
}

/**
 * Cleans the decrypted data by removing unnecessary fields and simplifying the structure.
 * @param raw - The raw decrypted data object.
 * @returns The cleaned decrypted data.
 */
const cleanDecData = (raw: any): DecData => {
  const clean: DecData = {};

  if (raw.source && Array.isArray(raw.source) && raw.source.length > 0) {
    clean.m3u8 = raw.source[0].file;
  }

  if (
    raw.source_bk &&
    Array.isArray(raw.source_bk) &&
    raw.source_bk.length > 0
  ) {
    clean.m3u8_bk = raw.source_bk[0].file;
  }

  return clean;
};

/**
 * Retrieves and decrypts data from the GogoCDN server using specified decryption logic.
 * @param embedLink - The embed page URL.
 * @returns The cleaned decrypted data or null if not found.
 */
export const gogoCDN = async (embedLink: string): Promise<DecData | null> => {
  const cryptoKeys = {
    key: CryptoJS.enc.Utf8.parse("37911490979715163134003223491201"),
    secKey: CryptoJS.enc.Utf8.parse("54674138327930866480207815084989"),
    iv: CryptoJS.enc.Utf8.parse("3134003223491201"),
  };

  try {
    const embedURL = new URL(embedLink);
    const vidId = embedURL.searchParams.get("id");

    if (!vidId) {
      console.error("No id found in embed URL");
      return null;
    }

    // Fetch the embed page
    const { data } = await axios.get(embedLink);
    const $ = cheerio.load(data);

    // Extract the encrypted token from the script tag
    const encToken = $("script[data-name='episode']").attr("data-value");

    if (!encToken) {
      console.error("No data-value attribute found");
      return null;
    }

    // Decrypt the token to obtain the decrypted token
    const decToken = CryptoJS.AES.decrypt(encToken, cryptoKeys.key, {
      iv: cryptoKeys.iv,
    }).toString(CryptoJS.enc.Utf8);

    // Encrypt the vidId to generate the encrypted key
    const encKey = CryptoJS.AES.encrypt(vidId, cryptoKeys.key, {
      iv: cryptoKeys.iv,
    }).toString();

    // Construct encrypted parameters for the request
    const encParams = `id=${encodeURIComponent(encKey)}&alias=${vidId}&${decToken}`;

    // Build the AJAX URL with encrypted parameters
    const ajaxURL = `${embedURL.protocol}//${embedURL.hostname}/encrypt-ajax.php?${encParams}`;

    const headers = {
      "X-Requested-With": "XMLHttpRequest",
      Referer: embedLink,
    };

    const { data: encData } = await axios.get(ajaxURL, { headers });

    if (!encData.data) {
      console.error("No data in encryptedData");
      return null;
    }

    // Decrypt the received data
    const decDataStr = CryptoJS.AES.decrypt(encData.data, cryptoKeys.secKey, {
      iv: cryptoKeys.iv,
    }).toString(CryptoJS.enc.Utf8);

    const decDataRaw: any = JSON.parse(decDataStr);

    if (
      (!decDataRaw.source || decDataRaw.source.length === 0) &&
      (!decDataRaw.source_bk || decDataRaw.source_bk.length === 0)
    ) {
      console.error("No source found in decryptedData");
      return null;
    }

    // Clean the decrypted data
    const cleanDec = cleanDecData(decDataRaw);

    return cleanDec;
  } catch (err) {
    console.error("Error fetching decrypted data:", err);
    return null;
  }
};
