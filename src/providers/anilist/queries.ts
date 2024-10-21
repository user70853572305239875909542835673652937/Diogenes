export const infoQuery = `
    query media($id: Int) {
        Media(id: $id) {
            id
            title {
                userPreferred
                romaji
                english
                native
            }
            coverImage {
                extraLarge
                large
                medium
                color
            }
            bannerImage
            startDate {
                year
                month
                day
            }
            endDate {
                year
                month
                day
            }
            description
            season
            seasonYear
            type
            format
            status(version: 2)
            episodes
            duration
            chapters
            volumes
            genres
            synonyms
            source(version: 3)
            isAdult
            meanScore
            averageScore
            popularity
            favourites
            hashtag
            countryOfOrigin
            isLicensed
            isFavourite
            nextAiringEpisode {
                airingAt
                timeUntilAiring
                episode
            }
            streamingEpisodes {
                title
                thumbnail
            }
            trailer {
                id
                site
            }
        }
    }
`;
