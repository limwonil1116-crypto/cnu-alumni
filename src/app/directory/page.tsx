'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Alumni {
  id: string;
  name: string;
  department: string;
  admission_year?: number;
  company?: string;
  job_title?: string;
  region?: string;
  photo_url?: string;
  phone?: string;
}

// 연락처 저장 함수 (vCard 방식)
function saveContact(a: Alumni) {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${a.name}`,
    `N:${a.name};;;`,
    a.phone ? `TEL;TYPE=CELL:${a.phone}` : '',
    a.company ? `ORG:${a.company}` : '',
    a.job_title ? `TITLE:${a.job_title}` : '',
    a.department ? `NOTE:충청지역 백마회 / ${a.department}` : 'NOTE:충청지역 백마회',
    'END:VCARD',
  ].filter(Boolean).join('\n');

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a2 = document.createElement('a');
  a2.href = url;
  a2.download = `${a.name}.vcf`;
  a2.click();
  URL.revokeObjectURL(url);
}

export default function DirectoryPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [authChecked, setAuthChecked] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/'); return; }
      setAuthChecked(true);

      const { data, error } = await supabase
        .from('alumni_master')
        .select('id, name, phone, email, admission_year, graduation_year, department_name, auth_status, alumni_profiles (company, job_title, region, photo_url)')
        .eq('auth_status', 'active')
        .order('admission_year', { ascending: true });

      if (error) console.error('Fetch error:', error);

      setAlumni((data || []).map((a: any) => ({
        id: a.id,
        name: a.name || '',
        department: a.department_name || '',
        admission_year: a.admission_year,
        company: a.alumni_profiles?.[0]?.company,
        job_title: a.alumni_profiles?.[0]?.job_title,
        region: a.alumni_profiles?.[0]?.region,
        photo_url: a.alumni_profiles?.[0]?.photo_url,
        phone: a.phone,
      })));
      setLoading(false);
    };
    init();
  }, [router]);

  const departments = ['전체', ...Array.from(new Set(alumni.map(a => a.department).filter(Boolean))).sort()];

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return alumni.filter(a => {
      const matchQ = !q || a.name.includes(q) || (a.department || '').includes(q) || (a.company || '').toLowerCase().includes(q) || String(a.admission_year || '').includes(q);
      const matchFilter = activeFilter === '전체' || a.department === activeFilter;
      return matchQ && matchFilter;
    });
  }, [query, alumni, activeFilter]);

  const avatarColor = (name: string) => {
    const colors = [
      ['#0d2d6e', '#1a4ba8'],
      ['#1a3a6e', '#1e5fa8'],
      ['#0d4d6e', '#1a7aa8'],
      ['#1a2d6e', '#2a4ba8'],
      ['#0d3d5e', '#1a6090'],
      ['#162850', '#1e4080'],
    ];
    const c = colors[(name.charCodeAt(0) || 0) % colors.length];
    return `linear-gradient(145deg, ${c[0]}, ${c[1]})`;
  };

  const handleSaveContact = (a: Alumni) => {
    saveContact(a);
    setSavedId(a.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const F = { fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" };

  if (!authChecked && loading) return (
    <div style={{ ...F, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTop: '3px solid #1B3F7B', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: '#94a3b8' }}>불러오는 중...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ ...F, minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f0f4f8' }}>

      {/* ── 헤더 ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d2d6e 0%, #1B3F7B 60%, #1a5276 100%)',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: '0 2px 12px rgba(13,45,110,0.3)',
      }}>
        {/* 상단바 */}
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32 }}>
              <img src="/krc-logo.jpg" alt="한국농어촌공사" style={{ height: 22, width: 'auto', objectFit: 'contain' }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}></span>
          </div>
          <Link href="/mypage" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
          </Link>
        </div>

        {/* 타이틀 + 카운트 */}
        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: -0.3, lineHeight: 1 }}>충남대학교 백마회</h1>
            </div>
            <div style={{ textAlign: 'right', paddingBottom: 2 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{filtered.length}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 3 }}>명</span>
            </div>
          </div>

          {/* 검색창 */}
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, flex: 1 }}
              placeholder="이름, 학과, 회사 검색"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 11, padding: '2px 7px', borderRadius: 10, lineHeight: 1.5 }}>✕</button>
            )}
          </div>
        </div>

        {/* 학과 필터 */}
        <div style={{ padding: '0 16px 12px' }}>
          {/* 가로 스크롤 버튼 */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            {departments.map(dept => (
              <button key={dept} onClick={() => setActiveFilter(dept)}
                style={{
                  flexShrink: 0, fontSize: 12, padding: '6px 14px', borderRadius: 20,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                  fontFamily: 'inherit', fontWeight: activeFilter === dept ? 700 : 400,
                  background: activeFilter === dept ? '#fff' : 'rgba(255,255,255,0.12)',
                  color: activeFilter === dept ? '#1B3F7B' : 'rgba(255,255,255,0.8)',
                  border: activeFilter === dept ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                  boxShadow: activeFilter === dept ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}>
                {dept}
              </button>
            ))}
          </div>

          {/* 드롭다운 */}
          <div style={{ position: 'relative' }}>
            <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}
              style={{
                width: '100%', appearance: 'none', WebkitAppearance: 'none',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 10, padding: '9px 36px 9px 14px', fontSize: 13,
                color: activeFilter === '전체' ? 'rgba(255,255,255,0.6)' : '#fff',
                fontWeight: activeFilter === '전체' ? 400 : 600,
                cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
              } as React.CSSProperties}>
              {departments.map(dept => (
                <option key={dept} value={dept} style={{ background: '#1B3F7B', color: '#fff' }}>
                  {dept === '전체' ? '🎓 학과 전체 보기' : `📚 ${dept}`}
                </option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── 목록 ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 80px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #1B3F7B', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: '#94a3b8' }}>불러오는 중...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 6 }}>검색 결과가 없습니다</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>다른 검색어를 입력해 보세요</p>
          </div>
        ) : filtered.map((a, idx) => (
          <div key={a.id} style={{
            background: '#fff', borderRadius: 14, marginBottom: 8,
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 1px 3px rgba(13,45,110,0.07)',
            overflow: 'hidden',
          }}>
            {/* 카드 메인 */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '13px 14px', gap: 12 }}>

              {/* 번호 */}
              <div style={{ width: 24, flexShrink: 0, textAlign: 'center' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</span>
              </div>

              {/* 아바타 */}
              <Link href={'/directory/' + a.id} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: avatarColor(a.name), overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(13,45,110,0.2)' }}>
                  {a.photo_url
                    ? <img src={a.photo_url} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{a.name.charAt(0)}</span>}
                </div>
              </Link>

              {/* 정보 */}
              <Link href={'/directory/' + a.id} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{a.name}</span>
                  {a.department && (
                    <span style={{ fontSize: 10, background: '#eff6ff', color: '#1B3F7B', padding: '2px 8px', borderRadius: 20, fontWeight: 600, border: '1px solid #dbeafe' }}>
                      {a.department}
                    </span>
                  )}
                </div>
                {(a.company || a.job_title) && (
                  <p style={{ fontSize: 12, color: '#475569', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[a.company, a.job_title].filter(Boolean).join(' · ')}
                  </p>
                )}
                {a.phone && <p style={{ fontSize: 11, color: '#94a3b8' }}>📱 {a.phone}</p>}
              </Link>

              {/* 우측: 입학연도 + 저장 버튼 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                {a.admission_year && (
                  <span style={{ fontSize: 10, color: '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                    입학 {a.admission_year}
                  </span>
                )}
                {/* 연락처 저장 버튼 */}
                {a.phone && (
                  <button
                    onClick={() => handleSaveContact(a)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: savedId === a.id ? '#dcfce7' : '#eff6ff',
                      border: `1px solid ${savedId === a.id ? '#86efac' : '#dbeafe'}`,
                      borderRadius: 8, padding: '4px 10px',
                      fontSize: 11, fontWeight: 600,
                      color: savedId === a.id ? '#16a34a' : '#1B3F7B',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.2s', whiteSpace: 'nowrap',
                    }}>
                    {savedId === a.id ? (
                      <>✓ 저장됨</>
                    ) : (
                      <>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="19" y1="8" x2="19" y2="14"/>
                          <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        저장
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 하단 네비 ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', position: 'sticky', bottom: 0, zIndex: 40, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => router.back()} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
          <span style={{ fontSize: 10, fontWeight: 500 }}>뒤로</span>
        </button>
        <Link href="/home" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0', color: '#1B3F7B', textDecoration: 'none' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          <span style={{ fontSize: 10, fontWeight: 700 }}>홈</span>
        </Link>
        <Link href="/mypage" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0', color: '#64748b', textDecoration: 'none' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
          <span style={{ fontSize: 10, fontWeight: 500 }}>내 정보</span>
        </Link>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}