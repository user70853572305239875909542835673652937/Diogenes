import express from 'express';
import { type Request, type Response } from 'express';
import { fetchMappings } from '../providers/malsync/fetchMappings';

const router = express.Router();

/**
 * Allowed Providers and Content Types.
 */
type Provider = 'anilist' | 'mal';
type ContentType = 'anime' | 'manga';

/**
 * Interface for Usage Response.
 */
interface UsageResponse {
    error: string | null;
    status: number;
    format: {
        id: { type: string; description: string };
        provider: { type: string; description: string };
        type: { type: string; description: string };
    };
    example: { url: string };
}

/**
 * Generates a usage response with optional error message.
 * @param error - Optional error message
 * @param status - HTTP status code
 * @returns UsageResponse object
 */
const generateUsageResponse = (error: string | null = null, status: number = 200): UsageResponse => ({
    error,
    status,
    format: {
        id: {
            type: "string",
            description: "The unique numeric ID of the content (anime or manga).",
        },
        provider: {
            type: "string",
            description: "The provider name. Supported values: 'anilist', 'mal'.",
        },
        type: {
            type: "string",
            description: "The type of content. Supported values: 'anime', 'manga'.",
        },
    },
    example: { url: "/mappings?id=5687&provider=anilist&type=anime" },
});

/**
 * Validates if the provided value is a valid Provider.
 * @param provider - The provider to validate.
 * @returns True if valid, false otherwise.
 */
const isValidProvider = (provider: any): provider is Provider => {
    return provider === 'anilist' || provider === 'mal';
};

/**
 * Validates if the provided value is a valid Content Type.
 * @param type - The content type to validate.
 * @returns True if valid, false otherwise.
 */
const isValidContentType = (type: any): type is ContentType => {
    return type === 'anime' || type === 'manga';
};

/**
 * @interface MappingRequest
 * Defines the structure of the request query parameters.
 */
interface MappingRequest {
    id: string;
    provider: Provider;
    type: ContentType;
}

/**
 * @route GET /mappings
 * @description Fetches mappings for a specified content from a given provider.
 * @queryParam {string} id - The unique numeric ID of the content (anime or manga).
 * @queryParam {string} provider - The name of the provider. Supported values: 'anilist', 'mal'.
 * @queryParam {string} type - The type of content. Supported values: 'anime', 'manga'.
 * @returns {Object} JSON response containing mappings information or usage instructions.
 * 
 * @example
 * // Fetch mappings for content with ID '5687' from 'anilist' provider for 'anime' type
 * GET /mappings?id=5687&provider=anilist&type=anime
 * 
 * @response {UsageResponse} 200 - Returns usage instructions if no query parameters are provided.
 * @response {Object} 200 - Returns mappings information if valid parameters are provided.
 * @response {UsageResponse} 400 - Returns error details and usage instructions if parameters are missing or invalid.
 * @response {UsageResponse} 404 - Returns error details if mappings are not found.
 * @response {UsageResponse} 500 - Internal server error message if an error occurs while fetching data.
 */
router.get('/', async (req: Request, res: Response) => {
    const { id, provider, type } = req.query;

    // Return usage instructions if no query parameters are provided
    if (!id && !provider && !type) {
        return res.json(generateUsageResponse());
    }

    // Validate presence and types of required query parameters
    if (
        !id || typeof id !== 'string' ||
        !provider || typeof provider !== 'string' ||
        !type || typeof type !== 'string'
    ) {
        return res.status(400).json(generateUsageResponse("Missing or invalid query parameters.", 400));
    }

    // Validate Provider
    if (!isValidProvider(provider)) {
        return res.status(400).json(generateUsageResponse("Invalid provider. Allowed values: 'anilist', 'mal'.", 400));
    }

    // Validate Content Type
    if (!isValidContentType(type)) {
        return res.status(400).json(generateUsageResponse("Invalid type. Allowed values: 'anime', 'manga'.", 400));
    }

    // Cast to appropriate types
    const mappingRequest: MappingRequest = {
        id,
        provider,
        type,
    };

    try {
        // Fetch mappings based on the request parameters
        const data = await fetchMappings(mappingRequest.id, mappingRequest.provider, mappingRequest.type);
        if (!data) {
            return res.status(404).json(generateUsageResponse("Mappings not found for the given ID, provider, and type.", 404));
        }
        res.json(data);
    } catch (error) {
        console.error('Error in /mappings route:', error);
        res.status(500).json(generateUsageResponse('An error occurred while fetching the mappings.', 500));
    }
});

export default router;
