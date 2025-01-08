type AnimeImage = {
  webp?: {
    small_image_url?: string
  }
  jpg?: {
    small_image_url?: string
  }
}

type Genre = {
  mal_id: number
  name: string
  url: string
}

type Studio = {
  mal_id: number
  name: string
  url: string
}

type Aired = {
  from: string
  to: string | null
}

export type AnimeList = {
  mal_id: number
  url: string
  title: string
  title_japanese: string
  images: AnimeImage
  genres: Genre[]
  rating: string
  duration: string
  type: string
  source: string
  aired: Aired
  episodes: number | null
  studios: Studio[]
  members: number
  status: string
  season: string
}
