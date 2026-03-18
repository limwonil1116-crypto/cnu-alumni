// CNU 충남대학교 교색 시스템
export const CNU_COLORS = {
  primary: '#1B3F7B',      // 군청색 메인
  primaryDark: '#112B55',  // 진한 군청
  primaryMid: '#2A5BA8',   // 중간 파랑
  primaryLight: '#3B72D1', // 밝은 파랑
  accent: '#C8941A',       // 금색 포인트
  accentLight: '#F0BE50',
} as const;

// 학과 마스터 데이터
export const DEPARTMENTS = [
  { group: 'ㄱ', items: ['건축공학과', '경영학과', '경제학과', '고분자공학과', '국어국문학과', '국제학부'] },
  { group: 'ㄴ', items: ['농업경제학과', '농화학과'] },
  { group: 'ㄷ', items: ['독어독문학과', '디자인창의학과'] },
  { group: 'ㄹ', items: ['러시아어문학과'] },
  { group: 'ㅁ', items: ['문헌정보학과', '미술학과', '미디어커뮤니케이션학과'] },
  { group: 'ㅂ', items: ['법학과', '불어불문학과', '바이오시스템공학과'] },
  { group: 'ㅅ', items: ['사학과', '사회학과', '수학과', '수의학과', '심리학과', '신소재공학과'] },
  { group: 'ㅇ', items: ['언론정보학과', '영어영문학과', '의학과', '의생명과학과'] },
  { group: 'ㅈ', items: ['전기공학과', '전자공학과', '정보통신공학과', '정치외교학과', '조선해양공학과', '중어중문학과'] },
  { group: 'ㅊ', items: ['철학과', '체육학과', '컴퓨터공학과'] },
  { group: 'ㅎ', items: ['한국어교육과', '행정학과', '화학과', '화학공학과', '환경공학과'] },
] as const;

// 입학년도 범위
export const ADMISSION_YEAR_RANGE = {
  min: 1952,
  max: new Date().getFullYear(),
};

export const getAdmissionYears = () => {
  const years: number[] = [];
  for (let y = ADMISSION_YEAR_RANGE.max; y >= 1980; y--) years.push(y);
  return years;
};

// 상태 타입
export type AuthStatus = 'unverified' | 'active' | 'locked';
export type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type UploadRowStatus = 'valid' | 'duplicate' | 'error';
export type AdminRole = 'editor' | 'approver' | 'super_admin';
