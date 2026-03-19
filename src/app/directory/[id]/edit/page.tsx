'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function EditAlumniPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [form, setForm] = useState({
    company: '', job_title: '', region: '', bio: '',
    phone: '', photo_url: '', card_image_url: '',
  });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('alumni_master')
        .select(`
          id, name, phone,
          alumni_profiles (company, job_title, region, bio, photo_url, card_image_url)
        `)
        .eq('id', id)
        .single();

      if (data) {
        setName(data.name);
        const p = (data as any).alumni_profiles?.[0];
        setForm({
          company: p?.company || '',
          job_title: p?.job_title || '',
          region: p?.region || '',
          bio: p?.bio || '',
          phone: data.phone || '',
          photo_url: p?.photo_url || '',
          card_image_url: p?.card_image_url || '',
        });
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!confirm('저장하시겠습니까?')) return;
    setSaving(true);

    await supabase.from('alumni_master').update({ phone: form.phone || null }).eq('id', id);

    const { data: existing } = await supabase
      .from('alumni_profiles')
      .select('id')
      .eq('alumni_id', id)
      .single();

    if (existing) {
      await supabase.from('alumni_profiles').update({
        company: form.company || null,
        job_title: form.job_title || null,
        region: form.region || null,
        bio: form.bio || null,
        photo_url: form.photo_url || null,
        card_image_url: form.card_image_url || null,
      }).eq('alumni_id', id);
    } else {
      await supabase.from('alumni_profiles').insert({
        alumni_id: id,
        company: form.company || null,
        job_title: form.job_title || null,
        region: form.region || null,
        bio: form.bio || null,
        photo_url: form.photo_url || null,
        card_image_url: form.card_image_url || null,
      });
    }

    setSaving(false);
    router.push(`/directory/${id}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-dvh">
      <div className="w-8 h-8 border-4 border-[#1B3F7B] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const Field = ({ label, k, placeholder, type = 'text' }: {
    label: string; k: string; placeholder?: string; type?: string;
  }) => (
    <div className="mb-4">
      <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5 block">{label}</label>
      <input
        type={type}
        value={(form as any)[k]}
        onChange={set(k)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-[1.5px] border-[#E5EAF2] rounded-xl text-[15px] outline-none focus:border-[#1B3F7B] transition-colors bg-white"
      />
    </div>
  );

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F7FA]">
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3 bg-[#F5F7FA] flex items-center gap-3 sticky top-0 z-40">
        <button
          onClick={() => { if (confirm('변경사항이 저장되지 않습니다. 나가시겠습니까?')) router.back(); }}
          className="w-9 h-9 rounded-full bg-white border border-[#E5EAF2] flex items-center justify-center shadow-sm"
        >
          <span className="text-[#1B3F7B] text-lg">←</span>
        </button>
        <div className="flex-1">
          <p className="font-bold text-[#111827]">{name} 프로필 수정</p>
          <p className="text-xs text-[#9CA3AF]">모든 동문이 수정 가능합니다</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1B3F7B] text-white text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-70 flex items-center gap-1.5"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : '저장'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 pb-10 space-y-3">

        {/* 연락처 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5EAF2]">
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">연락처</p>
          <Field label="휴대폰" k="phone" placeholder="01047581293" type="tel" />
        </div>

        {/* 직장 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5EAF2]">
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">직장</p>
          <Field label="회사명" k="company" placeholder="한국농어촌공사" />
          <Field label="직무/직책" k="job_title" placeholder="사원" />
          <Field label="지역" k="region" placeholder="대전" />
        </div>

        {/* 소개 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5EAF2]">
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">소개</p>
          <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5 block">자기소개</label>
          <textarea
            value={form.bio}
            onChange={set('bio')}
            placeholder="간단한 소개를 입력해 주세요"
            rows={3}
            className="w-full px-4 py-3 border-[1.5px] border-[#E5EAF2] rounded-xl text-[15px] outline-none focus:border-[#1B3F7B] transition-colors bg-white resize-none"
          />
        </div>

        {/* 사진/명함 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5EAF2]">
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">사진 & 명함</p>
          <Field label="프로필 사진 URL" k="photo_url" placeholder="https://..." />
          <Field label="명함 이미지 URL" k="card_image_url" placeholder="https://..." />
          <p className="text-xs text-[#9CA3AF] mt-1">
            이미지 URL은 구글 드라이브 공유 링크 또는 이미지 호스팅 서비스를 이용해 주세요
          </p>
        </div>

      </div>
    </div>
  );
}