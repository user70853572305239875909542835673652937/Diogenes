import axios from "axios";
import { cache, infoQuery } from "../../index";

export const fetchInfoAnilist = async (id: string) => {
  const cacheKey = `anilist:${id}`;

  if (await cache.has(cacheKey)) {
    console.log(`Fetching anime info for id ${id} from cache`);
    return cache.get(cacheKey);
  }

  const variables = {
    id: parseInt(id, 10),
  };

  try {
    const response = await axios.post(
      "https://graphql.anilist.co",
      {
        query: infoQuery,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    const animeInfo = response.data.data.Media;
    cache.set(cacheKey, animeInfo);

    return animeInfo;
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return null;
  }
};
