import { SubwayExitData } from '../types';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * @returns Distance in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Master Seoul Subway Station Exit dataset with daily ridership passenger traffic
 */
export const SEOUL_SUBWAY_STATION_EXITS: SubwayExitData[] = [
  { id: 'sub-201-11', stationName: '강남역', line: '2호선', exitNumber: '11번 출구', lat: 37.498085, lng: 127.027978, dailyRidership: 148500 },
  { id: 'sub-201-02', stationName: '강남역', line: '2호선', exitNumber: '2번 출구', lat: 37.497200, lng: 127.028100, dailyRidership: 148500 },
  { id: 'sub-201-01', stationName: '강남역', line: '2호선', exitNumber: '1번 출구', lat: 37.497500, lng: 127.028600, dailyRidership: 148500 },
  { id: 'sub-239-09', stationName: '홍대입구역', line: '2호선', exitNumber: '9번 출구', lat: 37.556852, lng: 126.923724, dailyRidership: 132000 },
  { id: 'sub-239-08', stationName: '홍대입구역', line: '2호선', exitNumber: '8번 출구', lat: 37.557800, lng: 126.924200, dailyRidership: 132000 },
  { id: 'sub-219-05', stationName: '삼성역', line: '2호선', exitNumber: '5,6번 출구', lat: 37.508808, lng: 127.063160, dailyRidership: 115000 },
  { id: 'sub-337-08', stationName: '신사역', line: '3호선', exitNumber: '8번 출구', lat: 37.516330, lng: 127.020350, dailyRidership: 78000 },
  { id: 'sub-337-01', stationName: '신사역', line: '3호선', exitNumber: '1번 출구', lat: 37.517200, lng: 127.021000, dailyRidership: 78000 },
  { id: 'sub-915-03', stationName: '여의도역', line: '9호선/5호선', exitNumber: '3번 출구', lat: 37.521620, lng: 126.924200, dailyRidership: 92400 },
  { id: 'sub-202-05', stationName: '을지로입구역', line: '2호선', exitNumber: '5번 출구', lat: 37.566000, lng: 126.982200, dailyRidership: 89000 },
  { id: 'sub-211-03', stationName: '성수역', line: '2호선', exitNumber: '3번 출구', lat: 37.544500, lng: 127.055900, dailyRidership: 96500 },
  { id: 'sub-216-02', stationName: '잠실역', line: '2호선/8호선', exitNumber: '2번 출구', lat: 37.513300, lng: 127.100100, dailyRidership: 156000 },
  { id: 'sub-533-05', stationName: '광화문역', line: '5호선', exitNumber: '5번 출구', lat: 37.569800, lng: 126.977100, dailyRidership: 104000 },
];

export interface NearestSubwayResult {
  stationName: string;
  line: string;
  exitNumber: string;
  distanceMeters: number;
  dailyRidership: number;
}

/**
 * Finds the nearest subway exit within a max radius (default 500m)
 */
export function findNearestSubwayExit(
  targetLat: number,
  targetLng: number,
  maxRadiusMeters: number = 500
): NearestSubwayResult | null {
  let minDistance = Infinity;
  let nearest: SubwayExitData | null = null;

  for (const exit of SEOUL_SUBWAY_STATION_EXITS) {
    const dist = calculateHaversineDistance(targetLat, targetLng, exit.lat, exit.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = exit;
    }
  }

  if (nearest && minDistance <= maxRadiusMeters) {
    return {
      stationName: nearest.stationName,
      line: nearest.line,
      exitNumber: nearest.exitNumber,
      distanceMeters: minDistance,
      dailyRidership: nearest.dailyRidership,
    };
  }

  return null;
}
