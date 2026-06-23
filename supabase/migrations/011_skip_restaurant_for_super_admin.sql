-- =============================================================================
-- PatronFlow Migration 011: Skip restaurant provisioning for super_admin users
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.raw_app_meta_data->>'role', '') = 'super_admin' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.restaurants (owner_id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'restaurant_name', 'My Restaurant')
  );

  RETURN NEW;
END;
$$;
