// 城市地图数据 - 洛阳

export interface Attraction {
  id: string;
  name: string;
  level: string;
  tags: string[];
  category: string;
  description: string;
  address: string;
  price: string;
  phone: string;
  weather: WeatherDay[];
  facilities: string[];
  traffic: TrafficInfo;
  images: string[];
  latitude: number;
  longitude: number;
}

export interface WeatherDay {
  date: string;
  label: string;
  icon: string;
  temp: string;
}

export interface TrafficInfo {
  summary: string;
  busRoutes: string[];
  metroStations: string[];
  parking: string;
}

export interface Food {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  businessHours: string;
  averagePrice: string;
  images: string[];
  latitude: number;
  longitude: number;
}

export interface Heritage {
  id: string;
  name: string;
  description: string;
  address: string;
  level: string;
  images: string[];
}

// 景点分类
export const attractionCategories = [
  { key: 'nature', label: '自然景观' },
  { key: 'culture', label: '人文景观' },
  { key: 'red', label: '红色景区' },
  { key: 'park', label: '公园' },
  { key: 'resort', label: '度假' },
];

// 美食分类
export const foodCategories = [
  { key: 'soup', label: '汤类' },
  { key: 'noodle', label: '面食' },
  { key: 'dish', label: '水席' },
  { key: 'snack', label: '小吃' },
  { key: 'pastry', label: '糕点' },
];

