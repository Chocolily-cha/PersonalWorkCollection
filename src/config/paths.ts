export const BASE_PATH = '/PersonalWorkCollection';

export function getMediaUrl(path: string): string {
  const url = `${BASE_PATH}/${path}`;
  try {
    const encoded = encodeURI(url);
    return encoded;
  } catch {
    return url;
  }
}