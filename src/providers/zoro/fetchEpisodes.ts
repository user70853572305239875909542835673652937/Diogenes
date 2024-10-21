import axios from "axios";
import { load } from "cheerio";
import { cache } from "../../utils/cacheSetup";

// Define the Episode interface
interface Episode {
  number: number;
  id: string;
  title: string;
  jptitle?: string;
  href: string;
  dataNumber: string;
  dataId: string;
}

// Define the EpisodeListResponse interface
interface EpisodeList {
  status: boolean;
  episodes: Episode[];
  totalItems: number;
  continueWatch: any;
}

// Main function to fetch episode list
export const fetchEpisodesZoro = async (
  id: string,
): Promise<EpisodeList | null> => {
  const cacheKey = `episodes:zoro:${id}`;

  // Check if data is in cache
  if (await cache.has(cacheKey)) {
    console.log(`Fetching episodes for id ${id} from cache`);
    return cache.get(cacheKey);
  }

  const url = `https://hianime.to/ajax/v2/episode/list/${id}`;

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
      timeout: 10000,
    });

    const data = response.data;

    if (!data.status || !data.html) {
      console.error(`Invalid response structure for id ${id}`);
      return null;
    }

    const $ = load(data.html);

    const episodes: Episode[] = [];

    $(".ss-list a.ep-item").each((_, element) => {
      const el = $(element);
      const numberText = el.attr("data-number") || "0";
      const number = parseInt(numberText, 10);
      const episodeId = el.attr("data-id") || "";
      const href = el.attr("href") || "";
      const title = el.find(".ep-name").text().trim();
      const jptitle = el.find(".ep-name").attr("data-jname")?.trim();

      episodes.push({
        number,
        id: episodeId,
        title,
        jptitle,
        href,
        dataNumber: numberText,
        dataId: episodeId,
      });
    });

    const episodeList: EpisodeList = {
      status: data.status,
      episodes,
      totalItems: data.totalItems,
      continueWatch: data.continueWatch,
    };

    // Store in cache
    cache.set(cacheKey, episodeList);

    return episodeList;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error while fetching ${url}:`, error.message);
    } else {
      console.error(`Unexpected error while fetching ${url}:`, error);
    }
    return null;
  }
};
