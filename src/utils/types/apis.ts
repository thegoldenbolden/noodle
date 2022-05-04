namespace Jikan {
  export type Pagination = {
    readonly last_visible_page: number;
    readonly has_next_page: boolean;
    readonly count: number;
  };

  export type Preview = {
    readonly url?: string;
    readonly small_image_url?: string;
    readonly large_image_url?: string;
    readonly trailer?: string;
    readonly title?: string;
    readonly synopsis?: string;
  };

  export interface Full extends Preview, Pagination {}
}

interface BaseAPI {
  readonly url?: string;
  readonly small_image_url?: string;
  readonly large_image_url?: string;
  readonly descrption?: string;
}