export const attractions: Attraction[] = [
  {
    id: 'longmen',
    name: '龙门石窟',
    level: '5A',
    tags: ['人文景观', '世界文化遗产'],
    category: 'culture',
    description: '龙门石窟位于洛阳市南郊伊河两岸，是中国四大石窟之一，始建于北魏时期，历经东魏、西魏、北齐、隋、唐、五代、宋等朝代连续大规模营造达400余年之久。现存窟龛2345个，造像10万余尊，碑刻题记2800余品，被联合国教科文组织评为世界文化遗产。',
    address: '洛阳市洛龙区龙门中街13号',
    price: '¥90',
    phone: '0379-65980972',
    weather: [
      { date: '今天', label: '今天', icon: 'sun', temp: '晴 22~31°C' },
      { date: '明天', label: '明天', icon: 'cloud', temp: '多云 21~30°C' },
      { date: '后天', label: '后天', icon: 'rain', temp: '小雨 20~28°C' },
    ],
    facilities: ['游客中心', '无障碍通道', '母婴室', '行李寄存', '医疗室', '停车场'],
    traffic: {
      summary: '龙门石窟位于洛阳市南郊，交通便利。可从市区乘坐公交、地铁或自驾前往。',
      busRoutes: ['53路', '60路', '71路', '81路', '99路'],
      metroStations: ['龙门高铁站（2号线）'],
      parking: '景区设有大型停车场，小车收费10元。',
    },
    images: [
      '/static/imgs/longmen.jpg',
      '/static/imgs/longmen.jpg',
      '/static/imgs/longmen.jpg',
      '/static/imgs/longmen.jpg',
    ],
    latitude: 34.556,
    longitude: 112.471,
  },
  {
    id: 'baima',
    name: '白马寺',
    level: '4A',
    tags: ['人文景观', '佛教圣地'],
    category: 'culture',
    description: '白马寺创建于东汉永平十一年（公元68年），是中国第一座官办寺院，被誉为中国佛教的"祖庭"和"释源"。寺内保存了大量元代造像，具有极高的历史和艺术价值。',
    address: '洛阳市洛龙区白马寺镇洛白路6号',
    price: '¥35',
    phone: '0379-63789053',
    weather: [
      { date: '今天', label: '今天', icon: 'sun', temp: '晴 22~31°C' },
      { date: '明天', label: '明天', icon: 'cloud', temp: '多云 21~30°C' },
      { date: '后天', label: '后天', icon: 'rain', temp: '小雨 20~28°C' },
    ],
    facilities: ['游客中心', '素食餐厅', '茶室', '停车场', '讲解服务'],
    traffic: {
      summary: '白马寺位于洛阳市东郊，可乘坐公交或自驾前往，距离市区约12公里。',
      busRoutes: ['56路', '58路', '801路'],
      metroStations: ['杨湾站（1号线）'],
      parking: '景区南门设有停车场。',
    },
    images: [
      '/static/imgs/baima.jpg',
      '/static/imgs/baima.jpg',
    ],
    latitude: 34.724,
    longitude: 112.606,
  },
  {
    id: 'laojun',
    name: '老君山',
    level: '5A',
    tags: ['自然景观', '道教名山'],
    category: 'nature',
    description: '老君山位于洛阳市栾川县，是伏牛山主峰，海拔2217米。因道教始祖老子归隐修炼于此而得名，是国家级自然保护区、世界地质公园。山顶金顶道观群气势恢宏，云海日出景观壮丽。',
    address: '洛阳市栾川县七里坪村',
    price: '¥100',
    phone: '0379-66838888',
    weather: [
      { date: '今天', label: '今天', icon: 'cloud', temp: '多云 15~24°C' },
      { date: '明天', label: '明天', icon: 'rain', temp: '小雨 14~22°C' },
      { date: '后天', label: '后天', icon: 'sun', temp: '晴 16~25°C' },
    ],
    facilities: ['索道', '观光车', '餐厅', '住宿', '停车场', '医疗室'],
    traffic: {
      summary: '老君山距洛阳市区约150公里，建议自驾或乘坐旅游专线前往。',
      busRoutes: ['洛阳-栾川旅游专线'],
      metroStations: [],
      parking: '景区大门口设有大型停车场',
    },
    images: [
      '/static/imgs/laojun.jpg',
      '/static/imgs/laojun.jpg',
      '/static/imgs/laojun.jpg',
    ],
    latitude: 33.783,
    longitude: 111.865,
  },
  {
    id: 'baiyun',
    name: '白云山',
    level: '5A',
    tags: ['自然景观', '国家森林公园'],
    category: 'nature',
    description: '白云山位于洛阳市嵩县南部，是国家5A级旅游景区、国家森林公园。景区内有奇峰怪石、飞瀑流泉、原始森林，被誉为"人间仙境"。主峰玉皇顶海拔2216米，是中原地区观云海、日出的绝佳地点。',
    address: '洛阳市嵩县车村镇铜河村',
    price: '¥75',
    phone: '0379-66590127',
    weather: [
      { date: '今天', label: '今天', icon: 'sun', temp: '晴 18~27°C' },
      { date: '明天', label: '明天', icon: 'cloud', temp: '多云 17~26°C' },
      { date: '后天', label: '后天', icon: 'rain', temp: '小雨 16~24°C' },
    ],
    facilities: ['索道', '观光车', '酒店', '餐厅', '露营地', '停车场'],
    traffic: {
      summary: '白云山距洛阳市区约220公里，建议自驾前往，也可乘坐旅游专线。',
      busRoutes: ['洛阳-嵩县旅游专线'],
      metroStations: [],
      parking: '景区入口设有大型停车场',
    },
    images: [
      '/static/imgs/baiyun.jpg',
      '/static/imgs/baiyun.jpg',
    ],
    latitude: 33.683,
    longitude: 111.85,
  },
  {
    id: 'guanlin',
    name: '关林',
    level: '4A',
    tags: ['人文景观', '三国文化'],
    category: 'culture',
    description: '关林是埋葬三国名将关羽首级的地方，始建于明万历二十四年（1596年），是全国重点文物保护单位。关林的建筑规格按照宫殿形式修建，规模宏大，布局严谨，是海内外三大关庙之一。',
    address: '洛阳市洛龙区关林南街2号',
    price: '¥40',
    phone: '0379-65951746',
    weather: [
      { date: '今天', label: '今天', icon: 'sun', temp: '晴 22~31°C' },
      { date: '明天', label: '明天', icon: 'cloud', temp: '多云 21~30°C' },
      { date: '后天', label: '后天', icon: 'rain', temp: '小雨 20~28°C' },
    ],
    facilities: ['游客中心', '讲解服务', '停车场', '纪念品商店'],
    traffic: {
      summary: '关林位于洛阳市区南部，交通便利，可乘坐公交或地铁到达。',
      busRoutes: ['15路', '39路', '55路', '58路', '69路', '71路'],
      metroStations: ['关林站（2号线）'],
      parking: '景区周边设有停车场。',
    },
    images: [
      '/static/imgs/guanlin.jpg',
      '/static/imgs/guanlin.jpg',
    ],
    latitude: 34.606,
    longitude: 112.47,
  },
  {
    id: 'mingtang',
    name: '明堂天堂',
    level: '4A',
    tags: ['人文景观', '隋唐遗址'],
    category: 'culture',
    description: '明堂天堂是隋唐洛阳城宫城的核心区域，是武则天时期的礼制建筑。明堂是武则天登基称帝、发布政令的场所，天堂则是武则天礼佛之所。景区在原址上复原重建，再现了盛唐时期的宏伟气势。',
    address: '洛阳市老城区中州中路与定鼎路交叉口',
    price: '¥120',
    phone: '0379-61109902',
    weather: [
      { date: '今天', label: '今天', icon: 'sun', temp: '晴 22~31°C' },
      { date: '明天', label: '明天', icon: 'cloud', temp: '多云 21~30°C' },
      { date: '后天', label: '后天', icon: 'rain', temp: '小雨 20~28°C' },
    ],
    facilities: ['游客中心', '夜游演出', '唐装体验', '停车场', '餐厅'],
    traffic: {
      summary: '明堂天堂位于洛阳市区中心，交通极为便利。',
      busRoutes: ['4路', '5路', '8路', '9路', '18路', '21路', '26路', '41路', '48路', '49路'],
      metroStations: ['应天门站（1号线）'],
      parking: '景区地下设有停车场。',
    },
    images: [
      '/static/imgs/mingtang.jpg',
      '/static/imgs/mingtang.jpg',
      '/static/imgs/mingtang.jpg',
    ],
    latitude: 34.684,
    longitude: 112.467,
  },
  {
    id: 'luopu',
    name: '洛浦公园',
    level: '',
    tags: ['公园', '城市绿肺'],
    category: 'park',
    description: '洛浦公园沿洛河两岸修建，全长20余公里，是洛阳市最大的城市公园和滨河绿地。园内绿树成荫、花草繁茂，设有健身步道、亲水平台、观景台等设施，是市民休闲健身的好去处。',
    address: '洛阳市西工区、涧西区、洛龙区沿洛河两岸',
    price: '免费',
    phone: '0379-63935110',
    weather: [
      { date: '今天', label: '今天', icon: 'sun', temp: '晴 22~31°C' },
      { date: '明天', label: '明天', icon: 'cloud', temp: '多云 21~30°C' },
      { date: '后天', label: '后天', icon: 'rain', temp: '小雨 20~28°C' },
    ],
    facilities: ['健身步道', '儿童乐园', '亲水平台', '观景台', '公共卫生间'],
    traffic: {
      summary: '洛浦公园贯穿洛阳市区，沿线有多个入口，公交和地铁均可到达。',
      busRoutes: ['2路', '7路', '10路', '17路', '20路', '28路', '33路', '57路'],
      metroStations: ['牡丹桥站（1号线）', '市民之家站（2号线）'],
      parking: '沿线设有多个临时停车场。',
    },
    images: [
      '/static/imgs/luopu.jpg',
      '/static/imgs/luopu.jpg',
    ],
    latitude: 34.62,
    longitude: 112.44,
  },
  {
    id: 'luoba',
    name: '八路军驻洛办事处',
    level: '',
    tags: ['红色景区', '革命旧址'],
    category: 'red',
    description: '八路军驻洛办事处纪念馆（简称洛八办）成立于1938年，是抗日战争时期八路军在国统区的重要公开办事机构。现为全国爱国主义教育示范基地、河南省文物保护单位。',
    address: '洛阳市老城区贴廓巷35号',
    price: '免费',
    phone: '0379-63952409',
    weather: [
      { date: '今天', label: '今天', icon: 'sun', temp: '晴 22~31°C' },
      { date: '明天', label: '明天', icon: 'cloud', temp: '多云 21~30°C' },
      { date: '后天', label: '后天', icon: 'rain', temp: '小雨 20~28°C' },
    ],
    facilities: ['游客中心', '讲解服务', '展览馆', '停车场'],
    traffic: {
      summary: '洛八办位于洛阳老城区，可乘坐公交或地铁到达。',
      busRoutes: ['4路', '5路', '9路', '18路', '20路', '22路', '41路'],
      metroStations: ['丽景门站（1号线）'],
      parking: '老城区停车位紧张，建议公共交通出行。',
    },
    images: [
      '/static/imgs/balu.jpg',
      '/static/imgs/balu.jpg',
    ],
    latitude: 34.686,
    longitude: 112.47,
  },
];

