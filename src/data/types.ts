export type Category = 'AI动画' | '3D动画' | '模型' | '平面' | '绘画' | '摄影' | '其它';

/** 分类在"全部作品"页交错排序时的固定顺序 */
export const CATEGORY_ORDER: Category[] = [
  'AI动画',
  '3D动画',
  '模型',
  '平面',
  '绘画',
  '摄影',
  '其它',
];

export interface MediaFile {
  id: string;
  filename: string;
  extension: string;
  filePath: string;
  isVideo: boolean;
  isImage: boolean;
  thumbnail?: string;
  webpThumbnail?: string;
  detailUrl?: string;
}

export interface Work {
  id: string;
  title: string;
  category: Category;
  createdAt: string | undefined;
  tools: string[];
  description: string;
  mediaFiles: MediaFile[];
}

export interface CategoryInfo {
  name: Category;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { name: 'AI动画', label: 'AI动画', icon: '🎬' },
  { name: '3D动画', label: '3D动画', icon: '💎' },
  { name: '模型', label: '模型', icon: '🧱' },
  { name: '平面', label: '平面', icon: '🎨' },
  { name: '绘画', label: '绘画', icon: '🖌️' },
  { name: '摄影', label: '摄影', icon: '📷' },
  { name: '其它', label: '其它', icon: '📁' },
];

export const VIDEO_EXTENSIONS = ['mp4', 'gif'];
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'tiff'];
