-- Restrict AI chat RLS policies to authenticated role only
DROP POLICY IF EXISTS "own threads" ON public.ai_chat_threads;
CREATE POLICY "own threads" ON public.ai_chat_threads
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own messages" ON public.ai_chat_messages;
CREATE POLICY "own messages" ON public.ai_chat_messages
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
