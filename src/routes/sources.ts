import express from 'express';
import { type Request, type Response } from 'express';
import { fetchSourcesGogo } from '../index';
import { fetchSourcesPahe } from '../providers/animepahe/fetchSources';
// import fetchSourcesZoro from '../providers/zoro/fetchSources';

const router = express.Router();

/**
 * Providers mapping to their respective fetch source functions.
 */
const providers: { [key: string]: (provider: string, id: string, ep: string | number) => Promise<any> } = {
    gogoanime: fetchSourcesGogo,
    animepahe: fetchSourcesPahe, // Added AnimePahe provider
    // 'zoro': fetchSourcesZoro
};

/**
 * UsageResponse Interface
 */
interface UsageResponse {
    error: string | null;
    status: number;
    format: {
        id: { type: string; description: string };
        ep: { type: string; description: string };
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
const generateResponse = (error: string | null = null, status: number = 200): UsageResponse => ({
    error,
    status,
    format: {
        id: { type: "string", description: "The ID of the anime. This is a unique identifier for the anime series." },
        ep: { type: "string", description: "The episode identifier. This can be a number or a string (e.g., 'S1E1', 'OVA')." },
        provider: { type: "string", description: "The provider name. Supported values include 'gogoanime', 'animepahe'." }
    },
    example: { url: "/?id=one-piece&ep=1&provider=gogoanime" }
});

/**
 * @route GET /
 * @description Fetches streaming sources for a specified anime episode from a given provider.
 * @queryParam {string} id - The unique ID of the anime series.
 * @queryParam {string|number} ep - The episode identifier, which can be a number or string.
 * @queryParam {string} provider - The name of the provider. Supported values: 'gogoanime', 'animepahe'.
 * @returns {Object} JSON response containing streaming sources or usage information.
 * 
 * @example
 * // Fetch sources for episode 1 of 'one-piece' from 'gogoanime'
 * GET /?id=one-piece&ep=1&provider=gogoanime
 * 
 * @response {UsageResponse} 200 - Returns usage instructions if no parameters are provided.
 * @response {Object} 200 - Returns streaming sources if valid parameters are provided.
 * @response {UsageResponse} 400 - Returns error details and usage instructions if parameters are missing or invalid.
 * @response {UsageResponse} 500 - Internal server error message if an error occurs while fetching data.
 */
router.get('/', async (req: Request, res: Response) => {
    const { id, ep, provider } = req.query;

    // Return usage instructions if no query parameters are provided
    if (!id && !ep && !provider) {
        return res.json(generateResponse());
    }

    // Validate presence of required query parameters
    if (!id || !ep || !provider) {
        return res.status(400).json(generateResponse("Missing id, episode identifier, or provider", 400));
    }

    const providerKey = provider as string;

    // Validate provider
    if (!providers[providerKey]) {
        return res.status(400).json(generateResponse("Invalid provider", 400));
    }

    try {
        const animeId = id as string;
        const episodeIdentifier = ep as string;

        // Add additional validation if necessary for specific episode formats
        if (!episodeIdentifier) {
            return res.status(400).json(generateResponse("Invalid episode identifier", 400));
        }

        // Fetch sources from the specified provider
        const sourcesResponse = await providers[providerKey](providerKey, animeId, episodeIdentifier);

        if (!sourcesResponse) {
            return res.status(404).json(generateResponse("No sources found", 404));
        }

        res.json(sourcesResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json(generateResponse('An error occurred while fetching the source data', 500));
    }
});

export default router;
