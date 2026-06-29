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

function generateId(category: string, title: string): string {
  const safeTitle = title.replace(/[^\w\u4e00-\u9fa5——\-]/g, '-');
  return `work-${category}-${safeTitle}`;
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
  ].map(filename => {
    const title = filename.replace('.mp4', '');
    const category = 'AI动画' as Category;
    return {
      id: generateId(category, title),
      title,
      category,
      createdAt: '2024',
      tools: ['AI生成', 'After Effects', '剪映'],
      description: '利用AI技术生成的创意动画作品，展现了人工智能在视觉艺术领域的无限可能。',
      mediaFiles: [createMediaFile(filename, 'AI动画')],
    };
  }),

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
    '角色动画——修女表情.mp4',
    '角色动画——展示动作.mp4',
    '角色动画——战斗准备.mp4',
    '角色动画——游戏动作.mp4',
    '角色动画——男孩跳hiphop.mp4',
    '角色动画——走路.mp4',
    '角色动画——飞龙.mp4',
  ].map(filename => {
    const title = filename.replace(/\.(mp4|gif)$/, '');
    const category = '3D动画' as Category;
    return {
      id: generateId(category, title),
      title,
      category,
      createdAt: '2024',
      tools: ['3DsMAX', 'AE'],
      description: '精心制作的3D动画作品，展示了三维建模与动画设计的专业技巧。',
      mediaFiles: [createMediaFile(filename, '3D动画')],
    };
  }),

  {
    id: generateId('模型', 'CCZYJSXY项目效果图'),
    title: 'CCZYJSXY项目效果图',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: 'CCZYJSXY项目效果图，展示智能网联汽车实训室的整体设计。',
    mediaFiles: [
      createMediaFile('CCZYJSXY项目效果图/台架教学区.png', '模型'),
      createMediaFile('CCZYJSXY项目效果图/实验室效果图-总览.png', '模型'),
      createMediaFile('CCZYJSXY项目效果图/智能汽车创客实训室.png', '模型'),
      createMediaFile('CCZYJSXY项目效果图/智能网联汽车测试装调实训室.png', '模型'),
      createMediaFile('CCZYJSXY项目效果图/智能网联综合培训室.png', '模型'),
      createMediaFile('CCZYJSXY项目效果图/车联网系统集成实训室.png', '模型'),
    ],
  },
  {
    id: generateId('模型', 'DJD项目效果图'),
    title: 'DJD项目效果图',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: 'DJD项目效果图，展示智能网联汽车产业园区规划。',
    mediaFiles: [
      createMediaFile('DJD项目效果图/ADAS高级辅助驾驶检测综合实训室.png', '模型'),
      createMediaFile('DJD项目效果图/总览.jpg', '模型'),
      createMediaFile('DJD项目效果图/无人驾驶仿真测试实训室.png', '模型'),
      createMediaFile('DJD项目效果图/车联网综合技术实训室.png', '模型'),
      createMediaFile('DJD项目效果图/车路协同实训区.png', '模型'),
      createMediaFile('DJD项目效果图/车辆远程大数据云控中心.png', '模型'),
    ],
  },
  {
    id: generateId('模型', 'HZ项目效果图'),
    title: 'HZ项目效果图',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: 'HZ项目效果图合集。',
    mediaFiles: [
      createMediaFile('HZ项目效果图/ADAS技术综合实训室.png', '模型'),
      createMediaFile('HZ项目效果图/学校.jpg', '模型'),
      createMediaFile('HZ项目效果图/室外综合实训测试场.jpg', '模型'),
      createMediaFile('HZ项目效果图/效果图1.png', '模型'),
      createMediaFile('HZ项目效果图/效果图2.png', '模型'),
      createMediaFile('HZ项目效果图/效果图3.png', '模型'),
      createMediaFile('HZ项目效果图/效果图5.png', '模型'),
      createMediaFile('HZ项目效果图/效果图6.png', '模型'),
      createMediaFile('HZ项目效果图/效果图7.png', '模型'),
      createMediaFile('HZ项目效果图/电脑室.jpg', '模型'),
    ],
  },
  {
    id: generateId('模型', 'XFJCZ项目效果图'),
    title: 'XFJCZ项目效果图',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: 'XFJCZ项目效果图，展示智能网联汽车各区域设计。',
    mediaFiles: [
      createMediaFile('XFJCZ项目效果图/区域1-1+X考核.jpg', '模型'),
      createMediaFile('XFJCZ项目效果图/区域2-台架区.jpg', '模型'),
      createMediaFile('XFJCZ项目效果图/区域3-线控区.jpg', '模型'),
      createMediaFile('XFJCZ项目效果图/区域4-沙盘区.jpg', '模型'),
      createMediaFile('XFJCZ项目效果图/区域5-底盘区.jpg', '模型'),
      createMediaFile('XFJCZ项目效果图/总图.png', '模型'),
    ],
  },
  {
    id: generateId('模型', 'XJCGQGZ项目效果图'),
    title: 'XJCGQGZ项目效果图',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: 'XJCGQGZ项目效果图，展示先进传感器感知系统。',
    mediaFiles: [
      createMediaFile('XJCGQGZ项目效果图/先进传感器感知-大数据中心.png', '模型'),
      createMediaFile('XJCGQGZ项目效果图/先进传感器感知-标定中心.png', '模型'),
      createMediaFile('XJCGQGZ项目效果图/先进传感器感知-鉴定中心.png', '模型'),
      createMediaFile('XJCGQGZ项目效果图/先进传感器感知.png', '模型'),
    ],
  },
  {
    id: generateId('模型', 'ADAS技术综合实训室'),
    title: 'ADAS技术综合实训室',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: 'ADAS技术综合实训室效果图。',
    mediaFiles: [
      createMediaFile('ADAS技术综合实训室/ADAS技术综合实训室(1).png', '模型'),
      createMediaFile('ADAS技术综合实训室/ADAS技术综合实训室(2).png', '模型'),
      createMediaFile('ADAS技术综合实训室/ADAS技术综合实训室.png', '模型'),
      createMediaFile('ADAS技术综合实训室/ADAS高级辅助驾驶检测综合实训室.png', '模型'),
    ],
  },
  {
    id: generateId('模型', '智能车嵌入式应用创新实训室'),
    title: '智能车嵌入式应用创新实训室',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: '智能车嵌入式应用创新实训室效果图。',
    mediaFiles: [
      createMediaFile('智能车嵌入式应用创新实训室/智能车嵌入式应用创新实训室 (2).png', '模型'),
      createMediaFile('智能车嵌入式应用创新实训室/智能车嵌入式应用创新实训室(1).png', '模型'),
      createMediaFile('智能车嵌入式应用创新实训室/智能车嵌入式应用创新实训室.png', '模型'),
      createMediaFile('智能车嵌入式应用创新实训室/智能车嵌入式编程实训室.png', '模型'),
    ],
  },
  {
    id: generateId('模型', '道路管理系统'),
    title: '道路管理系统',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: '道路管理系统效果图。',
    mediaFiles: [
      createMediaFile('道路管理系统/道路管理系统-交叉路口管理系统.png', '模型'),
      createMediaFile('道路管理系统/道路管理系统.png', '模型'),
    ],
  },
  {
    id: generateId('模型', '雷达实验室'),
    title: '雷达实验室',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: '雷达实验室效果图。',
    mediaFiles: [
      createMediaFile('雷达实验室/雷达实验室-1.png', '模型'),
      createMediaFile('雷达实验室/雷达实验室-2.png', '模型'),
      createMediaFile('雷达实验室/雷达实验室-3.jpg', '模型'),
    ],
  },
  {
    id: generateId('模型', '智能汽车综合实训室'),
    title: '智能汽车综合实训室',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: '智能汽车综合实训室效果图。',
    mediaFiles: [
      createMediaFile('智能汽车综合实训室/1.png', '模型'),
      createMediaFile('智能汽车综合实训室/2.png', '模型'),
      createMediaFile('智能汽车综合实训室/3.png', '模型'),
    ],
  },
  {
    id: generateId('模型', '智能网联汽车平台'),
    title: '智能网联汽车平台',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: '智能网联汽车平台效果图。',
    mediaFiles: [
      createMediaFile('智能网联汽车平台/智能网联汽车传感器装调平台.png', '模型'),
      createMediaFile('智能网联汽车平台/智能网联汽车计算单元平台.png', '模型'),
      createMediaFile('智能网联汽车平台/视频识别.png', '模型'),
    ],
  },
  {
    id: generateId('模型', '智能识别'),
    title: '智能识别',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: '智能识别系统效果图。',
    mediaFiles: [
      createMediaFile('智能识别/智能识别.jpg', '模型'),
      createMediaFile('智能识别/红绿灯.jpg', '模型'),
    ],
  },
  {
    id: generateId('模型', 'MHXCZYZZ项目效果图'),
    title: 'MHXCZYZZ项目效果图',
    category: '模型' as Category,
    createdAt: '',
    tools: ['3ds Max', 'V-Ray', 'AutoCAD', 'Photoshop'],
    description: 'MHXCZYZZ项目效果图，展示智能网联实训室设计。',
    mediaFiles: [
      createMediaFile('MHXCZYZZ项目效果图/智能网联实训室-1.png', '模型'),
      createMediaFile('MHXCZYZZ项目效果图/智能网联实训室-2.png', '模型'),
    ],
  },
  ...[
    '上海建筑.jpg',
    '凤凰古城.jpg',
    '冰川.jpg',
    '工具建模.png',
    '单体模型/机械.png',
    '单体模型/魔法棒.png',
    '单体模型/汽车模型简化.jpg',
    '热气球.jpg',
    '管道动画.jpg',
    '角色动画.png',
    '动物角色动画.jpg',
    '单体模型/鲤鱼浮雕.jpg',
    'unity摄像机拆解动画.jpg',
    '三维动画-汽车停车控制.jpg',
    '单体模型/充电宝.png',
    '单体模型/座舱.png',
    '单体模型/线控底盘联动.png',
    '单体模型/线控驱动实训平台.png',
    '单体模型/黑色小车.png',
    '乘用车自动驾驶装调实训室.png',
    '人工智能应用实训室.png',
    '公园一角.jpg',
    '城市弯路建筑.jpg',
    '城市景色.jpg',
    '城市道路场景.jpg',
    '实训室总览.png',
    '客厅练习.jpg',
    '室内房间.jpg',
    '宫殿.jpg',
    '宿舍-练习.jpg',
    '房子.jpg',
    '技术综合实训室.png',
    '整车区.png',
    '新台架教学区.png',
    '无人小车测试标定中心.png',
    '无人驾驶维修检测中心.png',
    '智慧交通模拟实训室.png',
    '智能汽车实训室.png',
    '智能网联科普体验展示室.png',
    '校园无人车运营实训室.png',
    '沙滩夜景.jpg',
    '沙漠.jpg',
    '沙盘.png',
    '熊猫.png',
    'CDSF项目效果图.png',
    'WXZY展会效果图.jpg',
    'ZYXY项目总览.png',
  ].map(filename => {
    const title = filename.replace(/\.(jpg|png)$/, '').replace(/^(单体模型|MHXCZYZZ项目效果图)\//, '');
    const category = '模型' as Category;
    return {
      id: generateId(category, title),
      title,
      category,
      createdAt: '',
      tools: ['3ds Max', 'V-Ray', 'Photoshop'],
      description: '三维建模与渲染作品。',
      mediaFiles: [createMediaFile(filename, '模型')],
    };
  }),

  {
    id: generateId('平面', '公司智能网联汽车实训基地海报'),
    title: '公司智能网联汽车实训基地海报',
    category: '平面' as Category,
    createdAt: '',
    tools: ['Photoshop', 'Illustrator'],
    description: '公司智能网联汽车实训基地系列海报设计。',
    mediaFiles: [
      createMediaFile('公司智能网联汽车实训基地海报/公司智能网联汽车实训基地海报-1.jpg', '平面'),
      createMediaFile('公司智能网联汽车实训基地海报/公司智能网联汽车实训基地海报-2.jpg', '平面'),
      createMediaFile('公司智能网联汽车实训基地海报/公司智能网联汽车实训基地海报-3.jpg', '平面'),
    ],
  },
  ...[
    '产品使用说明封面设计.jpg',
    '工具图标.png',
    '教材封面设计.png',
    '智能网联文化墙设计图.jpg',
    '学校海报制作.jpg',
    '系统界面设计.jpg',
    '软件界面.png',
  ].map(filename => {
    const title = filename.replace(/\.(jpg|png)$/, '');
    const category = '平面' as Category;
    return {
      id: generateId(category, title),
      title,
      category,
      createdAt: '',
      tools: ['Photoshop', 'Illustrator'],
      description: '专业的平面设计作品，涵盖海报设计、界面设计等多个领域。',
      mediaFiles: [createMediaFile(filename, '平面')],
    };
  }),

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
  ].map(filename => {
    const title = filename.replace(/\.(jpg|JPG)$/, '');
    const category = '绘画' as Category;
    return {
      id: generateId(category, title),
      title,
      category,
      createdAt: '',
      tools: ['水彩', '素描', '铅笔'],
      description: '传统绘画作品，展现了扎实的绘画功底和艺术表现力。',
      mediaFiles: [createMediaFile(filename, '绘画')],
    };
  }),

  {
    id: generateId('摄影', '人像——危安-花海'),
    title: '人像——危安-花海',
    category: '摄影' as Category,
    createdAt: '',
    tools: ['摄影', 'Lightroom'],
    description: '人像摄影作品，花海主题。',
    mediaFiles: [
      createMediaFile('人像——危安-花海/1.jpg', '摄影'),
      createMediaFile('人像——危安-花海/2.jpg', '摄影'),
      createMediaFile('人像——危安-花海/3.jpg', '摄影'),
      createMediaFile('人像——危安-花海/4.jpg', '摄影'),
      createMediaFile('人像——危安-花海/5.jpg', '摄影'),
      createMediaFile('人像——危安-花海/6.jpg', '摄影'),
      createMediaFile('人像——危安-花海/7.jpg', '摄影'),
    ],
  },
  {
    id: generateId('摄影', '人像——危安-草地'),
    title: '人像——危安-草地',
    category: '摄影' as Category,
    createdAt: '',
    tools: ['摄影', 'Lightroom'],
    description: '人像摄影作品，草地主题。',
    mediaFiles: [
      createMediaFile('人像——危安-草地/1.jpg', '摄影'),
      createMediaFile('人像——危安-草地/2.jpg', '摄影'),
      createMediaFile('人像——危安-草地/3.jpg', '摄影'),
      createMediaFile('人像——危安-草地/4.jpg', '摄影'),
      createMediaFile('人像——危安-草地/5.jpg', '摄影'),
      createMediaFile('人像——危安-草地/6.jpg', '摄影'),
      createMediaFile('人像——危安-草地/7.jpg', '摄影'),
      createMediaFile('人像——危安-草地/8.jpg', '摄影'),
    ],
  },
  {
    id: generateId('摄影', '人像——妙妙'),
    title: '人像——妙妙',
    category: '摄影' as Category,
    createdAt: '',
    tools: ['摄影', 'Lightroom'],
    description: '人像摄影作品。',
    mediaFiles: [
      createMediaFile('人像——妙妙/1.JPG', '摄影'),
      createMediaFile('人像——妙妙/2.JPG', '摄影'),
      createMediaFile('人像——妙妙/3.JPG', '摄影'),
      createMediaFile('人像——妙妙/4.JPG', '摄影'),
      createMediaFile('人像——妙妙/5.JPG', '摄影'),
      createMediaFile('人像——妙妙/6.JPG', '摄影'),
    ],
  },
  {
    id: generateId('摄影', '人像——婷婷'),
    title: '人像——婷婷',
    category: '摄影' as Category,
    createdAt: '',
    tools: ['摄影', 'Lightroom'],
    description: '人像摄影作品。',
    mediaFiles: [
      createMediaFile('人像——婷婷/1.JPG', '摄影'),
      createMediaFile('人像——婷婷/2.JPG', '摄影'),
      createMediaFile('人像——婷婷/3.JPG', '摄影'),
      createMediaFile('人像——婷婷/4.JPG', '摄影'),
      createMediaFile('人像——婷婷/5.JPG', '摄影'),
      createMediaFile('人像——婷婷/6.JPG', '摄影'),
    ],
  },
  {
    id: generateId('摄影', '人像——梦娇'),
    title: '人像——梦娇',
    category: '摄影' as Category,
    createdAt: '',
    tools: ['摄影', 'Lightroom'],
    description: '人像摄影作品。',
    mediaFiles: [
      createMediaFile('人像——梦娇/1.jpg', '摄影'),
      createMediaFile('人像——梦娇/2.jpg', '摄影'),
      createMediaFile('人像——梦娇/3.jpg', '摄影'),
      createMediaFile('人像——梦娇/4.jpg', '摄影'),
      createMediaFile('人像——梦娇/5.jpg', '摄影'),
      createMediaFile('人像——梦娇/6.jpg', '摄影'),
      createMediaFile('人像——梦娇/7.jpg', '摄影'),
      createMediaFile('人像——梦娇/8.jpg', '摄影'),
    ],
  },
  {
    id: generateId('摄影', '人像——辣辣'),
    title: '人像——辣辣',
    category: '摄影' as Category,
    createdAt: '',
    tools: ['摄影', 'Lightroom'],
    description: '人像摄影作品。',
    mediaFiles: [
      createMediaFile('人像——辣辣/1.jpg', '摄影'),
      createMediaFile('人像——辣辣/2.jpg', '摄影'),
      createMediaFile('人像——辣辣/3.jpg', '摄影'),
      createMediaFile('人像——辣辣/4.jpg', '摄影'),
      createMediaFile('人像——辣辣/5.jpg', '摄影'),
    ],
  },
  {
    id: generateId('摄影', '风景——深圳人才公园'),
    title: '风景——深圳人才公园',
    category: '摄影' as Category,
    createdAt: '',
    tools: ['摄影', 'Lightroom'],
    description: '风景摄影作品，深圳人才公园。',
    mediaFiles: [
      createMediaFile('风景——深圳人才公园/DSC_1257.JPG', '摄影'),
      createMediaFile('风景——深圳人才公园/DSC_1258.JPG', '摄影'),
      createMediaFile('风景——深圳人才公园/DSC_1262.JPG', '摄影'),
      createMediaFile('风景——深圳人才公园/DSC_1890.JPG', '摄影'),
    ],
  },

  ...[
    'AE动画练习.mp4',
    '公司宣传视频-1m14s.mp4',
    '视频剪辑-《伴你左右》.mp4',
    '采星科技(厦门)公司logo动画-1.mp4',
    '采星科技(厦门)公司logo动画-2.mp4',
    '采星科技(厦门)公司宣传介绍.mp4',
  ].map(filename => {
    const title = filename.replace('.mp4', '');
    const category = '其它' as Category;
    return {
      id: generateId(category, title),
      title,
      category,
      createdAt: '',
      tools: ['After Effects'],
      description: '其它类型的创意作品。',
      mediaFiles: [createMediaFile(filename, '其它')],
    };
  }),
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