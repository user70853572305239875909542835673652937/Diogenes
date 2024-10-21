import express from "express";
import { type Request, type Response } from "express";
import { fetchServersZoro } from "../providers/zoro/fetchServers";

const router = express.Router();

/**
 * Providers mapping to their respective fetchServers functions.
 */
const serverProviders: { [key: string]: (epId: string) => Promise<any> } = {
  zoro: fetchServersZoro,
  // Add other providers here when their fetchServers functions are available
};

/**
 * UsageResponse Interface
 * Defines the structure of the response for usage instructions.
 */
interface UsageResponse {
  error: string | null;
  status: number;
  format: {
    epId: { type: string; description: string };
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
    epId: {
      type: "string",
      description:
        "The ID of the episode. This is a unique identifier for the episode.",
    },
    provider: {
      type: "string",
      description: "The provider name. Supported values include 'zoro'.",
    },
  },
  example: { url: "/servers?epId=128549&provider=zoro" },
});

/**
 * @route GET /
 * @description Fetches server information for a specified episode from a given provider.
 * @queryParam {string} epId - The unique ID of the episode.
 * @queryParam {string} provider - The name of the provider. Supported values: 'zoro'.
 * @returns {Object} JSON response containing server information or usage instructions.
 *
 * @example
 * // Fetch servers for episode '128549' from 'zoro'
 * GET /servers?epId=128549&provider=zoro
 *
 * @response {UsageResponse} 200 - Returns usage instructions if no parameters are provided.
 * @response {Object} 200 - Returns server information if valid parameters are provided.
 * @response {UsageResponse} 400 - Returns error details and usage instructions if parameters are missing or invalid.
 * @response {UsageResponse} 404 - Returns error details if the servers are not found.
 * @response {UsageResponse} 500 - Internal server error message if an error occurs while fetching data.
 */
router.get("/", async (req: Request, res: Response) => {
  const { epId, provider } = req.query;

  // Return usage instructions if no query parameters are provided
  if (!epId && !provider) {
    return res.json(generateResponse());
  }

  // Validate presence of required query parameters
  if (!epId || !provider) {
    return res
      .status(400)
      .json(generateResponse("Missing epId or provider", 400));
  }

  const providerKey = provider as string;

  // Validate provider
  if (!serverProviders[providerKey]) {
    return res.status(400).json(generateResponse("Invalid provider", 400));
  }

  try {
    // Fetch servers from the specified provider
    const serversResponse = await serverProviders[providerKey](epId as string);
    if (!serversResponse) {
      return res.status(404).json(generateResponse("Servers not found", 404));
    }
    res.json(serversResponse);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(
        generateResponse(
          "An error occurred while fetching the servers information",
          500,
        ),
      );
  }
});

export default router;
