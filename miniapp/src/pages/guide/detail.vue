<template>
  <view class="page-shell detail-page">
    <view class="hero-wrap">
      <image class="hero-img" :src="current.cover" mode="aspectFill" />
      <view class="hero-mask" />
      <view class="hero-nav">
        <view class="nav-btn" @tap="goBack">‹</view>
        <view class="nav-btn" @tap="goList">☰</view>
      </view>
      <view class="hero-title-box">
        <view class="hero-title">{{ current.title }}</view>
        <view class="hero-subtitle">{{ current.subtitle }}</view>
      </view>
    </view>

    <view class="content-card">
      <view class="meta-row">
        <view class="meta-item"><text class="meta-label">⏱ 时长</text><text class="meta-value">{{ current.duration }}</text></view>
        <view class="meta-item"><text class="meta-label">🎟 票价</text><text class="meta-value">{{ current.price }}</text></view>
        <view class="meta-item"><text class="meta-label">👥 适合</text><text class="meta-value">{{ current.audience }}</text></view>
      </view>

      <view class="tag-row">
        <view v-for="tag in current.tags" :key="tag" class="tag">{{ tag }}</view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">📖 景点概述</view>
      <view class="section-desc">{{ current.intro }}</view>
    </view>

    <view class="section">
      <view class="section-title">🗺 推荐行程</view>
      <view class="timeline">
        <view v-for="(step, idx) in current.itinerary" :key="idx" class="time-item">
          <view class="time-dot">{{ step.time }}</view>
          <view class="time-content">
            <view class="time-title">{{ step.title }}</view>
            <view class="time-desc">{{ step.desc }}</view>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">💡 实用贴士</view>
      <view class="tips-list">
        <view v-for="(tip, idx) in current.tips" :key="idx" class="tip-item">
          <text class="tip-num">0{{ idx + 1 }}</text>
          <text class="tip-text">{{ tip }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">🍜 周边美食</view>
      <view class="food-list">
        <view v-for="food in current.foods" :key="food" class="food-chip">· {{ food }}</view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="btn-secondary" @tap="goList">返回攻略</view>
      <view class="btn-primary" @tap="openNavigation">🧭 导航到此</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

interface GuideDetail {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  duration: string;
  price: string;
  audience: string;
  tags: string[];
  intro: string;
  location: { latitude: number; longitude: number; address: string };
  itinerary: { time: string; title: string; desc: string }[];
  tips: string[];
  foods: string[];
}

const GUIDES: Record<string, GuideDetail> = {
  g1: {
    id: 'g1',
    title: '龙门石窟一日深度游',
    subtitle: '世界文化遗产 · 石刻艺术巅峰',
    cover: '/static/imgs/longmen.jpg',
    duration: '约 4 小时',
    price: '门票 ¥90',
    audience: '历史文化爱好者',
    tags: ['世界遗产', '石刻艺术', '必打卡'],
    intro:
      '龙门石窟位于洛阳市南郊伊河两岸，始凿于北魏孝文帝迁都洛阳（493年）前后，历经东魏、西魏、北齐、北周、隋、唐长达 400 余年的营造，现存洞窟 2345 个，造像 10 万余尊，是世界上造像最多、规模最大的石刻艺术宝库，被联合国科教文组织评为"世界文化遗产"。',
    location: { latitude: 34.5563, longitude: 112.4618, address: '河南省洛阳市洛龙区龙门镇' },
    itinerary: [
      { time: '08:00', title: '抵达景区', desc: '建议提前网上购票，东门入园。' },
      { time: '08:30', title: '西山石窟', desc: '依次参观卢舍那大佛、万佛洞、莲花洞、奉先寺等核心洞窟。' },
      { time: '12:00', title: '伊河午餐', desc: '景区附近有素食与简餐，建议自带水和少量点心。' },
      { time: '13:30', title: '东山石窟', desc: '参观莲花洞、擂鼓台三洞等，相对人少，可安静欣赏。' },
      { time: '15:30', title: '香山寺 / 白园', desc: '顺路游览，感受伊河两岸风光。' },
      { time: '17:00', title: '夜游龙门', desc: '灯光下的卢舍那大佛别有一番韵味，值得一看。' },
    ],
    tips: [
      '建议请专业讲解（80 元/次），否则看石刻只是"看石头"。',
      '景区很大，全程徒步约 3-4 小时，穿舒适的鞋。',
      '旺季（节假日）排队可能超过 2 小时，务必预约。',
      '西山石窟→过河→东山石窟的顺序最省力。',
    ],
    foods: ['洛阳水席', '不翻汤', '洛阳牛肉汤', '浆面条'],
  },
  g2: {
    id: 'g2',
    title: '老君山两日登峰',
    subtitle: '道教名山 · 金顶云海',
    cover: '/static/imgs/laojun.jpg',
    duration: '2 天 1 夜',
    price: '门票 ¥210（含中灵索道）',
    audience: '登山摄影爱好者',
    tags: ['道教名山', '自然风光', '云海日出'],
    intro:
      '老君山位于洛阳市栾川县，是伏牛山脉主峰，海拔 2217 米。因道教始祖老子在此归隐修炼而得名，是道教"天下名山"。山中云海、日出、金顶、十里画屏被誉为"四绝"，金顶日出更是一生难忘的景观。',
    location: { latitude: 33.7389, longitude: 111.6347, address: '河南省洛阳市栾川县老君山风景区' },
    itinerary: [
      { time: 'Day1 07:00', title: '出发前往老君山', desc: '洛阳市区出发约 3 小时车程，建议自驾或抱团。' },
      { time: 'Day1 11:00', title: '乘坐中灵索道上山', desc: '索道全长 2713 米，节省 2 小时登山时间。' },
      { time: 'Day1 13:00', title: '游览十里画屏', desc: '老君山精华所在，峰林景观宛如泼墨山水。' },
      { time: 'Day1 18:00', title: '山顶住宿', desc: '金顶附近有多家民宿，建议提前预订。' },
      { time: 'Day2 05:30', title: '金顶看日出', desc: '日出时间约 6:20，务必提前 30 分钟就位。' },
      { time: 'Day2 08:00', title: '游览金顶道观群', desc: '游览老君庙、金殿、玉皇顶等道教建筑。' },
      { time: 'Day2 14:00', title: '下山返程', desc: '步行 + 索道下山，约 2 小时。' },
    ],
    tips: [
      '山顶气温比山下低 8-10℃，即使夏季也要带冲锋衣。',
      '务必穿防滑登山鞋，部分台阶陡峭湿滑。',
      '金顶住宿紧张，旺季提前 2-3 周预订。',
      '山上物价较高，建议自带巧克力、水等补给。',
    ],
    foods: ['栾川豆腐', '橡子凉粉', '炖土鸡', '玉米糁汤'],
  },
  g3: {
    id: 'g3',
    title: '白马寺禅宗寻根',
    subtitle: '中国第一古刹 · 佛教祖庭',
    cover: '/static/imgs/baima.jpg',
    duration: '约 2 小时',
    price: '门票 ¥35',
    audience: '宗教文化爱好者',
    tags: ['佛教祖庭', '历史名刹', '文化打卡'],
    intro:
      '白马寺始建于东汉永平十一年（公元 68 年），是佛教传入中国后兴建的第一座官办寺院，有"中国第一古刹"之称。寺内保存有释迦牟尼舍利、元代彩塑等珍贵文物，是中国佛教祖庭之一。',
    location: { latitude: 34.7378, longitude: 112.5822, address: '河南省洛阳市瀍河回族区白马寺镇' },
    itinerary: [
      { time: '09:00', title: '山门入寺', desc: '参观天王殿、大雄宝殿、接引殿等主要殿堂。' },
      { time: '10:00', title: '印度风格佛殿', desc: '新建的印度、缅甸、泰国风格佛殿群，极具异域风情。' },
      { time: '11:00', title: '方丈院 / 禅堂', desc: '可参与早课或法会，感受禅修氛围。' },
      { time: '11:30', title: '素斋午餐', desc: '寺内五观堂供应素斋，20 元/位，体验禅意生活。' },
    ],
    tips: [
      '入寺请保持安静，不要在殿堂内拍照。',
      '衣冠整洁，避免穿过于暴露的衣物。',
      '可在客堂请一盏平安灯（20 元）祈福。',
      '附近有"释源美术馆"，了解佛教艺术的好地方。',
    ],
    foods: ['白马寺素斋', '锅贴', '浆面条', '胡辣汤'],
  },
  g4: {
    id: 'g4',
    title: '明堂天堂穿越游记',
    subtitle: '盛唐万象神宫 · 沉浸式演艺',
    cover: '/static/imgs/mingtang.jpg',
    duration: '约 3 小时',
    price: '门票 ¥120',
    audience: '国风摄影爱好者',
    tags: ['盛唐文化', '夜游必去', '演艺体验'],
    intro:
      '明堂天堂是武则天称帝后下令营建的"明堂"与"通天浮屠"（弥勒佛巨像）的遗址复原，高 88.88 米，是隋唐洛阳城中轴线的核心建筑。景区内有沉浸式演艺《盛唐.武则天》，每晚两场，将盛唐气象演绎得淋漓尽致。',
    location: { latitude: 34.7223, longitude: 112.4536, address: '河南省洛阳市老城区中州路与定鼎路交叉口' },
    itinerary: [
      { time: '15:00', title: '游览明堂', desc: '了解明堂作为"天子布政之宫"的历史功能。' },
      { time: '17:00', title: '登通天浮屠', desc: '乘电梯登顶，俯瞰洛阳老城区夜景。' },
      { time: '19:00', title: '观看沉浸式演艺', desc: '《武则天》或《神都迎宾》，约 60 分钟，震撼视听。' },
      { time: '20:30', title: '夜游公园', desc: '灯光璀璨，与明堂合影留念。' },
    ],
    tips: [
      '演艺票需提前一天预订，旺季可能售罄。',
      '推荐晚上 19:00 场，白天场氛围稍逊。',
      '可租借唐装（100 元/套）拍照，更有代入感。',
      '周边配套餐饮丰富，老城区步行可达。',
    ],
    foods: ['洛阳水席（真不同）', '不翻汤', '浆面条', '牛肉汤'],
  },
  g5: {
    id: 'g5',
    title: '白云山避暑之旅',
    subtitle: '5A 级景区 · 森林氧吧',
    cover: '/static/imgs/baiyun.jpg',
    duration: '约 8 小时',
    price: '门票 ¥75 + 交通 ¥70',
    audience: '亲子 / 家庭游',
    tags: ['避暑胜地', '森林氧吧', '亲子出游'],
    intro:
      '白云山位于洛阳市嵩县南部，是国家级自然保护区、国家 5A 级景区。森林覆盖率达 98%，盛夏平均气温仅 18℃，被誉为"中原避暑胜地"。景区内有玉皇顶、瀑布群、高山牡丹园等多个精华景点。',
    location: { latitude: 33.6739, longitude: 111.5258, address: '河南省洛阳市嵩县车村镇白云山风景区' },
    itinerary: [
      { time: '07:00', title: '出发前往白云山', desc: '洛阳市区出发约 3 小时车程。' },
      { time: '10:30', title: '换乘景区交通', desc: '景区入口到核心景点约 40 分钟盘山公路。' },
      { time: '11:30', title: '游览瀑布群', desc: '观赏玉龙瀑布、九龙瀑布等，水声轰鸣壮观。' },
      { time: '13:00', title: '山中午餐', desc: '白云山庄供应农家菜，山野菜与土鸡是特色。' },
      { time: '14:30', title: '登玉皇顶', desc: '海拔 2216 米，中原最高峰之一，云海壮观。' },
      { time: '16:30', title: '高山牡丹园', desc: '海拔 1500 米的牡丹园，6 月仍有晚花品种。' },
    ],
    tips: [
      '山上气温比山下低 10-15℃，务必带外套。',
      '盘山公路弯道多，晕车者请提前服药。',
      '建议穿长裤长袖，山中蚊虫较多。',
      '景区内住宿紧张，建议提前预订民宿。',
    ],
    foods: ['嵩县豆腐', '野生香菇', '土鸡炖汤', '山野菜'],
  },
  g6: {
    id: 'g6',
    title: '关林庙会深度游',
    subtitle: '三国文化圣地 · 关帝信仰',
    cover: '/static/imgs/guanlin.jpg',
    duration: '约 2 小时',
    price: '门票 ¥40',
    audience: '三国文化爱好者',
    tags: ['三国文化', '民俗庙会', '祈福打卡'],
    intro:
      '关林是埋葬三国蜀将关羽首级的地方，始建于东汉末年，现为国家 4A 级景区。每年正月初一至十六举办"关林新春庙会"，是中原地区最具影响力的民俗庙会之一，也是海内外华人关帝信仰的重要圣地。',
    location: { latitude: 34.6159, longitude: 112.4549, address: '河南省洛阳市洛龙区关林镇' },
    itinerary: [
      { time: '09:00', title: '拜谒关林', desc: '参观戏台、钟鼓楼、大殿、关帝冢等核心建筑。' },
      { time: '10:00', title: '逛新春庙会', desc: '品尝小吃、观看民俗表演、选购特色商品。' },
      { time: '11:30', title: '关帝祭拜仪式', desc: '上午 10 点、下午 3 点有仿古祭拜仪式。' },
      { time: '12:00', title: '关林周边午餐', desc: '关林镇内有多家特色小店。' },
    ],
    tips: [
      '庙会期间人流量极大，建议错峰前往。',
      '可请关帝护身符（30-100 元），求平安顺利。',
      '关林与龙门石窟相距 15 公里，可安排同日游览。',
      '注意保管随身物品，防扒手。',
    ],
    foods: ['关林牛肉汤', '锅贴', '炒面', '蒸饺'],
  },
  g7: {
    id: 'g7',
    title: '洛邑古城汉服日',
    subtitle: '非遗汉服 · 穿越大唐',
    cover: '/static/imgs/luoyi.jpg',
    duration: '约 4 小时',
    price: '免费（汉服租赁 ¥158 起）',
    audience: '汉服 / 摄影爱好者',
    tags: ['汉服体验', '穿越打卡', '夜游必去'],
    intro:
      '洛邑古城以"国风"为主题，依托洛阳千年古都文化，是国内最著名的汉服打卡基地之一。园区内有多家汉服租赁店，专业妆造团队，穿上汉服走在古城街巷，随手一拍即是穿越感的大片。',
    location: { latitude: 34.7253, longitude: 112.4618, address: '河南省洛阳市老城区九都东路与柳林街交叉口' },
    itinerary: [
      { time: '14:00', title: '挑选汉服', desc: '推荐"芥子"、"如梦霓裳"等知名店铺，妆造约 1.5 小时。' },
      { time: '16:00', title: '古城街巷打卡', desc: '文峰塔、古风桥、灯笼长廊都是出片机位。' },
      { time: '18:00', title: '古城夜游', desc: '灯笼亮起，光影迷离，最佳拍摄时段。' },
      { time: '19:30', title: '观看演艺', desc: '《洛神赋》实景演出或《盛唐夜宴》。' },
      { time: '21:00', title: '归还汉服', desc: '注意保留押金凭证。' },
    ],
    tips: [
      '周末 / 节假日人极多，建议工作日前往。',
      '提前预约妆造可节省 1 小时排队时间。',
      '自己化妆（基础）可以加快出片速度。',
      '携带充电宝，拍照耗电快。',
    ],
    foods: ['古城小酥肉', '牡丹饼', '糖油粑粑', '炒凉粉'],
  },
  g8: {
    id: 'g8',
    title: '洛阳美食探店攻略',
    subtitle: '不翻汤 · 牛肉汤 · 水席',
    cover: '/static/imgs/food.jpg',
    duration: '约 3 小时',
    price: '人均 ¥80',
    audience: '美食爱好者',
    tags: ['特色美食', '地方小吃', '吃货必看'],
    intro:
      '洛阳地处中原，饮食文化源远流长。以"汤"为名，牛肉汤、羊肉汤、不翻汤、浆面条汤各具特色；水席是洛阳最隆重的宴席，"真不同"饭店的水席传承百年，是洛阳菜的代表。',
    location: { latitude: 34.7229, longitude: 112.4556, address: '河南省洛阳市老城区西工一带美食集中区' },
    itinerary: [
      { time: '07:00', title: '早餐 · 牛肉汤', desc: '推荐"马坡"、"老洛阳"牛肉汤，配烧饼最地道。' },
      { time: '09:00', title: '不翻汤 + 锅贴', desc: '老城区十字街附近，酸辣开胃。' },
      { time: '12:00', title: '正宗洛阳水席', desc: '推荐"真不同饭店"，24 道菜一席，体验皇家宴席。' },
      { time: '15:00', title: '下午茶 · 浆面条 / 炒面', desc: '老洛阳人的午后快乐。' },
      { time: '19:00', title: '晚餐 · 特色烧烤', desc: '串烧 + 啤酒，洛阳夜晚的标配。' },
    ],
    tips: [
      '洛阳人爱喝汤，早餐以汤为主，推荐早市摊位。',
      '水席份量很大，多人分享更划算。',
      '注意"浆面条"味道独特，第一次可能吃不惯。',
      '夜市推荐老城区十字街、西工小街。',
    ],
    foods: ['洛阳牛肉汤', '不翻汤', '真不同水席', '浆面条', '锅贴', '炒凉粉', '牡丹饼'],
  },
};

const current = ref<GuideDetail>(GUIDES.g1);

function loadGuide(id: string) {
  const guide = GUIDES[id];
  if (guide) {
    current.value = guide;
    uni.setNavigationBarTitle({ title: guide.title }).catch(() => undefined);
  }
}

onLoad((opts: { id?: string }) => {
  if (opts?.id) loadGuide(opts.id);
});

function goBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/home/index' }) });
}

