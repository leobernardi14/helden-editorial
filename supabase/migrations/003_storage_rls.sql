-- Migration 003: políticas RLS do bucket post-images
-- Execute no SQL Editor do Supabase.
--
-- O bucket deve existir antes (criado manualmente como "public bucket").
-- Estas políticas garantem: leitura pública + upload/delete exclusivo da agência.

-- Leitura pública (qualquer um pode ver as imagens via URL)
CREATE POLICY "post_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Upload: somente usuários autenticados com role 'agencia'
CREATE POLICY "post_images_agency_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'agencia'
);

-- Update: somente agência
CREATE POLICY "post_images_agency_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'post-images'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'agencia'
);

-- Delete: somente agência
CREATE POLICY "post_images_agency_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images'
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'agencia'
);
