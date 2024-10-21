# ![jerry](https://cdn.discordapp.com/emojis/1253722954504863844.webp?size=28&quality=lossless) Diogenes Scraper Dude

<img src="https://i.pinimg.com/564x/32/8b/3c/328b3cc06b7863db5c790883e5df49fa.jpg" align="right" width="80" />

**Diogenes Scraper Dude** is your go-to, overachieving **Express.js API** for scraping stuff from Gogoanime, AniList, Zoro, and AnimePahe. It hands over **embeds**, **m3u8 links**, and **direct mp4 download URLs**. With **Cheerio**, **JSDOM**, and the ever-reliable **Axios**.

## Features

- **Gets all the data**: Embeds, m3u8, mp4... n stuff.
- **Dubbed episodes too**: why not?
- **Caching**: Saves time.
- **Modular and neat**: So you don’t lose your mind.
- **Logging**: just logs.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [Fetch Mappings](#fetch-mappings)
  - [Fetch Info](#fetch-info)
  - [Fetch Episode Sources](#fetch-episode-sources)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Prerequisites

- **Node.js** (_v12.x or later_)
- **Bun** (_dependency management tool_)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/akionii/Diogenes.git
   cd Diogenes
   ```

2. **Install dependencies using Bun:**

   ```bash
   bun install
   ```

## Usage

1. **Start the server:**

   ```bash
   bun start
   ```

2. **Access the API:**

   The server will run on port `8080` by default. You can interact with the API at `http://localhost:8080/`.

## API Endpoints

### Fetch Mappings

- **Endpoint:** `/mappings`
- **Method:** `GET`
- **Description:** Retrieves mapping information for a specific anime based on its AniList ID.

- **Query Parameters:**
  - `id` (number, required): The ID of the anime on AniList.

#### Example Request

```bash
curl "http://localhost:8080/mappings?id=21"
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

### Fetch Info

- **Endpoint:** `/info`
- **Method:** `GET`
- **Description:** Retrieves detailed information about a specific anime from AniList or other providers.

- **Query Parameters:**
  - `id` (string, required): The ID of the anime.
  - `provider` (string, required): The provider's ID (e.g., `anilist`, `gogoanime`, `zoro`, `animepahe`).

#### Example Request

```bash
curl "http://localhost:8080/info?id=21&provider=anilist"
```

#### Example Response

```json
{
  "id": 21,
  "title": {
    "userPreferred": "ONE PIECE",
    "romaji": "ONE PIECE",
    "english": "ONE PIECE",
    "native": "ONE PIECE"
  },
  "coverImage": {
    "extraLarge": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YCDoj1EkAxFn.jpg",
    "large": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-YCDoj1EkAxFn.jpg",
    "medium": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/small/bx21-YCDoj1EkAxFn.jpg",
    "color": "#e49335"
  },
  "bannerImage": "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg",
  "startDate": {
    "year": 1999,
    "month": 10,
    "day": 20
  },
  "endDate": {
    "year": null,
    "month": null,
    "day": null
  },
  "description": "Gold Roger was known as the Pirate King...",
  "season": "FALL",
  "seasonYear": 1999,
  "type": "ANIME",
  "format": "TV",
  "status": "RELEASING",
  "episodes": null,
  "duration": 24,
  "chapters": null,
  "volumes": null,
  "genres": ["Action", "Adventure", "Comedy", "Drama", "Fantasy"],
  "synonyms": [
    "ワンピース",
    "海贼王",
    "וואן פיס",
    "ون بيس",
    "วันพีซ",
    "Vua Hải Tặc",
    "All'arrembaggio!",
    "Tutti all'arrembaggio!",
    "Ντρέηκ, το Κυνήγι του Θησαυρού"
  ],
  "source": "MANGA",
  "isAdult": false,
  "meanScore": 88,
  "averageScore": 88,
  "popularity": 529240,
  "favourites": 77126,
  "hashtag": "#ONEPIECE",
  "countryOfOrigin": "JP",
  "isLicensed": true,
  "isFavourite": false,
  "nextAiringEpisode": {
    "airingAt": 1720312200,
    "timeUntilAiring": 591333,
    "episode": 1111
  },
  "streamingEpisodes": [
    {
      "title": "Episode 130 - Scent of Danger! the Seventh Member Is Nico Robin!",
      "thumbnail": "https://img1.ak.crunchyroll.com/i/spire4-tmb/d80b3fbce742e6deb4d2caf37d08ca6e1395451246_full.jpg"
    }
    // ...
  ]
}
```

### Fetch Episode Sources

- **Endpoint:** `/sources`
- **Method:** `GET`
- **Description:** Retrieves streaming sources and download URLs for a specific episode from a chosen provider.

- **Query Parameters:**
  - `id` (string, required): The ID of the anime.
  - `ep` (number, required): The episode number.
  - `provider` (string, required): The provider's ID (e.g., `gogoanime`, `zoro`, `animepahe`).

#### Example Request

```bash
curl "http://localhost:8080/sources?id=one-piece&ep=1&provider=gogoanime"
```

#### Example Response

```json
{
  "provider": "gogoanime",
  "episodeId": "one-piece-episode-19",
  "downloadUrl": "https://s3taku.com/download?id=MzU4Nw==",
  "sources": {
    "Vidstreaming": {
      "embed": "https://s3taku.com/streaming.php?id=MzU4Nw==&title=One+Piece+Episode+19",
      "m3u8": "https://www034.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.19.1709230009.m3u8"
    },
    "Gogo server": {
      "embed": "https://s3taku.com/embedplus?id=MzU4Nw==&token=VuVqmBxzsUHOqajjwbcCNA&expires=1719821343",
      "m3u8": "https://www034.vipanicdn.net/streamhls/0b594d900f47daabc194844092384914/ep.19.1709230009.m3u8"
    },
    "Streamwish": {
      "embed": "https://awish.pro/e/y0m0th7fkabn",
      "m3u8": "https://eb7jhj2czt.sw-cdnstreamwish.com/hls2/01/00985/y0m0th7fkabn_o/master.m3u8?t=urBSk-N3CwBnZPYKN9PD1nCmfo9Y3jWu7VmkHzmRsNc&s=1719814151&e=129600&f=4926294&srv=rlaj2blvduli&i=0.0&sp=500&p1=rlaj2blvduli&p2=rlaj2blvduli&asn=3352"
    },
    "Doodstream": {
      "embed": "https://dood.wf/e/aqk2elyf0i0u",
      "m3u8": null
    },
    "Vidhide": {
      "embed": "https://alions.pro/v/th97329evri0",
      "m3u8": "https://dd2stliwt0bc.aghe-cdn.com/hls2/01/00346/th97329evri0_o/master.m3u8?t=qj1J7Cm59jvd8fTzP6TfExuMKoD7RFR7mnIYglH5slU&s=1719814153&e=129600&f=1732061&srv=dRbzRpT7gMoa&i=0.4&sp=500&p1=dRbzRpT7gMoa&p2=dRbzRpT7gMoa&asn=3352"
    }
  }
}
```

## Project Structure

```plaintext
Diogenes/
│
├── bun.lockb
├── logs/
│   ├── combined.log
│   ├── error.log
│   └── exceptions.log
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
│
├── src/
│   ├── app.ts
│   ├── index.ts
│   │
│   ├── providers/
│   │   ├── anilist/
│   │   │   ├── fetchInfo.ts
│   │   │   └── queries.ts
│   │   ├── animepahe/
│   │   │   ├── fetchInfo.ts
│   │   │   └── fetchSources.ts
│   │   ├── gogoanime/
│   │   │   ├── fetchInfo.ts
│   │   │   ├── fetchSources.ts
│   │   │   ├── gogocdn.ts
│   │   │   └── streamwish.ts
│   │   ├── malsync/
│   │   │   └── fetchMappings.ts
│   │   └── zoro/
│   │       ├── fetchEpisodes.ts
│   │       ├── fetchInfo.ts
│   │       ├── fetchServers.ts
│   │       └── fetchSources.ts
│   │
│   ├── routes/
│   │   ├── episodes.ts
│   │   ├── info.ts
│   │   ├── mappings.ts
│   │   ├── servers.ts
│   │   └── sources.ts
│   │
│   ├── services/
│   │   ├── fetchProxy.ts
│   │   ├── proxies.json
│   │   └── verifyProxy.ts
│   │
│   └── utils/
│       ├── cacheSetup.ts
│       ├── cache.ts
│       └── logger.ts
```

### Directory Overview

- **`logs/`**: Stores log files for combined logs, error logs, and exception logs.
- **`src/`**: Contains all source code.

  - **`app.ts`**: Initializes the Express.js server and integrates middleware.
  - **`index.ts`**: Entry point of the application.
  - **`providers/`**: Houses modules for interacting with different anime data providers.

    - **`anilist/`**
      - `fetchInfo.ts`: Fetches anime information from AniList.
      - `queries.ts`: Contains GraphQL queries for AniList API.
    - **`animepahe/`**
      - `fetchInfo.ts`: Fetches anime information from AnimePahe.
      - `fetchSources.ts`: Retrieves episode sources from AnimePahe.
    - **`gogoanime/`**
      - `fetchInfo.ts`: Fetches anime information from Gogoanime.
      - `fetchSources.ts`: Retrieves episode sources from Gogoanime.
      - `gogocdn.ts`: Handles CDN-related functionalities for Gogoanime.
      - `streamwish.ts`: Integrates with Streamwish for streaming sources.
    - **`malsync/`**
      - `fetchMappings.ts`: Fetches and synchronizes mappings from Malsync.
    - **`zoro/`**
      - `fetchEpisodes.ts`: Retrieves episode details from Zoro.
      - `fetchInfo.ts`: Fetches anime information from Zoro.
      - `fetchServers.ts`: Retrieves server information from Zoro.
      - `fetchSources.ts`: Retrieves episode sources from Zoro.

  - **`routes/`**: Defines API endpoints.

    - `episodes.ts`: Route for fetching episodes.
    - `info.ts`: Route for fetching anime information.
    - `mappings.ts`: Route for fetching mappings.
    - `servers.ts`: Route for fetching server information.
    - `sources.ts`: Route for fetching episode sources.

  - **`services/`**: Contains service modules for various functionalities.

    - `fetchProxy.ts`: Manages proxy fetching for requests.
    - `proxies.json`: Stores proxy configurations.
    - `verifyProxy.ts`: Verifies the reliability of proxies.

  - **`utils/`**: Utility modules for supporting functionalities.

    - `cacheSetup.ts`: Configures caching mechanisms.
    - `cache.ts`: Provides caching utilities for storing and retrieving data.
    - `logger.ts`: Implements logging functionalities.

## Contributing

<img src="https://i.pinimg.com/564x/cc/0c/f7/cc0cf7a1284be5352c4b29013370d4af.jpg" align="left" width="140" />

> [!IMPORTANT]  
> help.
>
> Your help is **always** appreciated.
