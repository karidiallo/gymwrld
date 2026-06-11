DROP POLICY IF EXISTS "Users manage own push tokens" ON public.push_tokens;
REVOKE ALL ON public.push_tokens FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_tokens TO authenticated;
GRANT ALL ON public.push_tokens TO service_role;
CREATE POLICY "Users manage own push tokens"
  ON public.push_tokens
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);