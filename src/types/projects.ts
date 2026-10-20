export type ProjectMedia = {
  kind: 'file' | 'embed';
  src: string;
  poster?: string;
  aspectRatio?: string;
  watchUrl?: string;
  captions?: string;
};

export type Project = {
  id?: string;
  title: string;
  premise: string;
  description: string;
  technologies?: string[];
  links?: { label: string; href: string }[];
  media?: ProjectMedia;
};
