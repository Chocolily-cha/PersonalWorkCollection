import type { Category } from './types';

/**
 * 作品级配置覆盖文件
 *
 * 用法：把你想自定义的作品"标题"或"文件夹名"作为 key（注意不含扩展名），
 * 填入 tools（使用工具）和 description（作品描述），即可覆盖分类默认值。
 *
 * key 的取值（与 API 返回的 `overrideKey` 字段完全一致）：
 *   - 单文件作品：使用文件主名（去扩展名），例如 "广告——财神送水"
 *   - 合集作品（文件夹）：使用文件夹名，例如 "杭州项目"
 *
 * 把示例项前的 // 取消注释即可生效。
 */

export interface WorkOverride {
  /** 使用工具列表（数组形式，每项一个工具名） */
  tools?: string[];
  /** 作品描述 */
  description?: string;
  /** 创建时间，留空则不显示年份 */
  createdAt?: string;
}

export type PortfolioOverrides = Record<string, WorkOverride>;

export const portfolioOverrides: PortfolioOverrides = {
  // ===== 示例 1：单文件作品（AI 动画）=====
  // '广告——财神送水': {
  //   tools: ['Midjourney', 'Runway', 'After Effects'],
  //   description: '财神送水主题 AI 广告短片，将传统民俗元素与 AI 生成画面结合，营造节日喜庆氛围。',
  //   createdAt: '',
  // },

  // ===== 示例 2：合集作品（模型分类下的文件夹）=====
  // '杭州项目': {
  //   tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
  //   description: '杭州某项目建筑效果图合集，包含展厅、走廊、办公区等空间的三维表现。',
  //   createdAt: '',
  // },
};
