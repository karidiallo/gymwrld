CREATE OR REPLACE FUNCTION public.touch_ai_thread()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  UPDATE public.ai_chat_threads SET updated_at = now() WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.touch_ai_thread() FROM PUBLIC, anon, authenticated;