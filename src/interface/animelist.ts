interface AnimeImage {
  jpg?: {
    small_image_url?: string;
  };
}

interface Genre {
  mal_id: number;
  name: string;
}

interface Studio {
  mal_id: number;
  name: string;
}

interface Aired {
  from: string;
  to: string | null;
}

export interface AnimeData {
  mal_id: number;
  url: string;
  title: string;
  title_japanese: string;
  images: AnimeImage;
  genres: Genre[];
  type: string;
  source: string;
  aired: Aired;
  episodes: number | null;
  studios: Studio[];
  members: number;
  status: string;
}
