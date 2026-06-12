-- Migration 002: converte reference_month de DATE para TEXT
-- Execute no SQL Editor do Supabase antes de usar o campo de texto livre.

ALTER TABLE public.calendars
  ALTER COLUMN reference_month TYPE TEXT USING (
    CASE
      WHEN reference_month IS NULL THEN NULL
      ELSE to_char(reference_month, 'MM/YYYY')
    END
  );
