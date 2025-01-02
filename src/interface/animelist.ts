interface AnimeImage {
  webp?: {
    small_image_url?: string
  }
  jpg?: {
    small_image_url?: string
  }
}

interface Genre {
  mal_id: number
  name: string
  url: string
}

interface Studio {
  mal_id: number
  name: string
  url: string
}

interface Aired {
  from: string
  to: string | null
}

export interface AnimeList {
  mal_id: number
  url: string
  title: string
  title_japanese: string
  images: AnimeImage
  genres: Genre[]
  rating: string
  type: string
  source: string
  aired: Aired
  episodes: number | null
  studios: Studio[]
  members: number
  status: string
  season: string
}
