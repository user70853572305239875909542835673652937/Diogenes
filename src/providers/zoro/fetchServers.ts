import axios from "axios";
import * as cheerio from "cheerio"; // Import cheerio as a namespace to access types
import { cache } from "../../utils/cacheSetup";

// Define the Server interface
interface Server {
  type: "sub" | "dub" | "raw"; // Type of the server
  id: string; // data-id
  name: string; // Button text, e.g., 'HD-1'
  sourceType?: string; // e.g., "iframe"
  server: number; // Server ID
  link?: string; // URL to the source
}

// Define the Servers interface with sub, dub, raw as objects keyed by server name
interface Servers {
  status: boolean;
  sub: Record<string, Server>;
  dub: Record<string, Server>;
  raw: Record<string, Server>;
}

/**
 * Fetches the list of servers for a given episode from Zoro.
 * @param {string} epId - The unique ID of the episode.
 * @returns {Promise<Servers | null>} - The list of servers or null if not found.
 */
export const fetchServersZoro = async (
  epId: string,
): Promise<Servers | null> => {
  const cacheKey = `servers:zoro:${epId}`;

  // Check if data is in cache
  if (await cache.has(cacheKey)) {
    console.log(`Fetching servers for epId ${epId} from cache`);
    const cachedData = await cache.get(cacheKey);
    return cachedData as Servers | null;
  }

  const url = `https://hianime.to/ajax/v2/episode/servers?episodeId=${epId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/58.0.3029.110 Safari/537.3",
        "X-Requested-With": "XMLHttpRequest",
        Referer: "https://hianime.to/", // Added Referer header
        Host: "hianime.to", // Added Host header
      },
      timeout: 10000, // 10 seconds timeout
    });

    const data = response.data;

    if (!data.status || !data.html) {
      console.error(`Invalid response structure for epId ${epId}`);
      return null;
    }

    const $ = cheerio.load(data.html);

    const servers: Servers = {
      status: data.status,
      sub: {},
      dub: {},
      raw: {},
    };

    /**
     * Parses server items based on type ('sub', 'dub', or 'raw') and populates the servers object.
     * @param { 'sub' | 'dub' | 'raw' } type - The type of servers to parse.
     */
    const parseServers = (type: "sub" | "dub" | "raw") => {
      const selector =
        type === "raw"
          ? `.ps_-block.ps_-block-sub.servers-raw .server-item`
          : `.ps_-block.servers-${type} .server-item`;
      $(selector).each((_: number, element: cheerio.Element) => {
        // Use cheerio.Element
        const el = $(element);
        const serverType = el.attr("data-type") as "sub" | "dub" | "raw"; // Ensure serverType is 'sub', 'dub', or 'raw'
        const id = el.attr("data-id") || "";
        const serverId = el.attr("data-server-id") || "";
        const name = el.find("a.btn").text().trim();

        if (id && serverId && name) {
          // Assign server object to the corresponding key (server name)
          servers[type][name] = {
            type: serverType,
            id,
            server: Number(serverId),
            name,
            // sourceType and link will be added later
          };
        }
      });
    };

    // Parse SUB servers
    parseServers("sub");

    // Parse DUB servers
    parseServers("dub");

    // Parse RAW servers
    parseServers("raw");

    // Collect all servers into a single array for fetching sources
    const allServers: Server[] = [
      ...Object.values(servers.sub),
      ...Object.values(servers.dub),
      ...Object.values(servers.raw),
    ];

    // Fetch sources for each server and add source properties directly to the server
    await Promise.all(allServers.map((server) => fetchSources(server)));

    // Store in cache
    await cache.set(cacheKey, servers);

    return servers;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error while fetching ${url}:`, error.message);
    } else if (error instanceof Error) {
      console.error(`Unexpected error while fetching ${url}:`, error.message);
    } else {
      console.error(`Unexpected error while fetching ${url}:`, error);
    }
    return null;
  }
};

/**
 * Fetch sources for a given server and assign source properties directly to the server.
 * @param {Server} server - The server object containing ID.
 * @returns {Promise<void>}
 */
const fetchSources = async (server: Server): Promise<void> => {
  const sourcesUrl = `https://hianime.to/ajax/v2/episode/sources?id=${server.id}`;
  try {
    const response = await axios.get(sourcesUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/58.0.3029.110 Safari/537.3",
        "X-Requested-With": "XMLHttpRequest",
        Referer: "https://hianime.to/",
        Host: "hianime.to",
      },
      timeout: 10000, // 10 seconds timeout
    });

    const sourceData = response.data;

    // Ensure response contains the expected structure
    if (sourceData && sourceData.type && sourceData.link) {
      // Assign source properties directly to server
      server.sourceType = sourceData.type;
      server.link = sourceData.link;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `Error fetching sources for server ${server.id}:`,
        error.message,
      );
    } else {
      console.error(`Error fetching sources for server ${server.id}:`, error);
    }
  }
};
