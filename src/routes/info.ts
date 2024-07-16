import express from 'express';
import { type Request, type Response } from 'express';
import { fetchInfoAnilist } from '../providers/anilist/fetchInfo';
import { fetchInfoGogo } from '../providers/gogoanime/fetchInfo';
// import fetchInfo9anime from '../providers/9anime/fetchInfo';
// import fetchInfoZoro from '../providers/zoro/fetchInfo';

const router = express.Router();

/**
 * Providers mapping to their respective fetchInfo functions.
 */
const providers: { [key: string]: (id: string) => Promise<any> } = {
    anilist: fetchInfoAnilist,
    gogoanime: fetchInfoGogo,
    // 'otherProvider': fetchInfoOtherProvider, // Add other providers here
};

/**
 * UsageResponse Interface
 * Defines the structure of the response for usage instructions.
 */
interface UsageResponse {
    error: string | null;
    status: number;
    format: {
        id: { type: string, description: string };
        provider: { type: string, description: string };
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
        provider: { type: "string", description: "The provider name. Supported values include 'anilist', 'gogoanime'." }
    },
    example: { url: "/?id=21&provider=anilist" }
});

/**
 * @route GET /
 * @description Fetches information for a specified anime from a given provider.
 * @queryParam {string} id - The unique ID of the anime series.
 * @queryParam {string} provider - The name of the provider. Supported values: 'anilist', 'gogoanime'.
 * @returns {Object} JSON response containing anime information or usage instructions.
 * 
 * @example
 * // Fetch info for 'one-piece' from 'anilist'
 * GET /?id=one-piece&provider=anilist
 * 
 * @response {UsageResponse} 200 - Returns usage instructions if no parameters are provided.
 * @response {Object} 200 - Returns anime information if valid parameters are provided.
 * @response {UsageResponse} 400 - Returns error details and usage instructions if parameters are missing or invalid.
 * @response {string} 500 - Internal server error message if an error occurs while fetching data.
 */
router.get('/', async (req: Request, res: Response) => {
    const { id, provider } = req.query;

    // Return usage instructions if no query parameters are provided
    if (!id && !provider) {
        return res.json(generateResponse());
    }

    // Validate presence of required query parameters
    if (!id || !provider) {
        return res.status(400).json(generateResponse("Missing id or provider", 400));
    }

    const providerKey = provider as string;

    // Validate provider
    if (!providers[providerKey]) {
        return res.status(400).json(generateResponse("Invalid provider", 400));
    }

    try {
        // Fetch information from the specified provider
        const infoResponse = await providers[providerKey](id as string);
        if (!infoResponse) {
            return res.status(404).json(generateResponse("Anime not found", 404));
        }
        res.json(infoResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json(generateResponse('An error occurred while fetching the anime information', 500));
    }
});

export default router;