export const foods: Food[] = [
  {
    id: 'niurou',
    name: '铁谢李记牛肉汤',
    category: 'soup',
    description: '洛阳牛肉汤是洛阳最具代表性的早餐之一，以新鲜牛骨熬制汤底，配以薄切牛肉、牛杂，撒上葱花、香菜，汤鲜味美。铁谢李记是洛阳老字号，汤底浓郁，肉量十足。',
    address: '洛阳市老城区中州东路与环城西路交叉口',
    phone: '0379-63912345',
    businessHours: '05:00-11:00',
    averagePrice: '¥15',
    images: [
      '/static/imgs/niurou.jpg',
      '/static/imgs/niurou.jpg',
    ],
    latitude: 34.688,
    longitude: 112.472,
  },
  {
    id: 'bufan',
    name: '高记不翻汤',
    category: 'soup',
    description: '不翻汤是洛阳传统名吃，已有30余年历史。其特色是汤面上的薄饼"不翻"，配以海带、粉丝、豆腐皮、木耳等配料，酸辣可口，是洛阳人喜爱的传统小吃。',
    address: '洛阳市老城区西大街与义勇街交叉口',
    phone: '0379-63956789',
    businessHours: '07:00-21:00',
    averagePrice: '¥12',
    images: [
      '/static/imgs/bufan-tang.jpg',
      '/static/imgs/bufan-tang.jpg',
    ],
    latitude: 34.685,
    longitude: 112.468,
  },
  {
    id: 'shui',
    name: '真不同饭店',
    category: 'dish',
    description: '真不同饭店始创于1895年，是洛阳水席的代表。洛阳水席始于唐代，已有1300多年历史，是河南独有的地方风味宴席。全套水席共24道菜，以汤菜为主，酸辣味型，有"天下名宴"之美誉。',
    address: '洛阳市老城区中州东路59号',
    phone: '0379-63952666',
    businessHours: '10:00-14:00, 17:00-21:00',
    averagePrice: '¥80',
    images: [
      '/static/imgs/shui.jpg',
      '/static/imgs/shui.jpg',
      '/static/imgs/shui.jpg',
    ],
    latitude: 34.687,
    longitude: 112.473,
  },
  {
    id: 'jiang',
    name: '老雒阳面馆',
    category: 'noodle',
    description: '浆面条是洛阳传统面食，以绿豆浆发酵后煮制面条，配以花生、黄豆、芹菜、辣椒油等调料，酸香开胃。老雒阳面馆是洛阳知名连锁品牌，保留了最地道的洛阳面食风味。',
    address: '洛阳市西工区中州中路与解放路交叉口',
    phone: '0379-63288888',
    businessHours: '06:30-21:30',
    averagePrice: '¥10',
    images: [
      '/static/imgs/jiangmian.jpg',
      '/static/imgs/jiangmian.jpg',
    ],
    latitude: 34.68,
    longitude: 112.445,
  },
  {
    id: 'mudan',
    name: '万景祥牡丹饼',
    category: 'pastry',
    description: '牡丹饼是洛阳特色糕点，以牡丹花瓣入馅，外皮酥脆，内馅香甜。万景祥是洛阳老字号糕点品牌，其牡丹饼制作技艺被列入洛阳市非物质文化遗产名录。',
    address: '洛阳市西工区中州中路239号',
    phone: '0379-63234567',
    businessHours: '08:00-21:00',
    averagePrice: '¥25',
    images: [
      '/static/imgs/mudan.jpg',
      '/static/imgs/mudan.jpg',
    ],
    latitude: 34.682,
    longitude: 112.448,
  },
  {
    id: 'shaobing',
    name: '顾县肉合',
    category: 'snack',
    description: '顾县肉合是洛阳偃师区顾县镇的特色小吃，以薄饼夹猪头肉、黄瓜丝、蒜泥等，配以特制酱料，口感丰富，肥而不腻。是洛阳人喜爱的街头美食。',
    address: '洛阳市偃师区顾县镇',
    phone: '0379-67551234',
    businessHours: '08:00-20:00',
    averagePrice: '¥8',
    images: [
      '/static/imgs/shaobing.jpg',
      '/static/imgs/shaobing.jpg',
    ],
    latitude: 34.55,
    longitude: 112.75,
  },
  {
    id: 'hula',
    name: '小街锅贴',
    category: 'snack',
    description: '小街锅贴是洛阳西工小街的特色小吃，已有百年历史。锅贴底部金黄酥脆，馅料鲜美多汁，是洛阳人早餐和夜宵的最爱。',
    address: '洛阳市西工区西工小街',
    phone: '0379-63298765',
    businessHours: '06:00-22:00',
    averagePrice: '¥12',
    images: [
      '/static/imgs/hula.jpg',
      '/static/imgs/hula.jpg',
    ],
    latitude: 34.679,
    longitude: 112.444,
  },
];

