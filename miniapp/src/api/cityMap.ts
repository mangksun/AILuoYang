// 城市地图 API
// 引入本地写死的图片映射，避免后端随机图（picsum.photos）每次编译/刷新都变
import { attractions as LOCAL_ATTRACTIONS, foods as LOCAL_FOODS, heritages as LOCAL_HERITAGES } from '@/data/cityData';

const BASE_URL = 'http://localhost:3000/api/miniapp/city-map';

// 建立 id -> images 的索引，O(1) 查表
const attractionImageMap: Record<string, string[]> = {};
for (const a of LOCAL_ATTRACTIONS) {
  if (a?.id && a.images?.length) attractionImageMap[a.id] = a.images;
}
const foodImageMap: Record<string, string[]> = {};
for (const f of LOCAL_FOODS) {
  if (f?.id && f.images?.length) foodImageMap[f.id] = f.images;
}
const heritageImageMap: Record<string, string[]> = {};
for (const h of LOCAL_HERITAGES) {
  if (h?.id && h.images?.length) heritageImageMap[h.id] = h.images;
}

function request<T>(url: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      success: (res: any) => {
        if (res.statusCode === 200 && res.data?.success) {
          resolve(res.data.data);
        } else {
          reject(res.data?.message || '请求失败');
        }
      },
      fail: (err: any) => reject(err.errMsg || '网络错误'),
    });
  });
}

function patchImages<T extends { id?: string; images?: string[] } | null>(
  item: T,
  map: Record<string, string[]>,
): T {
  if (!item || !item.id) return item;
  const localImages = map[item.id];
  if (!localImages?.length) return item;
  return { ...item, images: [...localImages] } as T;
}

function patchList<T extends { id?: string; images?: string[] }>(
  list: T[],
  map: Record<string, string[]>,
): T[] {
  if (!Array.isArray(list)) return list;
  return list.map((it) => patchImages(it, map));
}

// 景点
export async function getAttractions(category?: string) {
  const list = await request<any[]>(`/attractions${category ? `?category=${category}` : ''}`);
  return patchList(list, attractionImageMap);
}

export async function getAttractionDetail(id: string) {
  const item = await request<any>(`/attractions/${id}`);
  return patchImages(item, attractionImageMap);
}

// 美食
export async function getFoods(category?: string) {
  const list = await request<any[]>(`/foods${category ? `?category=${category}` : ''}`);
  return patchList(list, foodImageMap);
}

export async function getFoodDetail(id: string) {
  const item = await request<any>(`/foods/${id}`);
  return patchImages(item, foodImageMap);
}

// 非遗
export async function getHeritages() {
  const list = await request<any[]>('/heritages');
  return patchList(list, heritageImageMap);
}

// 天气
export function getWeather(lat: number, lon: number) {
  return request<any>(`/weather?lat=${lat}&lon=${lon}`);
}
