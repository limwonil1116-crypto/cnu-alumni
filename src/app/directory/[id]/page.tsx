'use client';
import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/uploadImage';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface AlumniDetail {
  id: string;
  name: string;
  department: string;
  admission_year?: number;
  graduation_year?: number;
  phone?: string;
  email?: string;
  company?: string;
  job_title?: string;
  region?: string;
  address?: string;
  bio?: string;
  photo_url?: string;
  card_image_url?: string;
  profile_id?: string;
  organization?: string;
  office_phone?: string;
  fax?: string;
  profile_email?: string;
}

const ORG_LIST = [
  '한국농어촌공사', '농림축산식품부', '충남도청',
  '세종특별자치시', '대전광역시',
  '천안시', '공주시', '보령시', '아산시', '서산시',
  '논산시', '계룡시', '당진시',
  '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군',
];

const ORG_LOGO: Record<string, string> = {
  '한국농어촌공사':  '/logos/krc.png',
  '농림축산식품부':  '/logos/mafra.png',
  '충남도청':        '/logos/chungnam.png',
  '세종특별자치시':  '/logos/sejong.png',
  '대전광역시':      '/logos/daejeon.png',
  '천안시':          '/logos/cheonan.png',
  '공주시':          '/logos/gongju.png',
  '보령시':          '/logos/boryeong.png',
  '아산시':          '/logos/asan.png',
  '서산시':          '/logos/seosan.png',
  '논산시':          '/logos/nonsan.png',
  '계룡시':          '/logos/gyeryong.png',
  '당진시':          '/logos/dangjin.png',
  '금산군':          '/logos/geumsan.png',
  '부여군':          '/logos/buyeo.png',
  '서천군':          '/logos/seocheon.png',
  '청양군':          '/logos/cheongyang.png',
  '홍성군':          '/logos/hongseong.png',
  '예산군':          '/logos/yesan.png',
  '태안군':          '/logos/taean.png',
};

const ORG_EMOJI: Record<string, string> = {
  '농림축산식품부': '🌾', '충남도청': '🏛',
  '세종특별자치시': '🌿', '대전광역시': '🌆',
  '천안시': '🏙', '공주시': '🏙', '보령시': '🏙', '아산시': '🏙',
  '서산시': '🏙', '논산시': '🏙', '계룡시': '🏙', '당진시': '🏙',
  '금산군': '🏘', '부여군': '🏘', '서천군': '🏘', '청양군': '🏘',
  '홍성군': '🏘', '예산군': '🏘', '태안군': '🏘',
};

const avatarColor = (name: string) => {
  const colors = [['#0d2d6e','#1a4ba8'],['#1a3a6e','#1e5fa8'],['#0d4d6e','#1a7aa8'],['#1a2d6e','#2a4ba8'],['#0d3d5e','#1a6090'],['#162850','#1e4080']];
  const c = colors[(name.charCodeAt(0)||0) % colors.length];
  return `linear-gradient(135deg, ${c[0]}, ${c[1]})`;
};

