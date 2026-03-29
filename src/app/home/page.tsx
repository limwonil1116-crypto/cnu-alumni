'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ADMIN_NAME = '임원일';

interface Post {
  id: string;
  title: string;
  content?: string;
  author: string;
  author_email?: string;
  images?: string[];
  created_at: string;
  type: 'notice' | 'board';
}

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<'notice' | 'board'>('notice');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showWrite, setShowWrite] = useState(false);
  const [myEmail, setMyEmail] = useState('');
  const [myName, setMyName] = useState('');

  // 글쓰기 폼
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeImages, setWriteImages] = useState<File[]>([]);
  const [writeImagePreviews, setWriteImagePreviews] = useState<string[]>([]);
  const [writeLoading, setWriteLoading] = useState(false);

  // 수정 폼
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const F = { fontFamily: "'Apple SD Gothic Neo','Noto Sans KR',sans-serif" };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/'); return; }
      const meta = session.user.user_metadata || {};
      const name = meta.full_name || meta.name || meta.preferred_username || '';
      setMyEmail(session.user.email || '');
      setMyName(name);
      await fetchPosts();
    };
    init();
  }, [router]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts((data || []).map((d: any) => ({
      ...d,
      images: d.images || [],
      type: d.type || 'notice',
    })));
    setLoading(false);
  };

  const filteredPosts = posts.filter(p => p.type === tab);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + writeImages.length > 5) {
      alert('사진은 최대 5장까지 첨부 가능합니다');
      return;
    }
    const newFiles = [...writeImages, ...files];
    setWriteImages(newFiles);
    setWriteImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (idx: number) => {
    setWriteImages(writeImages.filter((_, i) => i !== idx));
    setWriteImagePreviews(writeImagePreviews.filter((_, i) => i !== idx));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `notices/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('alumni-images').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('alumni-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  // 글 작성
  const handleSubmit = async () => {
    if (!writeTitle.trim()) { alert('제목을 입력해주세요'); return; }
    setWriteLoading(true);
    const imageUrls = writeImages.length > 0 ? await uploadImages(writeImages) : [];
    const { error } = await supabase.from('notices').insert({
      title: writeTitle.trim(),
      content: writeContent.trim(),
      author: myName || '익명',
      author_email: myEmail,
      images: imageUrls,
      type: tab,
    });
    if (error) {
      alert('등록 실패: ' + error.message);
    } else {
      setWriteTitle(''); setWriteContent('');
      setWriteImages([]); setWriteImagePreviews([]);
      setShowWrite(false);
      await fetchPosts();
    }
    setWriteLoading(false);
  };

  // 수정 시작
  const handleEditStart = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content || '');
    setExpandedId(null);
  };

  // 수정 저장
  const handleEditSave = async () => {
    if (!editingPost) return;
    if (!editTitle.trim()) { alert('제목을 입력해주세요'); return; }
    setEditLoading(true);
    const { error } = await supabase
      .from('notices')
      .update({
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      .eq('id', editingPost.id);
    if (error) {
      alert('수정 실패: ' + error.message);
    } else {
      setEditingPost(null);
      await fetchPosts();
    }
    setEditLoading(false);
  };

  // 삭제
  const handleDelete = async (post: Post) => {
    const canDel = post.author_email === myEmail || myName === ADMIN_NAME;
    if (!canDel) { alert('본인 또는 관리자만 삭제할 수 있습니다'); return; }
    if (!confirm('삭제하시겠습니까?')) return;
    await supabase.from('notices').delete().eq('id', post.id);
    await fetchPosts();
  };

  const canEdit = (post: Post) => post.author_email === myEmail || myName === ADMIN_NAME;
  const canDelete = (post: Post) => post.author_email === myEmail || myName === ADMIN_NAME;

  if (loading) return (
    <div style={{ ...F, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTop: '3px solid #1B3F7B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return (
    <div style={{ ...F, minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f0f4f8' }}>

      {/* ── 헤더 ── */}
      <div style={{ background: 'linear-gradient(135deg, #0d2d6e 0%, #1B3F7B 60%, #1a5276 100%)', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 2px 12px rgba(13,45,110,0.3)' }}>
        <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: '4px 10px', height: 32, display: 'flex', alignItems: 'center' }}>
              <img src="/krc-logo.jpg" alt="KRC" style={{ height: 22, width: 'auto', objectFit: 'contain' }} />
            </div>
          </div>
          <Link href="/mypage" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
          </Link>
        </div>
        <div style={{ padding: '12px 16px 0' }}>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 14 }}>충남대학교 백마회</h1>
        </div>
        <div style={{ display: 'flex', padding: '0 16px' }}>
          {(['notice', 'board'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', borderBottom: tab === t ? '3px solid #fff' : '3px solid transparent', color: tab === t ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: tab === t ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {t === 'notice' ? '📢 공지사항' : '💬 게시판'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 100px' }}>

        {/* 글쓰기 버튼 */}
        <button onClick={() => { setShowWrite(!showWrite); setEditingPost(null); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 14, padding: '11px', marginBottom: 12, fontSize: 13, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
          ✏️ {tab === 'notice' ? '공지사항' : '게시글'} 작성하기
        </button>

        {/* ── 글쓰기 폼 ── */}
        {showWrite && !editingPost && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '18px 16px', marginBottom: 12, boxShadow: '0 2px 8px rgba(13,45,110,0.08)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              {tab === 'notice' ? '📢 공지사항 작성' : '💬 게시글 작성'}
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>작성자: {myName || myEmail}</span>
            </p>
            <input value={writeTitle} onChange={e => setWriteTitle(e.target.value)}
              placeholder="제목을 입력하세요 *"
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 13, marginBottom: 8, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
            <textarea value={writeContent} onChange={e => setWriteContent(e.target.value)}
              placeholder="내용을 입력하세요" rows={4}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 13, marginBottom: 10, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' as const }} />
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', fontSize: 12, color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
                📷 사진 첨부 ({writeImages.length}/5)
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: 'none' }} />
              </label>
              {writeImagePreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {writeImagePreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                      <img src={src} style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                      <button onClick={() => removeImage(i)}
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#ef4444', border: 'none', borderRadius: '50%', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowWrite(false); setWriteTitle(''); setWriteContent(''); setWriteImages([]); setWriteImagePreviews([]); }}
                style={{ flex: 1, padding: '11px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontSize: 13, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                취소
              </button>
              <button onClick={handleSubmit} disabled={writeLoading}
                style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg, #0d2d6e, #1B3F7B)', border: 'none', borderRadius: 10, fontSize: 13, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {writeLoading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : '등록하기'}
              </button>
            </div>
          </div>
        )}

        {/* ── 수정 폼 ── */}
        {editingPost && (
          <div style={{ background: '#fff', borderRadius: 16, border: '2px solid #1B3F7B', padding: '18px 16px', marginBottom: 12, boxShadow: '0 2px 12px rgba(13,45,110,0.15)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1B3F7B', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              ✏️ 게시글 수정
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>작성자: {editingPost.author}</span>
            </p>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              placeholder="제목을 입력하세요 *"
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 13, marginBottom: 8, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
              placeholder="내용을 입력하세요" rows={4}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 13, marginBottom: 10, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' as const }} />
            {/* 기존 이미지 미리보기 */}
            {editingPost.images && editingPost.images.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>기존 첨부 사진</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {editingPost.images.map((url, i) => (
                    <img key={i} src={url} style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditingPost(null)}
                style={{ flex: 1, padding: '11px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontSize: 13, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                취소
              </button>
              <button onClick={handleEditSave} disabled={editLoading}
                style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg, #0d2d6e, #1B3F7B)', border: 'none', borderRadius: 10, fontSize: 13, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {editLoading ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> : '💾 변경사항 저장'}
              </button>
            </div>
          </div>
        )}

        {/* ── 게시글 목록 ── */}
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 10 }}>{tab === 'notice' ? '📭' : '💬'}</p>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>등록된 {tab === 'notice' ? '공지사항' : '게시글'}이 없습니다</p>
          </div>
        ) : filteredPosts.map(post => (
          <div key={post.id} style={{ background: '#fff', borderRadius: 16, marginBottom: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(13,45,110,0.07)', overflow: 'hidden' }}>

            {/* 게시글 헤더 */}
            <button onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
              style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, background: tab === 'notice' ? '#1B3F7B' : '#0891b2', color: '#fff', padding: '2px 8px', borderRadius: 6, fontWeight: 700, flexShrink: 0 }}>
                    {tab === 'notice' ? '공지' : '게시'}
                  </span>
                  {post.images && post.images.length > 0 && (
                    <span style={{ fontSize: 10, background: '#f0fdf4', color: '#16a34a', padding: '2px 7px', borderRadius: 6, fontWeight: 600, border: '1px solid #bbf7d0' }}>
                      📷 {post.images.length}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{post.title}</p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>{post.author} · {new Date(post.created_at).toLocaleDateString('ko-KR')}</p>
              </div>
              <svg width="16" height="16" fill="none" stroke="#cbd5e1" strokeWidth="2" viewBox="0 0 24 24"
                style={{ flexShrink: 0, marginTop: 2, transform: expandedId === post.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* 게시글 상세 */}
            {expandedId === post.id && (
              <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 16px' }}>
                {post.content && (
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.8, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{post.content}</p>
                )}
                {post.images && post.images.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>첨부 사진 {post.images.length}장</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {post.images.map((url, i) => (
                        <img key={i} src={url} alt={`첨부${i + 1}`}
                          style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 300, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                          onClick={() => window.open(url, '_blank')} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 수정/삭제 버튼 */}
                {canEdit(post) && (
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button onClick={() => handleEditStart(post)}
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '5px 14px', fontSize: 12, color: '#1B3F7B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                      ✏️ 수정
                    </button>
                    {canDelete(post) && (
                      <button onClick={() => handleDelete(post)}
                        style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 8, padding: '5px 14px', fontSize: 12, color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                        🗑 삭제
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── 동문 확인하기 버튼 ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'linear-gradient(to top, #f0f4f8 70%, transparent)', padding: '12px 16px 20px' }}>
        <Link href="/directory"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', minHeight: 54, background: 'linear-gradient(135deg, #0d2d6e, #1B3F7B)', color: '#fff', borderRadius: 16, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(13,45,110,0.35)' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          동문 목록 확인하기
        </Link>
      </div>

      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}