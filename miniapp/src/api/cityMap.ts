// 城市地图 API
const BASE_URL = 'http://localhost:3000/api/miniapp/city-map';

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

// 景点
export function getAttractions(category?: string) {
  return request<any[]>(`/attractions${category ? `?category=${category}` : ''}`);
}

export function getAttractionDetail(id: string) {
  return request<any>(`/attractions/${id}`);
}

// 美食
export function getFoods(category?: string) {
  return request<any[]>(`/foods${category ? `?category=${category}` : ''}`);
}

export function getFoodDetail(id: string) {
  return request<any>(`/foods/${id}`);
}

// 非遗
export function getHeritages() {
  return request<any[]>('/heritages');
}

// 天气
export function getWeather(lat: number, lon: number) {
  return request<any>(`/weather?lat=${lat}&lon=${lon}`);
}
