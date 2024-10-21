import axios from "axios";
import * as cheerio from "cheerio";
import { cache } from "../../utils/cacheSetup";
import { gogoCDN } from "./gogocdn";
import { streamwish } from "./streamwish";

interface Src {
  embed: string;
  m3u8?: string;
  m3u8_bk?: string;
  slides?: string;
}

interface SrcResponse {
  provider: string;
  epId: string;
  srcList: { [key: string]: Src };
}

interface CachedSrc {
  srcList: { [key: string]: Src };
}

interface DecData {
  m3u8?: string;
  m3u8_bk?: string;
  slides?: string;
}

/**
 * Retrieves sources for a specific anime episode from various servers.
 * @param provider - Name of the provider.
 * @param id - Identifier for the anime.
 * @param ep - Episode number.
 * @returns An object containing the sources and related details.
 */
export const fetchSourcesGogo = async (
  provider: string,
  id: string,
  ep: string,
): Promise<SrcResponse> => {
  const srcs: { [key: string]: Src } = {};
  const epId = `${id}-episode-${ep}`;
  const cacheKey = epId;

  try {
    // Retrieve cached data if available
    const cached: CachedSrc | null = await cache.get(cacheKey);
    if (cached) {
      console.log(`Fetching episode ${ep} from cache`);
      if (cached.srcList && Object.keys(cached.srcList).length > 0) {
        Object.assign(srcs, cached.srcList);
        return { provider, epId: epId, srcList: srcs };
      } else {
        console.warn("Cached data is invalid or empty, fetching anew...");
      }
    }

    // Construct episode URL
    const epUrl = `https://anitaku.pe/${id}-episode-${ep}`;

    const { data } = await axios.get(epUrl);
    const $ = cheerio.load(data);
    const serverAnchors = $(".anime_muti_link ul li a");

    if (serverAnchors.length === 0) {
      console.error(`No server links found for episode ${ep}`);
      return { provider, epId: epId, srcList: srcs };
    }

    // Define extractors for different servers
    const extractors: {
      [key: string]: (embedUrl: string) => Promise<DecData | null>;
    } = {
      Vidstreaming: gogoCDN,
      Streamwish: streamwish,
      // Add other server extractors here, e.g., Mp4Upload, Doodstream, Vidhide
    };

    // Collect supported server extractors
    const supportedServers: Array<{
      server: string;
      embedUrl: string;
      extractor: (embedUrl: string) => Promise<DecData | null>;
    }> = [];

    serverAnchors.each((_, element) => {
      const anchor = $(element);
      const embedUrl = anchor.attr("data-video");
      const server = anchor.contents().not(anchor.find("span")).text().trim();

      if (!embedUrl || !server) {
        console.warn(
          "Skipping a server due to missing embed URL or server name.",
        );
        return;
      }

      if (extractors[server]) {
        supportedServers.push({
          server,
          embedUrl,
          extractor: extractors[server],
        });
      } else {
        // **New Logic:** For unsupported servers, add the embed URL directly
        console.warn(
          `Unsupported server: ${server}, adding embed URL without extractor.`,
        );
        srcs[server] = {
          embed: embedUrl,
        };
      }
    });

    if (supportedServers.length === 0 && Object.keys(srcs).length === 0) {
      console.warn("No supported servers found for this episode.");
      return { provider, epId: epId, srcList: srcs };
    }

    if (supportedServers.length > 0) {
      console.log(
        `Processing ${supportedServers.length} supported servers concurrently.`,
      );

      // Process all supported servers concurrently
      const extractorPromises = supportedServers.map(
        async ({ server, embedUrl, extractor }) => {
          console.log(`Processing server: ${server}`);
          try {
            const decData = await extractor(embedUrl);
            if (decData) {
              srcs[server] = {
                embed: embedUrl,
                m3u8: decData.m3u8,
                m3u8_bk: decData.m3u8_bk,
                slides: decData.slides,
              };
              console.log(`Successfully extracted sources from ${server}`);
            } else {
              console.warn(
                `Failed to extract decrypted data for server: ${server}`,
              );
            }
          } catch (srvErr) {
            console.error(`Error extracting data from ${server}:`, srvErr);
          }
        },
      );

      // Await all extractor promises
      await Promise.all(extractorPromises);
    }

    // Cache the results if valid sources are found
    if (Object.keys(srcs).length > 0) {
      await cache.set(cacheKey, { srcList: srcs });
      console.log(`Cached sources for episode ${epId}`);
    } else {
      console.warn("No valid sources found, not caching the result");
    }
  } catch (err) {
    console.error(`Error fetching episode ${ep}:`, err);
  }

  return { provider, epId: epId, srcList: srcs };
};
