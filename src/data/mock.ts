import type { Alumni, AlumniListItem, AlumniDetail, ChangeRequest } from '@/types';

export const MOCK_ALUMNI: AlumniDetail[] = [
  {
    id: '1', name: '김민준', department: '경영학과', graduationYear: 2012, admissionYear: 2008,
    company: '카카오', jobTitle: '서비스 기획', region: '서울',
    phone: '010-****-1234', email: 'kim***@kakao.com',
    bio: '카카오에서 서비스 기획을 담당하고 있습니다. 반갑습니다!', photoUrl: undefined,
  },
  {
    id: '2', name: '이서연', department: '전기공학과', graduationYear: 2015, admissionYear: 2011,
    company: '삼성전자', jobTitle: '선임연구원', region: '수원',
    phone: '010-****-5678', email: 'lee***@samsung.com',
    bio: '반도체 연구개발을 담당합니다.', photoUrl: undefined,
  },
  {
    id: '3', name: '박지우', department: '정보통신공학과', graduationYear: 2018, admissionYear: 2014,
    company: '네이버', jobTitle: '백엔드 개발자', region: '성남',
    phone: '010-****-9012', email: 'park***@naver.com',
    bio: '서버 개발을 하고 있습니다.', photoUrl: undefined,
  },
  {
    id: '4', name: '최유진', department: '의학과', graduationYear: 2016, admissionYear: 2010,
    company: '서울대학교병원', jobTitle: '전공의', region: '서울',
    phone: '010-****-3456', email: 'choi***@snuh.org',
    bio: '내과 전공의로 근무 중입니다.', photoUrl: undefined,
  },
  {
    id: '5', name: '정수호', department: '법학과', graduationYear: 2013, admissionYear: 2008,
    company: '법무법인 태평양', jobTitle: '변호사', region: '서울',
    phone: '010-****-7890', email: 'jung***@bfl.co.kr',
    bio: '기업법무를 전문으로 합니다.', photoUrl: undefined,
  },
  {
    id: '6', name: '한소희', department: '경영학과', graduationYear: 2022, admissionYear: 2018,
    company: '현대자동차', jobTitle: '마케팅 담당', region: '서울',
    phone: '010-****-2345', email: 'han***@hyundai.com',
    bio: '마케팅팀에서 브랜드 전략을 담당합니다.', photoUrl: undefined,
  },
  {
    id: '7', name: '강태양', department: '수학과', graduationYear: 2019, admissionYear: 2015,
    company: '카카오뱅크', jobTitle: '데이터 분석가', region: '성남',
    phone: '010-****-6789', email: 'kang***@kakaobank.com',
    bio: '금융 데이터 분석을 담당합니다.', photoUrl: undefined,
  },
  {
    id: '8', name: '윤재원', department: '건축공학과', graduationYear: 2010, admissionYear: 2006,
    company: '삼성물산', jobTitle: '건축 설계', region: '대전',
    phone: '010-****-4321', email: 'yoon***@samsungct.com',
    bio: '대형 건축 프로젝트를 설계합니다.', photoUrl: undefined,
  },
];

export const MOCK_CHANGE_REQUESTS: ChangeRequest[] = [
  { id: 'cr1', alumniId: '7', alumniName: '홍길동', field: '연락처', oldValue: '010-1234-5678', newValue: '010-9999-8888', status: 'pending', requestedAt: '2026-03-16' },
  { id: 'cr2', alumniId: '2', alumniName: '김민준', field: '근무지', oldValue: '네이버', newValue: '카카오', status: 'pending', requestedAt: '2026-03-15' },
  { id: 'cr3', alumniId: '3', alumniName: '이서연', field: '이메일', oldValue: 'lee@old.com', newValue: 'lee@samsung.com', status: 'pending', requestedAt: '2026-03-14' },
];

export const MOCK_CURRENT_USER: AlumniDetail = {
  id: 'me', name: '홍길동', department: '국어국문학과', graduationYear: 2003, admissionYear: 1999,
  company: '충남대학교', jobTitle: '교수', region: '대전',
  phone: '010-1234-5678', email: 'hong@cnu.ac.kr',
  bio: '국어국문학과에서 연구하고 있습니다.', photoUrl: undefined,
};
