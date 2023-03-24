export type KitsuAnime = {
 episodeCount: number;
 slug: string;
 canonicalTitle: string;
 synopsis: string;
 averageRating: string;
 startDate: string;
 endDate: string;
 status: string;
 episodeLength: number;
 totalLength: number;
 ageRating: string;
 subtype: string;
 posterImage: { medium: string };
 titles: { [key: string]: string };
 categories: { data: { title: string }[] };
};

export type KitsuManga = {
 episodeCount: number;
 slug: string;
 canonicalTitle: string;
 synopsis: string;
 averageRating: string;
 startDate: string;
 endDate: string;
 status: string;
 ageRating: string;
 subtype: string;
 categories: { data: { title: string }[] };
 titles: { [key: string]: string };
 posterImage: { medium: string };
};
