-- Migration to create the ai_summaries table for clinical insights
CREATE TABLE IF NOT EXISTS public.ai_summaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    model_used TEXT DEFAULT 'llama3',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

-- Basic policy: Patients can read their own summaries, practitioners can read their assigned patients' summaries
CREATE POLICY "Users can view summaries for their assigned patients" 
ON public.ai_summaries
FOR SELECT
USING (
    patient_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM practitioner_patients 
        WHERE practitioner_id = auth.uid() AND patient_id = public.ai_summaries.patient_id
    )
);