export const heritages: Heritage[] = [
  {
    id: 'peony',
    name: '洛阳牡丹栽培技艺',
    description: '洛阳牡丹栽培技艺历史悠久，始于隋、盛于唐、甲天下于宋。洛阳牡丹以花大色艳、雍容华贵而著称，有"洛阳牡丹甲天下"之誉。每年四月的洛阳牡丹花会吸引数百万游客前来观赏。洛阳牡丹栽培技艺于2011年被列入河南省非物质文化遗产名录。',
    address: '洛阳市各大牡丹园（王城公园、中国国花园、隋唐城遗址植物园等）',
    level: '省级非遗',
    images: [
      '/static/imgs/peony.jpg',
      '/static/imgs/peony.jpg',
    ],
  },
  {
    id: 'sancai',
    name: '唐三彩烧制技艺',
    description: '唐三彩是唐代彩色釉陶的统称，以黄、绿、白三色为主。洛阳是唐三彩的发源地，唐三彩烧制技艺包括制胎、素烧、施釉、釉烧等复杂工序。其作品造型生动、釉色绚丽，被誉为"东方艺术瑰宝"。2008年被列入国家级非物质文化遗产名录。',
    address: '洛阳市孟津区南石山村',
    level: '国家级非遗',
    images: [
      '/static/imgs/sancai.jpg',
      '/static/imgs/sancai.jpg',
    ],
  },
  {
    id: 'deng',
    name: '洛阳宫灯制作技艺',
    description: '洛阳宫灯起源于东汉，盛于隋唐，距今已有1800多年历史。洛阳宫灯以造型优美、图案精致、光彩夺目而著称，是宫廷御用灯具。传统宫灯以竹木为骨、丝绸为面、彩绘为饰，制作技艺精湛复杂。2008年被列入国家级非物质文化遗产名录。',
    address: '洛阳市老城区宫灯厂',
    level: '国家级非遗',
    images: [
      '/static/imgs/deng.jpg',
      '/static/imgs/deng.jpg',
    ],
  },
  {
    id: 'pi',
    name: '洛阳皮影戏',
    description: '洛阳皮影戏又称"灯影戏"，是用兽皮雕刻人物剪影，借灯光投影在白色幕布上表演故事的民间戏曲艺术。洛阳皮影戏历史悠久，唱腔独特，表演生动，是豫西地区重要的民间艺术形式。2011年被列入河南省非物质文化遗产名录。',
    address: '洛阳市各县区文化场馆',
    level: '省级非遗',
    images: [
      '/static/imgs/piying.jpg',
      '/static/imgs/piying.jpg',
    ],
  },
  {
    id: 'jian',
    name: '洛阳铲制作技艺',
    description: '洛阳铲是洛阳地区发明的一种考古钻探工具，因最初用于盗墓而得名，后成为考古发掘的重要工具。洛阳铲制作技艺包括选料、锻打、淬火、开刃等工序，要求铲身坚韧、铲刃锋利。2015年被列入洛阳市非物质文化遗产名录。',
    address: '洛阳市老城区洛阳铲博物馆',
    level: '市级非遗',
    images: [
      '/static/imgs/luoyangchan.jpg',
      '/static/imgs/luoyangchan.jpg',
    ],
  },
  {
    id: 'zhi',
    name: '洛阳剪纸',
    description: '洛阳剪纸是豫西地区传统民间艺术，以剪刀或刻刀在纸上剪刻花纹，用于装点生活或配合民俗活动。洛阳剪纸题材广泛，包括花鸟虫鱼、人物故事、吉祥图案等，风格粗犷豪放、质朴生动。2009年被列入河南省非物质文化遗产名录。',
    address: '洛阳市非物质文化遗产保护中心',
    level: '省级非遗',
    images: [
      '/static/imgs/papercut.jpg',
      '/static/imgs/papercut.jpg',
    ],
  },
];
