export const BASE_PATH = '/PersonalWorkCollection';

export function getMediaUrl(path: string): string {
  return `${BASE_PATH}/${encodeURI(path)}`;
}