const F = { fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif" };

function saveContact(alumni: AlumniDetail) {
  const displayEmail = alumni.profile_email || alumni.email;
  const vcard = [
    'BEGIN:VCARD', 'VERSION:3.0',
    `FN:${alumni.name}`, `N:${alumni.name};;;`,
    alumni.phone ? `TEL;TYPE=CELL:${alumni.phone}` : '',
    alumni.office_phone ? `TEL;TYPE=WORK:${alumni.office_phone}` : '',
    alumni.fax ? `TEL;TYPE=FAX:${alumni.fax}` : '',
    alumni.company ? `ORG:${alumni.company}` : '',
    alumni.job_title ? `TITLE:${alumni.job_title}` : '',
    displayEmail ? `EMAIL:${displayEmail}` : '',
    alumni.department ? `NOTE:충남대학교 백마회 / ${alumni.department}` : 'NOTE:충남대학교 백마회',
    'END:VCARD',
  ].filter(Boolean).join('\n');
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${alumni.name}.vcf`; a.click();
  URL.revokeObjectURL(url);
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1024;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round((h / w) * MAX); w = MAX; }
          else { w = Math.round((w / h) * MAX); h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

async function extractCardInfo(file: File): Promise<{
  phone?: string; email?: string; address?: string;
  company?: string; job_title?: string;
  office_phone?: string; fax?: string;
}> {
  const imageBase64 = await compressImage(file);
  const res = await fetch('/api/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  if (!res.ok) throw new Error('API 오류');
  const data = await res.json();
  console.log('✨ Gemini 분석 결과:', data);
  return data;
}

export default function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [alumni, setAlumni] = useState<AlumniDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // 명함 편집 모달
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropSrc, setCropSrc] = useState('');
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // 프로필 사진 편집 모달
  const [showPhotoCropModal, setShowPhotoCropModal] = useState(false);
  const [photoCropSrc, setPhotoCropSrc] = useState('');
  const [photoCropFile, setPhotoCropFile] = useState<File | null>(null);
  const [photoCrop, setPhotoCrop] = useState<Crop>();
  const [photoCompletedCrop, setPhotoCompletedCrop] = useState<Crop>();
  const [photoRotation, setPhotoRotation] = useState(0);
  const photoImgRef = useRef<HTMLImageElement>(null);

  const photoRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLInputElement>(null);
  const cardCameraRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    company: '', job_title: '', region: '', address: '', bio: '',
    phone: '', email: '', office_phone: '', fax: '', profile_email: '',
    photo_url: '', card_image_url: '', organization: '한국농어촌공사',
  });

  const fetchData = async () => {
    const { data } = await supabase
      .from('alumni_master')
      .select('id, name, phone, email, admission_year, graduation_year, department_name, organization, alumni_profiles (id, company, job_title, region, address, bio, photo_url, card_image_url, office_phone, fax, email)')
      .eq('id', id)
      .single();
    if (data) {
      const p = (data as any).alumni_profiles?.[0];
      const detail: AlumniDetail = {
        id: data.id, name: data.name,
        department: (data as any).department_name || '',
        admission_year: data.admission_year,
        graduation_year: data.graduation_year,
        phone: data.phone,
        email: data.email,
        company: p?.company, job_title: p?.job_title,
        region: p?.region, address: p?.address,
        bio: p?.bio, photo_url: p?.photo_url,
        card_image_url: p?.card_image_url, profile_id: p?.id,
        organization: (data as any).organization || '한국농어촌공사',
        office_phone: p?.office_phone,
        fax: p?.fax,
        profile_email: p?.email,
      };
      setAlumni(detail);
      setForm({
        company: p?.company || '', job_title: p?.job_title || '',
        region: p?.region || '', address: p?.address || '',
        bio: p?.bio || '', phone: data.phone || '',
        email: data.email || '',
        office_phone: p?.office_phone || '',
        fax: p?.fax || '',
        profile_email: p?.email || '',
        photo_url: p?.photo_url || '', card_image_url: p?.card_image_url || '',
        organization: (data as any).organization || '한국농어촌공사',
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    showToast(label + ' 복사됨');
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoCropSrc(reader.result as string);
      setPhotoCropFile(file);
      setPhotoCrop(undefined);
      setPhotoCompletedCrop(undefined);
      setPhotoRotation(0);
      setShowPhotoCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const onPhotoImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const c = centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 1, width, height), width, height);
    setPhotoCrop(c);
  };

  const handlePhotoCropComplete = useCallback(async () => {
    if (!photoCropFile) return;
    let fileToUpload = photoCropFile;
    if (photoCompletedCrop && photoImgRef.current && photoCompletedCrop.width > 0 && photoCompletedCrop.height > 0) {
      const canvas = document.createElement('canvas');
      const img = photoImgRef.current;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      canvas.width = photoCompletedCrop.width * scaleX;
      canvas.height = photoCompletedCrop.height * scaleY;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (photoRotation !== 0) {
          const rad = (photoRotation * Math.PI) / 180;
          const cos = Math.abs(Math.cos(rad)); const sin = Math.abs(Math.sin(rad));
          canvas.width = canvas.height * sin + canvas.width * cos;
          canvas.height = canvas.height * cos + canvas.width * sin;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(rad);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }
        ctx.drawImage(img, photoCompletedCrop.x * scaleX, photoCompletedCrop.y * scaleY, photoCompletedCrop.width * scaleX, photoCompletedCrop.height * scaleY, 0, 0, photoCompletedCrop.width * scaleX, photoCompletedCrop.height * scaleY);
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.95));
        fileToUpload = new File([blob], photoCropFile.name, { type: 'image/jpeg' });
      }
    } else if (photoRotation !== 0) {
      const img = photoImgRef.current;
      if (img) {
        const canvas = document.createElement('canvas');
        const rad = (photoRotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad)); const sin = Math.abs(Math.sin(rad));
        canvas.width = img.naturalHeight * sin + img.naturalWidth * cos;
        canvas.height = img.naturalHeight * cos + img.naturalWidth * sin;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(rad);
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
          const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.95));
          fileToUpload = new File([blob], photoCropFile.name, { type: 'image/jpeg' });
        }
      }
    }
    setShowPhotoCropModal(false);
    setUploadingPhoto(true);
    showToast('사진 업로드 중...');
    const url = await uploadImage(fileToUpload, 'profiles');
    if (url) { setForm(f => ({ ...f, photo_url: url })); showToast('사진 업로드 완료'); }
    else showToast('업로드 실패');
    setUploadingPhoto(false);
  }, [photoCompletedCrop, photoCropFile, photoRotation]);

  const handleCardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string); setCropFile(file);
      setCrop(undefined); setCompletedCrop(undefined); setRotation(0);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height), width, height));
  };

  const handleCropComplete = useCallback(async () => {
    if (!cropFile) return;
    let fileToUpload = cropFile;
    if (completedCrop && imgRef.current && completedCrop.width > 0 && completedCrop.height > 0) {
      const canvas = document.createElement('canvas');
      const img = imgRef.current;
      const scaleX = img.naturalWidth / img.width; const scaleY = img.naturalHeight / img.height;
      canvas.width = completedCrop.width * scaleX; canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (rotation !== 0) {
          const rad = (rotation * Math.PI) / 180;
          const cos = Math.abs(Math.cos(rad)); const sin = Math.abs(Math.sin(rad));
          canvas.width = canvas.height * sin + canvas.width * cos;
          canvas.height = canvas.height * cos + canvas.width * sin;
          ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(rad);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }
        ctx.drawImage(img, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, completedCrop.width * scaleX, completedCrop.height * scaleY);
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.95));
        fileToUpload = new File([blob], cropFile.name, { type: 'image/jpeg' });
      }
    } else if (rotation !== 0) {
      const img = imgRef.current;
      if (img) {
        const canvas = document.createElement('canvas');
        const rad = (rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad)); const sin = Math.abs(Math.sin(rad));
        canvas.width = img.naturalHeight * sin + img.naturalWidth * cos;
        canvas.height = img.naturalHeight * cos + img.naturalWidth * sin;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(rad);
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
          const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.95));
          fileToUpload = new File([blob], cropFile.name, { type: 'image/jpeg' });
        }
      }
    }
    setShowCropModal(false);
    await handleCardUploadWithFile(fileToUpload);
  }, [completedCrop, cropFile, rotation]);

  const handleCardUploadWithFile = async (file: File) => {
    setUploadingCard(true); setExtracting(true);
    showToast('명함 업로드 및 AI 분석 중...');
    try {
      const [url, info] = await Promise.all([uploadImage(file, 'cards'), extractCardInfo(file)]);
      if (!url) { showToast('업로드 실패'); return; }
      setForm(prev => ({
        ...prev, card_image_url: url,
        company:       info.company      ? info.company      : prev.company,
        job_title:     info.job_title    ? info.job_title    : prev.job_title,
        phone:         info.phone        ? info.phone        : prev.phone,
        office_phone:  info.office_phone ? info.office_phone : prev.office_phone,
        fax:           info.fax          ? info.fax          : prev.fax,
        profile_email: info.email        ? info.email        : prev.profile_email,
        address:       info.address      ? info.address      : prev.address,
      }));
      const changed: string[] = [];
      if (info.company) changed.push('부서'); if (info.job_title) changed.push('직책');
      if (info.phone) changed.push('전화번호'); if (info.office_phone) changed.push('사무실전화');
      if (info.fax) changed.push('FAX'); if (info.email) changed.push('이메일');
      if (info.address) changed.push('주소');
      if (info.phone) await supabase.from('alumni_master').update({ phone: info.phone }).eq('id', id);
      const { data: existingProfile } = await supabase.from('alumni_profiles').select('id').eq('alumni_id', id).single();
      const profileData = {
        ...(info.company ? { company: info.company } : {}),
        ...(info.job_title ? { job_title: info.job_title } : {}),
        ...(info.address ? { address: info.address } : {}),
        ...(info.office_phone ? { office_phone: info.office_phone } : {}),
        ...(info.fax ? { fax: info.fax } : {}),
        ...(info.email ? { email: info.email } : {}),
        card_image_url: url,
      };
      if (existingProfile) {
        await supabase.from('alumni_profiles').update(profileData).eq('id', existingProfile.id);
      } else {
        await supabase.from('alumni_profiles').insert({ alumni_id: id, company: info.company || null, job_title: info.job_title || null, address: info.address || null, card_image_url: url, office_phone: info.office_phone || null, fax: info.fax || null, email: info.email || null });
      }
      await fetchData();
      if (changed.length > 0) showToast(`✨ AI가 ${changed.join(', ')}을(를) 자동 저장했어요!`);
      else showToast('명함 등록 완료! 정보가 없으면 직접 입력해주세요.');
    } catch {
      showToast('AI 분석 실패 - 직접 입력 후 저장해주세요');
    } finally {
      setUploadingCard(false); setExtracting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('alumni_master').update({ phone: form.phone || null, organization: form.organization }).eq('id', id);
    const { data: existingProfile } = await supabase.from('alumni_profiles').select('id').eq('alumni_id', id).single();
    if (existingProfile) {
      await supabase.from('alumni_profiles').update({ company: form.company || null, job_title: form.job_title || null, region: form.region || null, address: form.address || null, bio: form.bio || null, photo_url: form.photo_url || null, card_image_url: form.card_image_url || null, office_phone: form.office_phone || null, fax: form.fax || null, email: form.profile_email || null }).eq('id', existingProfile.id);
    } else {
      await supabase.from('alumni_profiles').insert({ alumni_id: id, company: form.company || null, job_title: form.job_title || null, region: form.region || null, address: form.address || null, bio: form.bio || null, photo_url: form.photo_url || null, card_image_url: form.card_image_url || null, office_phone: form.office_phone || null, fax: form.fax || null, email: form.profile_email || null });
    }
    await fetchData();
    setSaving(false); setEditMode(false);
    showToast('저장되었습니다');
  };

  const handleSaveContact = () => {
    if (!alumni) return;
    saveContact(alumni);
    setContactSaved(true);
    showToast('연락처를 저장합니다');
    setTimeout(() => setContactSaved(false), 2500);
  };

  const openMap = (type: 'kakao' | 'naver' | 'kakaonavi' | 'tmap') => {
    if (!alumni?.address) return;
    const addr = encodeURIComponent(alumni.address);
    if (type === 'kakao') {
      window.location.href = `kakaomap://search?q=${addr}`;
      setTimeout(() => window.open(`https://map.kakao.com/link/search/${addr}`, '_blank'), 1500);
    } else if (type === 'naver') {
      window.location.href = `nmap://search?query=${addr}&appname=com.cnu.alumni`;
      setTimeout(() => window.open(`https://map.naver.com/v5/search/${addr}`, '_blank'), 1500);
    } else if (type === 'kakaonavi') {
      window.location.href = `kakaonavi://navigate?destination[name]=${addr}&destination[search_keyword]=${addr}`;
      setTimeout(() => window.open(`https://map.kakao.com/link/search/${addr}`, '_blank'), 1500);
    } else if (type === 'tmap') {
      window.location.href = `tmap://search?name=${addr}`;
      setTimeout(() => window.open(`https://www.google.com/maps/search/?api=1&query=${addr}`, '_blank'), 1500);
    }
  };

  if (loading) return (
    <div style={{ ...F, minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4f8' }}>
      <div style={{ width:32, height:32, border:'3px solid #e2e8f0', borderTop:'3px solid #1B3F7B', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!alumni) return (
    <div style={{ ...F, minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <p style={{ fontSize:16, fontWeight:600, marginBottom:12 }}>프로필을 찾을 수 없습니다</p>
      <button onClick={() => router.back()} style={{ color:'#1B3F7B', background:'none', border:'none', fontSize:14, cursor:'pointer' }}>돌아가기</button>
    </div>
  );

  const bar = <div style={{ width:4, height:16, background:'#1B3F7B', borderRadius:2 }} />;
  const org = alumni.organization || '한국농어촌공사';
  const displayEmail = alumni.profile_email || alumni.email;

  const fieldRows = [
    { label:'부서', key:'company', placeholder:'충남지역본부 기반사업부' },
    { label:'직무/직책', key:'job_title', placeholder:'과장' },
    { label:'지역', key:'region', placeholder:'충남' },
    { label:'주소 (지도 표시용)', key:'address', placeholder:'충청남도 홍성군 홍북읍 충남대로 60' },
    { label:'휴대폰', key:'phone', placeholder:'010-1234-5678' },
    { label:'사무실 전화', key:'office_phone', placeholder:'041-000-0000' },
    { label:'FAX', key:'fax', placeholder:'041-000-0001' },
    { label:'이메일 (명함)', key:'profile_email', placeholder:'example@ekr.or.kr' },
  ];

  const OrgBadge = ({ height = 14 }: { height?: number }) => (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      {ORG_LOGO[org] ? (
        <img src={ORG_LOGO[org]} alt={org} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} style={{ height, width:'auto', objectFit:'contain' }} />
      ) : ORG_EMOJI[org] ? <span style={{ fontSize: height }}>{ORG_EMOJI[org]}</span> : null}
      <span style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>{org}</span>
    </div>
  );

  return (
    <div style={{ ...F, minHeight:'100dvh', display:'flex', flexDirection:'column', background:'#f0f4f8' }}>

      {/* ── 헤더 ── */}
      <div style={{ background:'linear-gradient(135deg, #0d2d6e 0%, #1B3F7B 60%, #1a5276 100%)', boxShadow:'0 2px 12px rgba(13,45,110,0.3)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px' }}>
          <button onClick={() => router.back()} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span style={{ color:'#fff', fontSize:16, fontWeight:700 }}>동문 프로필</span>
          <button onClick={() => editMode ? handleSave() : setEditMode(true)} disabled={saving}
            style={{ background: editMode ? '#fff' : 'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'7px 16px', color: editMode ? '#1B3F7B' : '#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            {saving ? '저장중...' : editMode ? '저장' : '수정'}
          </button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 16px 20px' }}>
          <div style={{ position:'relative', marginBottom:14 }}>
            <div style={{ width:96, height:96, borderRadius:20, background:avatarColor(alumni.name), border:'3px solid rgba(255,255,255,0.4)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(0,0,0,0.3)' }}>
              {(editMode ? form.photo_url : alumni.photo_url) ? (
                <img src={editMode ? form.photo_url : alumni.photo_url!} alt={alumni.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <span style={{ color:'#fff', fontSize:38, fontWeight:800 }}>{alumni.name.charAt(0)}</span>
              )}
            </div>
            {editMode && (
              <button onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}
                style={{ position:'absolute', bottom:-6, right:-6, width:28, height:28, borderRadius:'50%', background:'#fff', border:'2px solid #1B3F7B', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14, color:'#1B3F7B', fontWeight:700 }}>
                {uploadingPhoto ? '·' : '+'}
              </button>
            )}
          </div>
          <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoSelect} />
          <h2 style={{ color:'#fff', fontSize:22, fontWeight:800, marginBottom:4 }}>{alumni.name}</h2>
          {alumni.job_title && <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13, marginBottom:2 }}>{alumni.job_title}</p>}
          {alumni.company && <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12 }}>{alumni.company}</p>}
        </div>
        <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap', padding:'0 16px 14px' }}>
          {alumni.admission_year && (
            <span style={{ background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:11, padding:'4px 14px', borderRadius:20, border:'1px solid rgba(255,255,255,0.2)' }}>입학 {alumni.admission_year}년</span>
          )}
          {alumni.department && (
            <span style={{ background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:11, padding:'4px 14px', borderRadius:20, border:'1px solid rgba(255,255,255,0.2)' }}>{alumni.department}</span>
          )}
          <span style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:11, padding:'4px 10px', borderRadius:20, border:'1px solid rgba(255,255,255,0.2)' }}>
            {ORG_LOGO[org] ? <img src={ORG_LOGO[org]} alt={org} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} style={{ height:14, width:'auto', objectFit:'contain' }} /> : ORG_EMOJI[org] ? <span>{ORG_EMOJI[org]}</span> : null}
            {org}
          </span>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'14px 14px 40px' }}>

        {editMode && (
          <>
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'10px 14px', marginBottom:8, fontSize:13, color:'#1B3F7B' }}>
              ✏️ 수정 모드 — 정보를 수정하고 저장 버튼을 눌러주세요
            </div>
            <div style={{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe)', border:'1px solid #c4b5fd', borderRadius:12, padding:'12px 14px', marginBottom:12, display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ fontSize:22, flexShrink:0 }}>✨</span>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#5b21b6', marginBottom:3 }}>AI 명함 자동입력 기능</p>
                <p style={{ fontSize:12, color:'#7c3aed', lineHeight:1.7 }}>아래 명함 카드에서 📷 촬영 또는 🖼 갤러리로 등록하면<br/>편집(자르기·회전) 후 AI가 자동으로 정보를 저장해드려요!</p>
              </div>
            </div>
          </>
        )}

        {extracting && (
          <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:12, padding:'12px 14px', marginBottom:12, fontSize:13, color:'#15803d', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:16, height:16, border:'2px solid #86efac', borderTop:'2px solid #15803d', borderRadius:'50%', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
            ✨ AI가 명함에서 정보를 분석 중입니다...
          </div>
        )}

        {/* ── 연락처 저장 + 연락 버튼 ── */}
        {!editMode && (alumni.phone || displayEmail) && (
          <div style={{ background:'#fff', borderRadius:16, padding:'14px 16px', marginBottom:10, boxShadow:'0 1px 4px rgba(13,45,110,0.07)', border:'1px solid #e2e8f0' }}>
            {alumni.phone && (
              <button onClick={handleSaveContact}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background: contactSaved ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'linear-gradient(135deg,#0d2d6e,#1B3F7B)', border:'none', borderRadius:12, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginBottom:10, boxShadow:'0 3px 10px rgba(13,45,110,0.25)', transition:'all 0.2s' }}>
                {contactSaved ? <><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>연락처 저장 완료!</> : <><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>연락처 저장하기</>}
              </button>
            )}
            <div style={{ display:'flex', gap:8 }}>
              {alumni.phone && (
                <a href={'tel:' + alumni.phone} style={{ flex:1, background:'#eff6ff', color:'#1B3F7B', borderRadius:10, padding:'10px', textAlign:'center', fontSize:13, fontWeight:700, textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>전화
                </a>
              )}
              {alumni.phone && (
                <a href={'sms:' + alumni.phone} style={{ flex:1, background:'#f8fafc', color:'#475569', borderRadius:10, padding:'10px', textAlign:'center', fontSize:13, fontWeight:700, textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>문자
                </a>
              )}
              {displayEmail && (
                <a href={'mailto:' + displayEmail} style={{ flex:1, background:'#f8fafc', color:'#475569', borderRadius:10, padding:'10px', textAlign:'center', fontSize:13, fontWeight:700, textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>메일
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── 소속 카드 ── */}
        <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:10, boxShadow:'0 1px 4px rgba(13,45,110,0.07)', border:'1px solid #e2e8f0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>{bar}<span style={{ fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:1.5, textTransform:'uppercase' as const }}>소속</span></div>
          {editMode ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div>
                <p style={{ fontSize:11, color:'#94a3b8', marginBottom:3 }}>소속 기관</p>
                <div style={{ position:'relative' }}>
                  <select value={form.organization} onChange={e => setForm(prev => ({ ...prev, organization: e.target.value }))}
                    style={{ width:'100%', padding:'9px 36px 9px 12px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit', appearance:'none', WebkitAppearance:'none', background:'#fff', color:'#0f172a', cursor:'pointer' } as React.CSSProperties}>
                    {ORG_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                    <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              {fieldRows.map(f => (
                <div key={f.key}>
                  <p style={{ fontSize:11, color:'#94a3b8', marginBottom:3 }}>{f.label}</p>
                  <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder} type={f.key === 'profile_email' ? 'email' : 'text'}
                    style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, outline:'none', boxSizing:'border-box' as const, fontFamily:'inherit' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid #f1f5f9' }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:10, color:'#94a3b8', marginBottom:4 }}>소속 기관</p>
                  <OrgBadge height={18} />
                </div>
              </div>
              {alumni.company && <InfoRow label="부서" value={alumni.company} />}
              {alumni.job_title && <InfoRow label="직무/직책" value={alumni.job_title} />}
              {alumni.phone && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid #f1f5f9' }}>
                  <div><p style={{ fontSize:10, color:'#94a3b8', marginBottom:2 }}>휴대폰</p><p style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>{alumni.phone}</p></div>
                  <button onClick={() => copy(alumni.phone!, '휴대폰')} style={{ background:'#eff6ff', border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, color:'#1B3F7B', fontWeight:600, cursor:'pointer' }}>복사</button>
                </div>
              )}
              {alumni.office_phone && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid #f1f5f9' }}>
                  <div><p style={{ fontSize:10, color:'#94a3b8', marginBottom:2 }}>사무실 전화</p><p style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>{alumni.office_phone}</p></div>
                  <button onClick={() => copy(alumni.office_phone!, '사무실 전화')} style={{ background:'#eff6ff', border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, color:'#1B3F7B', fontWeight:600, cursor:'pointer' }}>복사</button>
                </div>
              )}
              {alumni.fax && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid #f1f5f9' }}>
                  <div><p style={{ fontSize:10, color:'#94a3b8', marginBottom:2 }}>FAX</p><p style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>{alumni.fax}</p></div>
                  <button onClick={() => copy(alumni.fax!, 'FAX')} style={{ background:'#eff6ff', border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, color:'#1B3F7B', fontWeight:600, cursor:'pointer' }}>복사</button>
                </div>
              )}
              {displayEmail && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid #f1f5f9' }}>
                  <div><p style={{ fontSize:10, color:'#94a3b8', marginBottom:2 }}>이메일{alumni.profile_email ? ' (명함)' : ''}</p><p style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>{displayEmail}</p></div>
                  <button onClick={() => copy(displayEmail, '이메일')} style={{ background:'#eff6ff', border:'none', borderRadius:8, padding:'5px 12px', fontSize:11, color:'#1B3F7B', fontWeight:600, cursor:'pointer' }}>복사</button>
                </div>
              )}
              {alumni.region && <InfoRow label="지역" value={'📍 ' + alumni.region} />}
              {alumni.address && <InfoRow label="주소" value={alumni.address} last />}
            </>
          )}
        </div>

        {/* ── 학력 카드 ── */}
        <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:10, boxShadow:'0 1px 4px rgba(13,45,110,0.07)', border:'1px solid #e2e8f0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>{bar}<span style={{ fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:1.5, textTransform:'uppercase' as const }}>학력</span></div>
          {[
            { label:'학과', value: alumni.department },
            { label:'입학년도', value: alumni.admission_year ? alumni.admission_year + '년' : undefined },
            { label:'졸업년도', value: alumni.graduation_year ? alumni.graduation_year + '년' : undefined },
          ].filter(r => r.value).map((r, i, arr) => (
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i < arr.length-1 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize:13, color:'#64748b' }}>{r.label}</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* ── 소개 카드 ── */}
        <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:10, boxShadow:'0 1px 4px rgba(13,45,110,0.07)', border:'1px solid #e2e8f0' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>{bar}<span style={{ fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:1.5, textTransform:'uppercase' as const }}>소개</span></div>
          {editMode ? (
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="간단한 소개를 입력해 주세요" rows={3}
              style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, outline:'none', resize:'none', boxSizing:'border-box' as const, fontFamily:'inherit' }} />
          ) : (
            <p style={{ fontSize:13, color: alumni.bio ? '#475569' : '#cbd5e1', lineHeight:1.8 }}>{alumni.bio || '수정 버튼을 눌러 소개를 추가해주세요'}</p>
          )}
        </div>

        {/* ── 명함 카드 ── */}
        <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:10, boxShadow:'0 1px 4px rgba(13,45,110,0.07)', border:'1px solid #e2e8f0' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>{bar}<span style={{ fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:1.5, textTransform:'uppercase' as const }}>명함</span></div>
            {editMode && (
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => cardCameraRef.current?.click()} disabled={uploadingCard || extracting}
                  style={{ background:'linear-gradient(135deg,#7c3aed,#5b21b6)', border:'none', borderRadius:8, padding:'6px 10px', fontSize:12, color:'#fff', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  {uploadingCard || extracting ? '⏳' : '📷 촬영'}
                </button>
                <button onClick={() => cardRef.current?.click()} disabled={uploadingCard || extracting}
                  style={{ background:'linear-gradient(135deg,#7c3aed,#5b21b6)', border:'none', borderRadius:8, padding:'6px 10px', fontSize:12, color:'#fff', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  {uploadingCard || extracting ? '⏳' : '🖼 갤러리'}
                </button>
              </div>
            )}
          </div>
          <input ref={cardRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleCardFileSelect} />
          <input ref={cardCameraRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={handleCardFileSelect} />
          {(editMode ? form.card_image_url : alumni.card_image_url) ? (
            <img src={editMode ? form.card_image_url : alumni.card_image_url!} alt="명함"
              onClick={() => !editMode && setShowCard(true)}
              style={{ width:'100%', borderRadius:10, border:'1px solid #e2e8f0', cursor: editMode ? 'default' : 'pointer', display:'block' }} />
          ) : (
            <div style={{ background:'#f8fafc', border:'2px dashed #e2e8f0', borderRadius:12, padding:'28px', textAlign:'center' }}>
              <p style={{ fontSize:13, color:'#94a3b8' }}>
                {editMode ? '📷 촬영 또는 🖼 갤러리로 명함을 등록하세요\n편집 후 AI가 자동으로 정보를 저장해드려요!' : '등록된 명함이 없습니다'}
              </p>
            </div>
          )}
        </div>

        {/* ── 위치 카드 - 처음부터 지도 표시 ── */}
        {!editMode && alumni.address && (
          <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:10, boxShadow:'0 1px 4px rgba(13,45,110,0.07)', border:'1px solid #e2e8f0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              {bar}<span style={{ fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:1.5, textTransform:'uppercase' as const }}>위치</span>
            </div>
            <p style={{ fontSize:12, color:'#64748b', marginBottom:12 }}>📍 {alumni.address}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
              <button onClick={() => openMap('kakao')} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'#FEE500', border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, color:'#191919', cursor:'pointer', fontFamily:'inherit' }}>🗺 카카오맵</button>
              <button onClick={() => openMap('naver')} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'#03C75A', border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit' }}>🧭 네이버맵</button>
              <button onClick={() => openMap('kakaonavi')} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'#FF6B35', border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit' }}>🚗 카카오내비</button>
              <button onClick={() => openMap('tmap')} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'#1B6AE4', border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit' }}>📡 T맵</button>
            </div>
            {/* 처음부터 지도 표시 (구글맵 공식 임베드 주소 - 빨간 마커 완벽 적용) */}
            <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid #e2e8f0' }}>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(alumni.address)}&output=embed&z=16`}
                width="100%"
                height="220"
                style={{ border:'none', display:'block' }}
                title="위치 지도 미리보기"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {editMode && (
          <button onClick={() => {
            setEditMode(false);
            setForm({
              company: alumni.company||'', job_title: alumni.job_title||'',
              region: alumni.region||'', address: alumni.address||'',
              bio: alumni.bio||'', phone: alumni.phone||'',
              email: alumni.email||'', office_phone: alumni.office_phone||'',
              fax: alumni.fax||'', profile_email: alumni.profile_email||'',
              photo_url: alumni.photo_url||'', card_image_url: alumni.card_image_url||'',
              organization: alumni.organization||'한국농어촌공사'
            });
          }}
            style={{ width:'100%', padding:'14px', background:'#f1f5f9', border:'none', borderRadius:12, fontSize:14, fontWeight:600, color:'#64748b', cursor:'pointer', marginBottom:10, fontFamily:'inherit' }}>
            취소
          </button>
        )}
      </div>

      {/* ── AI 분석 로딩 오버레이 ── */}
      {extracting && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>
          <div style={{ background:'#fff', borderRadius:24, padding:'32px 28px', textAlign:'center', maxWidth:280, width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize:40, marginBottom:16 }}>{'⏳'}</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:12 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#7c3aed', animation:'dot1 1.2s ease-in-out infinite' }} />
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#7c3aed', animation:'dot1 1.2s ease-in-out infinite 0.2s' }} />
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#7c3aed', animation:'dot1 1.2s ease-in-out infinite 0.4s' }} />
              <style>{`@keyframes dot1{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
            </div>
            <p style={{ fontSize:16, fontWeight:800, color:'#0f172a', marginBottom:6 }}>AI 명함 분석 중</p>
            <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7 }}>Gemini AI가 명함에서<br/>정보를 추출하고 있어요<br/><span style={{ fontSize:11, color:'#94a3b8' }}>잠시만 기다려주세요...</span></p>
          </div>
        </div>
      )}

      {/* ── 프로필 사진 편집 모달 ── */}
      {showPhotoCropModal && photoCropSrc && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:16, fontFamily:'inherit' }}>
          <p style={{ color:'#fff', fontSize:15, fontWeight:700, marginBottom:4 }}>프로필 사진 편집</p>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:11, marginBottom:12 }}>드래그로 자르기 영역 선택 · 회전 버튼으로 방향 조정</p>
          <div style={{ maxWidth:380, width:'100%', maxHeight:'55vh', overflow:'auto', marginBottom:16, borderRadius:12 }}>
            <ReactCrop crop={photoCrop} onChange={(c: Crop) => setPhotoCrop(c)} onComplete={(c: Crop) => setPhotoCompletedCrop(c)}>
              <img ref={photoImgRef} src={photoCropSrc} onLoad={onPhotoImageLoad} style={{ maxWidth:'100%', transform:`rotate(${photoRotation}deg)`, transition:'transform 0.25s', display:'block' }} />
            </ReactCrop>
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={() => setPhotoRotation(r => (r + 90) % 360)} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:10, padding:'9px 16px', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>🔄 90° 회전</button>
            <button onClick={handlePhotoCropComplete} disabled={uploadingPhoto} style={{ background:'#1B3F7B', border:'none', borderRadius:10, padding:'9px 20px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity: uploadingPhoto ? 0.7 : 1 }}>
              {uploadingPhoto ? '⏳ 업로드중...' : '✅ 완료'}
            </button>
            <button onClick={() => { setShowPhotoCropModal(false); setPhotoCropSrc(''); }} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'9px 16px', color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>취소</button>
          </div>
        </div>
      )}

      {/* ── 명함 편집 모달 ── */}
      {showCropModal && cropSrc && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:16, fontFamily:'inherit' }}>
          <p style={{ color:'#fff', fontSize:15, fontWeight:700, marginBottom:4 }}>명함 편집</p>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:11, marginBottom:12 }}>드래그로 자르기 영역 선택 · 회전 버튼으로 방향 조정</p>
          <div style={{ maxWidth:380, width:'100%', maxHeight:'55vh', overflow:'auto', marginBottom:16, borderRadius:12 }}>
            <ReactCrop crop={crop} onChange={(c: Crop) => setCrop(c)} onComplete={(c: Crop) => setCompletedCrop(c)}>
              <img ref={imgRef} src={cropSrc} onLoad={onImageLoad} style={{ maxWidth:'100%', transform:`rotate(${rotation}deg)`, transition:'transform 0.25s', display:'block' }} />
            </ReactCrop>
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={() => setRotation(r => (r + 90) % 360)} style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:10, padding:'9px 16px', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>🔄 90° 회전</button>
            <button onClick={handleCropComplete} disabled={uploadingCard || extracting} style={{ background:'#7c3aed', border:'none', borderRadius:10, padding:'9px 20px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity: uploadingCard || extracting ? 0.7 : 1 }}>
              {uploadingCard || extracting ? '⏳ 분석중...' : '✅ 완료 및 AI 분석'}
            </button>
            <button onClick={() => { setShowCropModal(false); setCropSrc(''); }} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'9px 16px', color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>취소</button>
          </div>
        </div>
      )}

      {showCard && alumni.card_image_url && (
        <div onClick={() => setShowCard(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:24 }}>
          <img src={alumni.card_image_url} alt="명함" style={{ width:'100%', maxWidth:380, borderRadius:16 }} />
        </div>
      )}

      {toast && (
        <div style={{ position:'fixed', bottom:30, left:'50%', transform:'translateX(-50%)', background:'#0f172a', color:'#fff', padding:'10px 22px', borderRadius:50, fontSize:13, fontWeight:500, zIndex:50, whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ padding:'6px 0', borderBottom: last ? 'none' : '1px solid #f1f5f9' }}>
      <p style={{ fontSize:10, color:'#94a3b8', marginBottom:2 }}>{label}</p>
      <p style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>{value}</p>
    </div>
  );
}