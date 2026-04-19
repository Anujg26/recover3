-- Add a unique constraint to patient_id to allow for Upsert (Update on Conflict)
ALTER TABLE public.ai_summaries
ADD CONSTRAINT ai_summaries_patient_id_key UNIQUE (patient_id);