function goList() {
  uni.redirectTo({ url: '/pages/guide/list' });
}

function openNavigation() {
  const loc = current.value.location;
  uni.getLocation({
    type: 'gcj02',
    success: () => doOpen(),
    fail: () => {
      uni.showModal({
        title: '提示',
        content: '需要定位权限才能使用导航，是否继续直接打开地图？',
        success: (res) => {
          if (res.confirm) doOpen();
        },
      });
    },
  });
  const doOpen = () => {
    uni.openLocation({
      latitude: loc.latitude,
      longitude: loc.longitude,
      name: current.value.title,
      address: loc.address,
      fail: () => uni.showToast({ title: '打开地图失败', icon: 'none' }),
    });
  };
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.detail-page {
  padding-bottom: 180rpx;
  background: $paper-bg;
  min-height: 100vh;
}

.hero-wrap {
  position: relative;
  height: 560rpx;
}

.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 10, 10, 0.2) 0%, rgba(20, 10, 10, 0.1) 50%, rgba(250, 248, 245, 0.98) 100%);
}

.hero-nav {
  position: absolute;
  top: 60rpx;
  left: 32rpx;
  right: 32rpx;
  display: flex;
  justify-content: space-between;
}

.nav-btn {
  @include pressable;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  font-weight: 700;
  color: #fff8ec;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10rpx);
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.hero-title-box {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: 40rpx;
  color: #fff8ec;
}

.hero-title {
  font-size: 48rpx;
  font-weight: 800;
  letter-spacing: 4rpx;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  margin-top: 12rpx;
  font-size: 26rpx;
  opacity: 0.95;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.5);
}

