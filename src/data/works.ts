import { Work, Category, MediaFile } from './types';

const PORTFOLIO_DIR = '巧克力的作品集';

function createMediaFile(filename: string, category: string): MediaFile {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const filePath = `${PORTFOLIO_DIR}/${category}/${filename}`;
  
  return {
    id: `${category}-${filename}`,
    filename,
    extension,
    filePath,
    isVideo: ['mp4', 'gif'].includes(extension),
    isImage: ['jpg', 'jpeg', 'png', 'gif', 'tiff'].includes(extension),
  };
}

let idCounter = 0;
function generateId(): string {
  idCounter += 1;
  return `work-${idCounter}-${Date.now().toString(36)}`;
}

export const works: Work[] = [
  ...[
    'EXPN新春宣传片.mp4',
    '古诗——赠汪伦.mp4',
    '吉祥物动画演示.mp4',
    '广告——财神送水.mp4',
    '心灵鸡汤——早安.mp4',
    '空镜——富士山.mp4',
    '龟兔赛跑——沙滩篇.mp4',
  ].map(filename => ({
    id: generateId(),
    title: filename.replace('.mp4', ''),
    category: 'AI动画' as Category,
    createdAt: '2024',
    tools: ['AI生成', 'After Effects', '剪映'],
    description: '利用AI技术生成的创意动画作品，展现了人工智能在视觉艺术领域的无限可能。',
    mediaFiles: [createMediaFile(filename, 'AI动画')],
  })),

  ...[
    '产品动画-耳机.mp4',
    '产品动画——摩托车展示平台.mp4',
    '产品动画——管道.mp4',
    '产品渲染-小米充电宝.mp4',
    '场景——凤凰古城-漫游.mp4',
    '摄像机拆解动画.mp4',
    '演示动画-汽车停车控制.mp4',
    '演示动画——DNA动画.mp4',
    '演示动画——魔球动画.mp4',
    '白班闯关赛.mp4',
    '角色动画——修女表情.gif',
    '角色动画——展示动作.mp4',
    '角色动画——战斗准备.mp4',
    '角色动画——游戏动作.gif',
    '角色动画——男孩跳hiphop.mp4',
    '角色动画——走路.mp4',
    '角色动画——飞龙.gif',
  ].map(filename => ({
    id: generateId(),
    title: filename.replace(/\.(mp4|gif)$/, ''),
    category: '3D动画' as Category,
    createdAt: '2024',
    tools: ['3DsMAX', 'AE'],
    description: '精心制作的3D动画作品，展示了三维建模与动画设计的专业技巧。',
    mediaFiles: [createMediaFile(filename, '3D动画')],
  })),

  {
    id: generateId(),
    title: '杭州项目效果图合集',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: '杭州项目的建筑效果图合集，展示了智能网联汽车实训室的整体设计方案。',
    mediaFiles: [
      createMediaFile('20200422-杭州项目_ADAS技术综合实训室-添加展柜_1920.png', '模型'),
      createMediaFile('20200422杭州项目_成图-室外综合实训测试场-1920.jpg', '模型'),
      createMediaFile('20200422杭州项目_成图-房间2.jpg', '模型'),
      createMediaFile('20200422杭州项目效果图1.png', '模型'),
      createMediaFile('20200422杭州项目效果图2.png', '模型'),
      createMediaFile('20200422杭州项目效果图3.png', '模型'),
    ],
  },
  {
    id: generateId(),
    title: '长春职业技术学院效果图',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: '长春职业技术学院智能网联汽车实训室的整体设计效果图。',
    mediaFiles: [
      createMediaFile('20200706-长春职业技术学院实验室效果图-1车联网系统集成实训室_水印.png', '模型'),
      createMediaFile('20200706-长春职业技术学院实验室效果图-2智能网联汽车测试装调实训室_水印.png', '模型'),
      createMediaFile('20200706-长春职业技术学院实验室效果图-全(水印).png', '模型'),
    ],
  },
  {
    id: generateId(),
    title: '大江东项目效果图',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: '大江东智能网联汽车产业园项目的整体规划与设计效果图。',
    mediaFiles: [
      createMediaFile('20200715-大江东效果图_ADAS高级辅助驾驶检测综合实训室_1920.png', '模型'),
      createMediaFile('20200715-大江东效果图_大江东项目-整.jpg', '模型'),
      createMediaFile('20200715-大江东效果图_车路协同实训区-出图_1920.png', '模型'),
      createMediaFile('20200715-大江东效果图_车辆远程大数据云控中心-出图_1920.png', '模型'),
    ],
  },
  {
    id: generateId(),
    title: '福建船政项目效果图',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: '福建船政交通职业学院智能网联实训室的设计方案展示。',
    mediaFiles: [
      createMediaFile('20201030-新福建船政-区域1-1+X考核_1920.jpg', '模型'),
      createMediaFile('20201030-新福建船政-区域2-台架区_1920.jpg', '模型'),
      createMediaFile('20201030-新福建船政-区域3-线控区_1920.jpg', '模型'),
      createMediaFile('20201030-新福建船政-区域4-沙盘区_1920.jpg', '模型'),
      createMediaFile('20201030-新福建船政-区域5-底盘区_1920.jpg', '模型'),
    ],
  },
  ...[
    '上海建筑.jpg',
    '凤凰古城.jpg',
    '冰川-调色.jpg',
    '冰川.png',
    '学校.jpg',
    '工具建模.png',
    '机械.png',
    '魔法棒.png',
    '模型渲染图.jpg',
    '汽车模型简化.jpg',
    '热气球.jpg',
    '管道动画.jpg',
    '角色动画.png',
    '动物角色动画.jpg',
    '机械练习.jpg',
    '3dmax鲤鱼浮雕.jpg',
    'unity摄像机拆解动画.mp4_20260327_010120188.jpg',
    '三维动画-汽车停车控制.mp4_20260327_005647808.jpg',
    'screenshot033.png',
    'rabbit_practice_night_per2.jpg',
  ].map(filename => ({
    id: generateId(),
    title: filename.replace(/\.(jpg|png)$/, ''),
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'Photoshop'],
    description: '三维建模与渲染作品。',
    mediaFiles: [createMediaFile(filename, '模型')],
  })),

  ...[
    '20200911公司海报第四版-1.jpg',
    '20200911公司海报第四版.jpg',
    '20200916公司智能网联汽车实训基地海报第三版.jpg',
    '产品使用说明封面设计.jpg',
    '工具图标.png',
    '教材封面设计.png',
    '无锡汽车工程高等职业技术学校-智能网联文化墙设计图.jpg',
    '浙江机电学校海报制作.jpg',
    '系统界面设计.jpg',
    '软件界面.png',
  ].map(filename => ({
    id: generateId(),
    title: filename.replace(/\.(jpg|png)$/, ''),
    category: '平面' as Category,
    createdAt: '',
    tools: ['Photoshop', 'Illustrator'],
    description: '专业的平面设计作品，涵盖海报设计、界面设计等多个领域。',
    mediaFiles: [createMediaFile(filename, '平面')],
  })),

  ...[
    '水彩——海岸一景.jpg',
    '水彩——湖畔孤舟.jpg',
    '水彩——莫奈日出印象临摹.JPG',
    '水彩——鱼跃水上.JPG',
    '素描——古坊水乡.jpg',
    '素描——枝叶.JPG',
    '素描——枯树干.JPG',
    '素描——树丛一角.jpg',
    '素描——玫瑰.JPG',
    '素描——百合.JPG',
    '素描——美人蕉.JPG',
    '素描——美术楼.JPG',
    '素描——雅轩古宅门.jpg',
  ].map(filename => ({
    id: generateId(),
    title: filename.replace(/\.(jpg|JPG)$/, ''),
    category: '绘画' as Category,
    createdAt: '',
    tools: ['水彩', '素描', '铅笔'],
    description: '传统绘画作品，展现了扎实的绘画功底和艺术表现力。',
    mediaFiles: [createMediaFile(filename, '绘画')],
  })),

  ...[
    'AE动画练习.mp4',
    '公司宣传视频-1m14s.mp4',
    '视频剪辑-《伴你左右》.mp4',
    '采星科技(厦门)公司logo动画-1.mp4',
    '采星科技(厦门)公司logo动画-2.mp4',
    '采星科技(厦门)公司宣传介绍.mp4',
  ].map(filename => ({
    id: generateId(),
    title: filename.replace('.mp4', ''),
    category: '其它' as Category,
    createdAt: '',
    tools: ['After Effects'],
    description: '其它类型的创意作品。',
    mediaFiles: [createMediaFile(filename, '其它')],
  })),
];

export function getWorksByCategory(category: Category | 'all'): Work[] {
  if (category === 'all') return works;
  return works.filter(work => work.category === category);
}

export function getWorkById(id: string): Work | undefined {
  return works.find(work => work.id === id);
}

export function getCategories(): Category[] {
  return ['AI动画', '3D动画', '模型', '平面', '绘画', '摄影', '其它'];
}

export function getCategoryWorkCount(category: Category): number {
  return works.filter(work => work.category === category).length;
}