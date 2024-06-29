Sure, here's the updated `README.md` for using Bun instead of npm or yarn:

# Gogo Scraper

<div style="text-align: center; height: 250px;">
  <img src="https://i.pinimg.com/564x/32/8b/3c/328b3cc06b7863db5c790883e5df49fa.jpg" alt="Gogo Scraper" style="max-width: 50%;">
</div>

Simple Express.js API designed to fetch anime episode information from Gogoanime, including embeds, m3u8 links (360p, 480p, 720p & 1080p), and direct mp4 download URLs. It leverages Puppeteer for web scraping and Axios for HTTP requests.

## Features

- Retrieves episode details such as embeds, m3u8 links, resolutions, and mp4 download URLs.
- Supports dubbed episodes by appending `-dub` to the anime ID.
- Implements caching to enhance performance.
- Modularized codebase for easy maintenance.

## Prerequisites

- Node.js (v12.x or later)
- Bun
- Google Chrome or Chromium browser

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/akionii/gogo-scraper.git
   cd gogo-scraper
   ```

2. Install dependencies using Bun:

   ```bash
   bun install
   ```

## Usage

1. Start the server:

   ```bash
   bun start
   ```

2. The server will run on port `5173` by default. You can access the API at `http://localhost:5173/episodes`.

## API Endpoints

### Fetch Episode Information

- **Endpoint:** `/episodes`
- **Method:** `GET`
- **Query Parameters:**
  - `gogoId` (string): The ID of the anime.
  - `ep` (number): The episode number.
  - `dub` (boolean, optional): If `true`, fetches the dubbed version of the episode.

#### Example Request

```bash
curl "http://localhost:5173/episodes?gogoId=one-piece&ep=1&dub=true"
```

#### Example Response

```json
{
  "gogoId": "one-piece-dub",
  "episode": {
    "episodeId": "one-piece-dub-episode-1",
    "epNum": 1,
    "embed": "https://s3taku.com/streaming.php?id=MzUxOA==&title=One+Piece+Episode+1",
    "m3u8": "https://www088.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.1.1703914189.m3u8",
    "resolutions": [
      "https://www088.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.1.1703914189.360.m3u8",
      "https://www088.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.1.1703914189.480.m3u8",
      "https://www088.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.1.1703914189.720.m3u8",
      "https://www088.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.1.1703914189.1080.m3u8"
    ],
    "downloadUrl": "https://s3taku.com/download?id=MzUxOA=="
  }
}
```

## Project Structure

```plaintext
gogo-scraper/
│
├── src/
│   ├── routes/
│   │   └── episodes.ts
│   ├── services/
│   │   ├── fetchEpisode.ts
│   │   ├── fetchM3U8.ts
│   │   └── fetchResolutions.ts
│   ├── utils/
│   │   └── cache.ts
│   └── app.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

- **`routes/episodes.ts`**: Defines the route for fetching episode information.
- **`services/fetchEpisode.ts`**: Implements logic to retrieve episode details from the website.
- **`services/fetchM3U8.ts`**: Handles fetching m3u8 links and resolutions.
- **`services/fetchResolutions.ts`**: Manages the retrieval of different video resolutions.
- **`utils/cache.ts`**: Provides caching mechanism for storing episode data.
- **`app.ts`**: Initializes the Express.js server and includes route handlers.

## Contributing

<div style="text-align: center; height: 250px;">
  <img src="https://i.pinimg.com/564x/cc/0c/f7/cc0cf7a1284be5352c4b29013370d4af.jpg" alt="Contributing" style="max-width: 50%;">
</div>

Your help is always appreciated. Seriously. Just help.

## License

MIT, I guess.

<div style="text-align: center; height: 250px;">
  <img src="https://i.pinimg.com/564x/6f/13/57/6f1357bcd1ae767c059841e273f70b38.jpg" alt="License Card" style="max-width: 50%;">
</div>
