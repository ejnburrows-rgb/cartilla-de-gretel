-- Lesson assignments per class
CREATE TABLE public.assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  title text,
  due_at timestamp with time zone,
  time_limit_seconds integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_assignments_class ON public.assignments(class_id);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Public can read assignments (students need to see them with just their class join_code)
CREATE POLICY "assignments public read"
ON public.assignments FOR SELECT
USING (true);

-- Only the teacher of the class can manage assignments
CREATE POLICY "assignments teacher all"
ON public.assignments FOR ALL
USING (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = assignments.class_id AND c.teacher_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.classes c WHERE c.id = assignments.class_id AND c.teacher_id = auth.uid()));