.content-card {
  margin: -40rpx 32rpx 24rpx;
  padding: 28rpx 32rpx;
  background: #fffdf7;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(139, 30, 34, 0.08);
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  justify-content: space-between;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.meta-label {
  font-size: 22rpx;
  color: $ink-sub;
}

.meta-value {
  font-size: 26rpx;
  font-weight: 700;
  color: $ink-deep;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx dashed rgba(139, 30, 34, 0.15);
}

.tag {
  padding: 8rpx 20rpx;
  font-size: 22rpx;
  color: $shendu-red;
  background: rgba(139, 30, 34, 0.08);
  border-radius: 100rpx;
}

.section {
  margin: 0 32rpx 28rpx;
  padding: 28rpx 32rpx;
  background: #fffdf7;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 30, 34, 0.06);
}

.section-title {
  font-size: 30rpx;
  font-weight: 800;
  color: $ink-deep;
  letter-spacing: 2rpx;
}

.section-desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.9;
  color: $ink-body;
  text-align: justify;
}

.timeline {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.time-item {
  display: flex;
  gap: 24rpx;
}

.time-dot {
  flex-shrink: 0;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
  color: $shendu-red;
  background: rgba(139, 30, 34, 0.08);
  border: 2rpx solid $shendu-red;
  border-radius: 50%;
}

.time-content {
  flex: 1;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid rgba(139, 30, 34, 0.08);
}

.time-item:last-child .time-content {
  border-bottom: none;
}

.time-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $ink-deep;
}

