-- Cursorbuddy Atomic Quota Stored Procedure

CREATE OR REPLACE FUNCTION public.increment_user_quota(
    p_user_id UUID,
    p_type TEXT DEFAULT 'question' -- 'question' or 'job'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan TEXT;
    v_month TEXT;
    v_questions INT;
    v_bonus INT;
    v_limit INT;
    v_allowed BOOLEAN;
BEGIN
    -- Current UTC month format YYYY-MM
    v_month := to_char(timezone('utc'::text, now()), 'YYYY-MM');

    -- Fetch user plan
    SELECT plan INTO v_plan FROM public.profiles WHERE id = p_user_id;
    IF NOT FOUND THEN
        v_plan := 'free';
    END IF;

    -- Upsert usage record for current month
    INSERT INTO public.usage (user_id, month, questions, jobs, bonus_questions)
    VALUES (p_user_id, v_month, 0, 0, 0)
    ON CONFLICT (user_id, month) DO NOTHING;

    -- Lock usage row for update
    SELECT questions, bonus_questions INTO v_questions, v_bonus
    FROM public.usage
    WHERE user_id = p_user_id AND month = v_month
    FOR UPDATE;

    -- Calculate limit: Free: 50 + bonus; Pro: 2000
    IF v_plan = 'pro' THEN
        v_limit := 2000;
    ELSE
        v_limit := 50 + COALESCE(v_bonus, 0);
    END IF;

    -- Check quota
    IF v_questions < v_limit THEN
        v_allowed := TRUE;
        UPDATE public.usage
        SET questions = questions + 1,
            updated_at = timezone('utc'::text, now())
        WHERE user_id = p_user_id AND month = v_month;
        v_questions := v_questions + 1;
    ELSE
        v_allowed := FALSE;
    END IF;

    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'current_usage', v_questions,
        'limit_max', v_limit,
        'plan', v_plan
    );
END;
$$;
