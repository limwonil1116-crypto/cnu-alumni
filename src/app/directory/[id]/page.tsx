'use client';
import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/uploadImage';

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
}

const avatarColor = (name: string) => {
  const colors = [['#1B63C6','#3B82F6'],['#7C3AED','#A78BFA'],['#059669','#34D399'],['#DC2626','#F87171'],['#D97706','#FBBF24'],['#0891B2','#22D3EE']];
  const c = colors[(name.charCodeAt(0)||0) % colors.length];
  return 'linear-gradient(135deg,' + c[0] + ',' + c[1] + ')';
};

const F = { fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif" };

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
  const photoRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    company: '', job_title: '', region: '', address: '', bio: '', phone: '',
    photo_url: '', card_image_url: '',
  });

  const fetchData = async () => {
    const { data } = await supabase
      .from('alumni_master')
      .select('id, name, phone, email, admission_year, graduation_year, department_name, alumni_profiles (id, company, job_title, region, address, bio, photo_url, card_image_url)')
      .eq('id', id)
      .single();

    if (data) {
      const p = (data as any).alumni_profiles?.[0];
      const detail: AlumniDetail = {
        id: data.id,
        name: data.name,
        department: (data as any).department_name || '',
        admission_year: data.admission_year,
        graduation_year: data.graduation_year,
        phone: data.phone,
        email: data.email,
        company: p?.company,
        job_title: p?.job_title,
        region: p?.region,
        address: p?.address,
        bio: p?.bio,
        photo_url: p?.photo_url,
        card_image_url: p?.card_image_url,
        profile_id: p?.id,
      };
      setAlumni(detail);
      setForm({
        company: p?.company || '',
        job_title: p?.job_title || '',
        region: p?.region || '',
        address: p?.address || '',
        bio: p?.bio || '',
        phone: data.phone || '',
        photo_url: p?.photo_url || '',
        card_image_url: p?.card_image_url || '',
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    showToast(label + ' 복사됨');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const url = await uploadImage(file, 'profiles');
    if (url) { setForm(f => ({ ...f, photo_url: url })); showToast('사진 업로드 완료'); }
    else showToast('업로드 실패');
    setUploadingPhoto(false);
  };

  const handleCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCard(true);
    const url = await uploadImage(file, 'cards');
    if (url) { setForm(f => ({ ...f, card_image_url: url })); showToast('명함 업로드 완료'); }
    else showToast('업로드 실패');
    setUploadingCard(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('alumni_master').update({ phone: form.phone || null }).eq('id', id);
    if (alumni?.profile_id) {
      await supabase.from('alumni_profiles').update({
        company: form.company || null,
        job_title: form.job_title || null,
        region: form.region || null,
        address: form.address || null,
        bio: form.bio || null,
        photo_url: form.photo_url || null,
        card_image_url: form.card_image_url || null,
      }).eq('id', alumni.profile_id);
    } else {
      await supabase.from('alumni_profiles').insert({
        alumni_id: id,
        company: form.company || null,
        job_title: form.job_title || null,
        region: form.region || null,
        address: form.address || null,
        bio: form.bio || null,
        photo_url: form.photo_url || null,
        card_image_url: form.card_image_url || null,
      });
    }
    await fetchData();
    setSaving(false);
    setEditMode(false);
    showToast('저장되었습니다');
  };

  if (loading) return (
    <div style={{ ...F, minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, border:'4px solid #E5E7EB', borderTop:'4px solid #1B63C6', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!alumni) return (
    <div style={{ ...F, minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <p style={{ fontSize:16, fontWeight:600, marginBottom:12 }}>프로필을 찾을 수 없습니다</p>
      <button onClick={() => router.back()} style={{ color:'#1B63C6', background:'none', border:'none', fontSize:14, cursor:'pointer' }}>돌아가기</button>
    </div>
  );

  const bar = <div style={{ width:4, height:16, background:'#1B63C6', borderRadius:2 }} />;

  const fieldRows = [
    { label:'회사명', key:'company', placeholder:'한국농어촌공사' },
    { label:'직무/직책', key:'job_title', placeholder:'사원' },
    { label:'지역', key:'region', placeholder:'충남' },
    { label:'주소 (지도 표시용)', key:'address', placeholder:'대전광역시 서구 대덕대로 290번길 27' },
    { label:'휴대폰', key:'phone', placeholder:'01047581293' },
  ];

  return (
    <div style={{ ...F, minHeight:'100dvh', display:'flex', flexDirection:'column', background:'#F5F7FA' }}>

      {/* 헤더 */}
      <div style={{ background:'#1B63C6', padding:'16px 16px 0' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <button onClick={() => router.back()} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', fontSize:18 }}>{'<'}</button>
          <span style={{ color:'#fff', fontSize:16, fontWeight:700 }}>앨범</span>
          <button onClick={() => editMode ? handleSave() : setEditMode(true)} disabled={saving} style={{ background: editMode ? '#fff' : 'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'6px 14px', color: editMode ? '#1B63C6' : '#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            {saving ? '저장중...' : editMode ? '저장' : '수정'}
          </button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingBottom:28 }}>
          <div style={{ position:'relative', marginBottom:14 }}>
            <div style={{ width:100, height:100, borderRadius:16, background:avatarColor(alumni.name), border:'3px solid rgba(255,255,255,0.3)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {(editMode ? form.photo_url : alumni.photo_url) ? (
                <img src={editMode ? form.photo_url : alumni.photo_url!} alt={alumni.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <span style={{ color:'#fff', fontSize:40, fontWeight:800 }}>{alumni.name.charAt(0)}</span>
              )}
            </div>
            {editMode && (
              <button onClick={() => photoRef.current?.click()} disabled={uploadingPhoto} style={{ position:'absolute', bottom:-6, right:-6, width:28, height:28, borderRadius:'50%', background:'#fff', border:'2px solid #1B63C6', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:12, fontWeight:700, color:'#1B63C6' }}>
                {uploadingPhoto ? '...' : '+'}
              </button>
            )}
          </div>
          <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload} />
          <h2 style={{ color:'#fff', fontSize:22, fontWeight:800, marginBottom:4, letterSpacing:2 }}>{alumni.name.split('').join(' ')}</h2>
          {alumni.job_title && <p style={{ color:'rgba(255,255,255,0.8)', fontSize:13 }}>{alumni.job_title}</p>}
        </div>
      </div>

      {/* 기수 배지 */}
      {alumni.admission_year && (
        <div style={{ display:'flex', justifyContent:'center', marginTop:-14, marginBottom:16, position:'relative', zIndex:10 }}>
          <div style={{ background:'#1B63C6', color:'#fff', fontSize:13, fontWeight:700, padding:'6px 20px', borderRadius:20, boxShadow:'0 2px 8px rgba(27,99,198,0.4)' }}>{'입학 ' + alumni.admission_year + '년'}</div>
        </div>
      )}

      <div style={{ flex:1, overflowY:'auto', padding:'0 16px 30px' }}>

        {editMode && (
          <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12, padding:'10px 14px', marginBottom:12, fontSize:13, color:'#1B63C6' }}>
            수정 모드 - 정보를 수정하고 저장 버튼을 눌러주세요
          </div>
        )}

        {/* 소속 카드 */}
        <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>{bar}<span style={{ fontSize:12, fontWeight:700, color:'#1B63C6', letterSpacing:1 }}>소속</span></div>
          {editMode ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {fieldRows.map(f => (
                <div key={f.key}>
                  <p style={{ fontSize:11, color:'#9CA3AF', marginBottom:3 }}>{f.label}</p>
                  <input value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {alumni.company && <div style={{ marginBottom:8 }}><p style={{ fontSize:11, color:'#9CA3AF', marginBottom:2 }}>회사</p><p style={{ fontSize:15, fontWeight:700, color:'#111827' }}>{alumni.company}</p></div>}
              {alumni.job_title && <div style={{ marginBottom:8 }}><p style={{ fontSize:11, color:'#9CA3AF', marginBottom:2 }}>직무/직책</p><p style={{ fontSize:14, color:'#374151' }}>{alumni.job_title}</p></div>}
              {alumni.phone && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <div><p style={{ fontSize:11, color:'#9CA3AF', marginBottom:2 }}>휴대폰</p><p style={{ fontSize:14, fontWeight:600, color:'#111827' }}>{alumni.phone}</p></div>
                  <button onClick={() => copy(alumni.phone!, '휴대폰')} style={{ background:'#EFF6FF', border:'none', borderRadius:8, padding:'6px 12px', fontSize:12, color:'#1B63C6', fontWeight:600, cursor:'pointer' }}>복사</button>
                </div>
              )}
              {alumni.region && <div style={{ marginBottom:alumni.address ? 8 : 0 }}><p style={{ fontSize:11, color:'#9CA3AF', marginBottom:2 }}>지역</p><p style={{ fontSize:14, color:'#374151' }}>{'📍 ' + alumni.region}</p></div>}
              {alumni.address && <div><p style={{ fontSize:11, color:'#9CA3AF', marginBottom:2 }}>주소</p><p style={{ fontSize:13, color:'#374151' }}>{alumni.address}</p></div>}
            </>
          )}
        </div>

        {/* 연락 버튼 */}
        {!editMode && (alumni.phone || alumni.email) && (
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            {alumni.phone && <a href={'tel:' + alumni.phone} style={{ flex:1, background:'#1B63C6', color:'#fff', borderRadius:12, padding:'12px', textAlign:'center', fontSize:13, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>전화</a>}
            {alumni.phone && <a href={'sms:' + alumni.phone} style={{ flex:1, background:'#F3F4F6', color:'#374151', borderRadius:12, padding:'12px', textAlign:'center', fontSize:13, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>문자</a>}
            {alumni.email && <a href={'mailto:' + alumni.email} style={{ flex:1, background:'#F3F4F6', color:'#374151', borderRadius:12, padding:'12px', textAlign:'center', fontSize:13, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>메일</a>}
          </div>
        )}

        {/* 학력 카드 */}
        <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>{bar}<span style={{ fontSize:12, fontWeight:700, color:'#1B63C6', letterSpacing:1 }}>학력</span></div>
          {[
            { label:'학과', value: alumni.department },
            { label:'입학년도', value: alumni.admission_year ? alumni.admission_year + '년' : undefined },
            { label:'졸업년도', value: alumni.graduation_year ? alumni.graduation_year + '년' : undefined },
          ].filter(r => r.value).map((r, i, arr) => (
            <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i < arr.length-1 ? '1px solid #F3F4F6' : 'none' }}>
              <span style={{ fontSize:13, color:'#6B7280' }}>{r.label}</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#111827' }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* 소개 카드 */}
        <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>{bar}<span style={{ fontSize:12, fontWeight:700, color:'#1B63C6', letterSpacing:1 }}>소개</span></div>
          {editMode ? (
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="간단한 소개를 입력해 주세요" rows={3} style={{ width:'100%', padding:'8px 12px', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:14, outline:'none', resize:'none', boxSizing:'border-box' }} />
          ) : (
            <p style={{ fontSize:13, color: alumni.bio ? '#4B5563' : '#D1D5DB', lineHeight:1.7 }}>{alumni.bio || '수정 버튼을 눌러 소개를 추가해주세요'}</p>
          )}
        </div>

        {/* 명함 카드 */}
        <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>{bar}<span style={{ fontSize:12, fontWeight:700, color:'#1B63C6', letterSpacing:1 }}>명함</span></div>
            {editMode && <button onClick={() => cardRef.current?.click()} disabled={uploadingCard} style={{ background:'#EFF6FF', border:'none', borderRadius:8, padding:'6px 12px', fontSize:12, color:'#1B63C6', fontWeight:600, cursor:'pointer' }}>{uploadingCard ? '업로드중...' : '명함 등록'}</button>}
          </div>
          <input ref={cardRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleCardUpload} />
          {(editMode ? form.card_image_url : alumni.card_image_url) ? (
            <img src={editMode ? form.card_image_url : alumni.card_image_url!} alt="명함" onClick={() => !editMode && setShowCard(true)} style={{ width:'100%', borderRadius:10, border:'1px solid #E5E7EB', cursor: editMode ? 'default' : 'pointer' }} />
          ) : (
            <div onClick={() => editMode && cardRef.current?.click()} style={{ background:'#F9FAFB', border:'2px dashed #E5E7EB', borderRadius:12, padding:'30px', textAlign:'center', cursor: editMode ? 'pointer' : 'default' }}>
              <p style={{ fontSize:13, color:'#9CA3AF' }}>{editMode ? '클릭해서 명함을 등록하세요' : '등록된 명함이 없습니다'}</p>
            </div>
          )}
        </div>

        {/* 카카오맵 카드 - 주소가 있을 때만 표시 */}
        {!editMode && alumni.address && (
          <div style={{ background:'#fff', borderRadius:16, padding:'16px', marginBottom:10, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>{bar}<span style={{ fontSize:12, fontWeight:700, color:'#1B63C6', letterSpacing:1 }}>위치</span></div>
              <a href={'https://map.kakao.com/link/search/' + encodeURIComponent(alumni.address)} target="_blank" rel="noreferrer" style={{ background:'#FEE500', border:'none', borderRadius:8, padding:'6px 12px', fontSize:12, color:'#191919', fontWeight:700, textDecoration:'none' }}>카카오맵 열기</a>
            </div>
            <p style={{ fontSize:12, color:'#6B7280', marginBottom:10 }}>{'📍 ' + alumni.address}</p>
            <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid #E5E7EB' }}>
              <iframe src={'https://map.kakao.com/?q=' + encodeURIComponent(alumni.address)} width="100%" height="200" style={{ border:'none', display:'block' }} title="카카오맵" />
            </div>
          </div>
        )}

        {editMode && (
          <button onClick={() => { setEditMode(false); setForm({ company: alumni.company||'', job_title: alumni.job_title||'', region: alumni.region||'', address: alumni.address||'', bio: alumni.bio||'', phone: alumni.phone||'', photo_url: alumni.photo_url||'', card_image_url: alumni.card_image_url||'' }); }} style={{ width:'100%', padding:'14px', background:'#F3F4F6', border:'none', borderRadius:12, fontSize:14, fontWeight:600, color:'#6B7280', cursor:'pointer', marginBottom:10 }}>
            취소
          </button>
        )}
      </div>

      {showCard && alumni.card_image_url && (
        <div onClick={() => setShowCard(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:24 }}>
          <img src={alumni.card_image_url} alt="명함" style={{ width:'100%', maxWidth:380, borderRadius:16 }} />
        </div>
      )}

      {toast && (
        <div style={{ position:'fixed', bottom:30, left:'50%', transform:'translateX(-50%)', background:'#111827', color:'#fff', padding:'10px 20px', borderRadius:50, fontSize:13, fontWeight:500, zIndex:50, whiteSpace:'nowrap' }}>
          {'✓ ' + toast}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}