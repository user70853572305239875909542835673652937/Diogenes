# ![jerry](https://cdn.discordapp.com/emojis/1253722954504863844.webp?size=22&quality=lossless) Gogo Scraper Dude

<img src="https://i.pinimg.com/564x/32/8b/3c/328b3cc06b7863db5c790883e5df49fa.jpg" align="right" width="80" />

**Simple Express.js API** designed to fetch anime episode information from Gogoanime, including **embeds**, **m3u8 links** (_360p, 480p, 720p & 1080p_), and **direct mp4 download URLs**. It leverages **Puppeteer** for web scraping and **Axios** for HTTP requests.

## Features

- Retrieves episode details such as **embeds**, **m3u8 links**, resolutions, and **mp4 download URLs**.
- Supports **dubbed episodes** by appending `-dub` to the anime ID.
- Implements **caching** to enhance performance.
- **Modularized codebase** for easy maintenance.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [Fetch Mappings](#fetch-mappings)
  - [Fetch Episode Information](#fetch-episode-information)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Prerequisites

- **Node.js** (_v12.x or later_)
- **Bun** (_dependency management tool_)
- **Google Chrome or Chromium browser**

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

### Fetch Mappings

- **Endpoint:** `/mappings`
- **Method:** `GET`
- **Query Parameters:**
  - `id` (number): The ID of the anime.

#### Example Request

```bash
curl "http://localhost:5173/mappings?id=21"
```

#### Example Response

```json
{
  "id": 21,
  "type": "anime",
  "title": "ONE PIECE",
  "url": "https://anilist.co/anime/21",
  "total": null,
  "image": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-YCDoj1EkAxFn.jpg",
  "malId": 21,
  "Sites": {
    "9anime": {
      "ov8": {
        "identifier": "ov8",
        "image": "https://static.aniwave.to/i/1/1b/1bb2150e9529b52995336d38e74e94b6.jpg",
        "malId": 21,
        "aniId": 21,
        "page": "9anime",
        "title": "ONE PIECE",
        "type": "anime",
        "url": "https://aniwave.to/watch/one-piece.ov8"
      }
    },
    "Gogoanime": {
      "one-piece": {
        "identifier": "one-piece",
        "image": "https://gogocdn.net/cover/one-piece-1708412053.png",
        "malId": 21,
        "aniId": 21,
        "page": "Gogoanime",
        "title": "One Piece",
        "type": "anime",
        "url": "https://anitaku.pe/category/one-piece"
      },
      "one-piece-dub": {
        "identifier": "one-piece-dub",
        "image": "https://gogocdn.net/cover/one-piece-dub.png",
        "malId": 21,
        "aniId": 21,
        "page": "Gogoanime",
        "title": "One Piece (Dub)",
        "type": "anime",
        "url": "https://anitaku.pe/category/one-piece-dub"
      }
    },
    "Zoro": {
      "100": {
        "identifier": "100",
        "image": "https://cdn.noitatnemucod.net/thumbnail/300x400/100/bcd84731a3eda4f4a306250769675065.jpg",
        "malId": 21,
        "aniId": 21,
        "page": "Zoro",
        "title": "One Piece",
        "type": "anime",
        "url": "https://hianime.to/one-piece-100"
      }
    },
    "Crunchyroll": {
      "0": {
        "title": "ONE PIECE",
        "image": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-YCDoj1EkAxFn.jpg",
        "identifier": 0,
        "url": "http://www.crunchyroll.com/one-piece",
        "type": "anime",
        "page": "Crunchyroll",
        "external": true
      }
    },
    "Hulu": {
      "1": {
        "title": "ONE PIECE",
        "image": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-YCDoj1EkAxFn.jpg",
        "identifier": 1,
        "url": "http://www.hulu.com/one-piece",
        "type": "anime",
        "page": "Hulu",
        "external": true
      }
    },
    "Netflix": {
      "2": {
        "title": "ONE PIECE",
        "image": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-YCDoj1EkAxFn.jpg",
        "identifier": 2,
        "url": "https://www.netflix.com/title/80107103",
        "type": "anime",
        "page": "Netflix",
        "external": true
      }
    }
  }
}
```

### Fetch Episode Information

- **Endpoint:** `/episodes`
- **Method:** `GET`
- **Query Parameters:**
  - `id` (string): The ID of the anime.
  - `ep` (number): The episode number.

#### Example Request

```bash
curl "http://localhost:5173/episodes?id=one-piece&ep=1109"
```

#### Example Response

```json
{
  "id": "one-piece",
  "ep": "1109",
  "episode": {
    "id": "one-piece-episode-1109",
    "number": 1109,
    "embed": "https://s3taku.com/streaming.php?id=MjI3MjUx&title=One+Piece+Episode+1109",
    "m3u8": "https://www111.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.1109.1719110413.m3u8",
    "resolutions": [
      {
        "url": "https://www111.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.1109.1719110413.360.m3u8",
        "label": "360p"
      },
      {
        "url": "https://www111.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.1109.1719110413.480.m3u8",
        "label": "480p"
      },
      {
        "url": "https://www111.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.1109.1719110413.720.m3u8",
        "label": "720p"
      },
      {
        "url": "https://www111.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.1109.1719110413.1080.m3u8",
        "label": "1080p"
      }
    ],
    "downloadUrl": "https://s3taku.com/download?id=MjI3MjUx"
  }
}
```

## Project Structure

```
gogo-scraper/
│
├── src/
│   ├── routes/
│   │   ├── episodes.ts
│   │   └── mappings.ts
│   ├── services/
│   │   ├── fetchData.ts
│   │   ├── fetchEpisode.ts
│   │   ├── fetchM3U8.ts
│   │   ├── fetchMappings.ts
│   │   └── processEpisode.ts
│   ├── utils/
│   │   └── cache.ts
│   └── app.ts
│
├── bun.lockb
├── custom.d.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

- **`routes/episodes.ts`**: Defines the route for fetching episode information.
- **`routes/mappings.ts`**: Defines the route for fetching mappings information.
- **`services/fetchEpisode.ts`**: Implements logic to retrieve episode details from the website.
- **`services/fetchM3U8.ts`**: Handles fetching m3u8 links and resolutions.
- **`services/fetchResolutions.ts`**: Manages the retrieval of different video resolutions.
- **`utils/cache.ts`**: Provides caching mechanism for storing episode data.
- **`app.ts`**: Initializes the Express.js server and includes route handlers.

## Contributing

<img src="https://i.pinimg.com/564x/cc/0c/f7/cc0cf7a1284be5352c4b29013370d4af.jpg" align="left" width="140" />

> [!IMPORTANT]  
> help.
>
> Your help is **always** appreciated.