.time-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: $ink-body;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 20rpx;
}

.tip-item {
  display: flex;
  gap: 18rpx;
  align-items: flex-start;
  font-size: 24rpx;
  line-height: 1.7;
  color: $ink-body;
}

.tip-num {
  flex-shrink: 0;
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 800;
  color: $gold-main;
  background: $gold-soft;
  border-radius: 12rpx;
}

.food-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 20rpx;
}

.food-chip {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: $ink-deep;
  background: rgba(197, 163, 97, 0.12);
  border: 1rpx solid rgba(197, 163, 97, 0.3);
  border-radius: 100rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx calc(env(safe-area-inset-bottom) + 24rpx);
  background: linear-gradient(180deg, rgba(250, 248, 245, 0) 0%, $paper-bg 40%);
  z-index: 20;
}

.btn-secondary {
  @include pressable;
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  color: $ink-deep;
  background: #fffdf7;
  border: 2rpx solid rgba(139, 30, 34, 0.2);
  border-radius: 48rpx;
  box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.05);
}

.btn-primary {
  @include pressable;
  flex: 2;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  color: #fff8ec;
  background: linear-gradient(135deg, $shendu-red 0%, $gold-main 100%);
  border-radius: 48rpx;
  box-shadow: 0 6rpx 20rpx rgba(139, 30, 34, 0.3);
}
</style>
