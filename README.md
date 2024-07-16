# ![jerry](https://cdn.discordapp.com/emojis/1253722954504863844.webp?size=28&quality=lossless) Diogenes Scraper Dude

<img src="https://i.pinimg.com/564x/32/8b/3c/328b3cc06b7863db5c790883e5df49fa.jpg" align="right" width="80" />

**Simple Express.js API** designed to fetch anime episode information from Gogoanime, including **embeds**, **m3u8 links** (_360p, 480p, 720p & 1080p_), and **direct mp4 download URLs**. It leverages **Puppeteer** for web scraping and **Axios** for HTTP requests.

## Features

- Retrieves episode details such as **embeds**, **m3u8 links**, and **mp4 download URLs**.
- Supports **dubbed episodes**.
- Implements **caching** to enhance performance.
- **Modularized codebase** for easy maintenance.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [Fetch Mappings](#fetch-mappings)
  - [Fetch Info](#fetch-anime-info)
  - [Fetch Episode Sources](#fetch-episode-sources)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Prerequisites

- **Node.js** (_v12.x or later_)
- **Bun** (_dependency management tool_)
- **Google Chrome or Chromium browser**

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/akionii/Diogenes.git
   cd Diogenes
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

2. The server will run on port `8080` by default. You can access the API at `http://localhost:8080/`.

## API Endpoints

### Fetch Mappings

- **Endpoint:** `/mappings`
- **Method:** `GET`
- **Query Parameters:**
  - `id` (number): The ID of the anime on AniList.

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

### Fetch Anime Info

- **Endpoint:** `/info`
- **Method:** `GET`
- **Query Parameters:**
  - `id` (string): The ID of the anime.
    - `provider` (string): The provider's ID, e.g., 'anilist', 'gogoanime', '9anime', 'zoro'.

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
  "genres": [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy"
  ],
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
    },
    ...
  ]
}
```

### Fetch Episode Sources

- **Endpoint:** `/sources`
- **Method:** `GET`
- **Query Parameters:**
  - `id` (string): The ID of the anime.
  - `ep` (number): The episode number.
  - `provider` (string): The provider's ID, e.g., 'gogoanime', '9anime', 'zoro'.

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
├── src/
│   ├── routes/
│   │   ├── sources.ts
│   │   ├── info.ts
│   │   └── mappings.ts
│   ├── providers/
│   │   ├── gogoanime/
│   │   │   ├── fetchInfo.ts
│   │   │   ├── fetchM3U8.ts
│   │   │   └── fetchSources.ts
│   │   ├── anilist/
│   │   │   ├── fetchInfo.ts
│   │   │   └── queries.ts
│   │   ├── malsync/
│   │       └── fetchMappings.ts
│   ├── services/
│   │   └── fetchData.ts
│   ├── utils/
│   │   ├── cacheSetup.ts
│   │   └── cache.ts
│   ├── app.ts
│   └── index.ts
│
├── bun.lockb
├── custom.d.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

- **`routes/sources.ts`**: Defines the route for fetching episode sources.
- **`routes/mappings.ts`**: Defines the route for fetching mappings information.
- **`routes/info.ts`**: Defines the route for fetching anime information from AniList and Gogoanime.
- **`providers/gogoanime/`**: Contains modules related to fetching data from Gogoanime.
- **`providers/anilist/`**: Contains modules related to fetching data from AniList.
- **`providers/malsync/`**: Contains modules related to fetching data from Malsync.
- **`services/fetchData.ts`**: Implements common data fetching logic.
- **`utils/cache.ts`**: Provides caching mechanism for storing data.
- **`app.ts`**: Initializes the Express.js server and includes route handlers.

## Contributing

<img src="https://i.pinimg.com/564x/cc/0c/f7/cc0cf7a1284be5352c4b29013370d4af.jpg" align="left" width="140" />

> [!IMPORTANT]  
> help.
>
> Your help is **always** appreciated.
