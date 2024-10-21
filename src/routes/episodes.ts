import express from "express";
import { type Request, type Response } from "express";
import { fetchEpisodesZoro } from "../providers/zoro/fetchEpisodes";

const router = express.Router();

/**
 * Providers mapping to their respective fetchEpisodes functions.
 */
const episodeProviders: { [key: string]: (id: string) => Promise<any> } = {
  zoro: fetchEpisodesZoro,
  // Add other providers here when their fetchEpisodes functions are available
};

/**
 * UsageResponse Interface
 * Defines the structure of the response for usage instructions.
 */
interface UsageResponse {
  error: string | null;
  status: number;
  format: {
    id: { type: string; description: string };
    provider: { type: string; description: string };
  };
  example: { url: string };
}

/**
 * Generates a usage response with optional error message.
 * @param error - Optional error message
 * @param status - HTTP status code
 * @returns UsageResponse object
 */
const generateResponse = (
  error: string | null = null,
  status: number = 200,
): UsageResponse => ({
  error,
  status,
  format: {
    id: {
      type: "string",
      description:
        "The ID of the anime. This is a unique identifier for the anime series.",
    },
    provider: {
      type: "string",
      description: "The provider name. Supported values include 'zoro'.",
    },
  },
  example: { url: "/episodes?id=19319&provider=zoro" },
});

/**
 * @route GET /
 * @description Fetches episodes for a specified anime from a given provider.
 * @queryParam {string} id - The unique ID of the anime series.
 * @queryParam {string} provider - The name of the provider. Supported values: 'zoro'.
 * @returns {Object} JSON response containing episodes information or usage instructions.
 *
 * @example
 * // Fetch episodes for 'Dandadan' from 'zoro'
 * GET /episodes?id=19319&provider=zoro
 *
 * @response {UsageResponse} 200 - Returns usage instructions if no parameters are provided.
 * @response {Object} 200 - Returns episodes information if valid parameters are provided.
 * @response {UsageResponse} 400 - Returns error details and usage instructions if parameters are missing or invalid.
 * @response {UsageResponse} 404 - Returns error details if the episodes are not found.
 * @response {UsageResponse} 500 - Internal server error message if an error occurs while fetching data.
 */
router.get("/", async (req: Request, res: Response) => {
  const { id, provider } = req.query;

  // Return usage instructions if no query parameters are provided
  if (!id && !provider) {
    return res.json(generateResponse());
  }

  // Validate presence of required query parameters
  if (!id || !provider) {
    return res
      .status(400)
      .json(generateResponse("Missing id or provider", 400));
  }

  const providerKey = provider as string;

  // Validate provider
  if (!episodeProviders[providerKey]) {
    return res.status(400).json(generateResponse("Invalid provider", 400));
  }

  try {
    // Fetch episodes from the specified provider
    const episodesResponse = await episodeProviders[providerKey](id as string);
    if (!episodesResponse) {
      return res.status(404).json(generateResponse("Episodes not found", 404));
    }
    res.json(episodesResponse);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(
        generateResponse(
          "An error occurred while fetching the episodes information",
          500,
        ),
      );
  }
});

export default router;
