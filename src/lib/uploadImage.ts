import { supabase } from './supabase'

export async function uploadImage(file: File, folder: 'profiles' | 'cards'): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('alumni-images')
    .upload(fileName, file, { upsert: true })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabase.storage
    .from('alumni-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}
