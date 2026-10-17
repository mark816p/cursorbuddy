-- Cursorbuddy Initial Schema: Profiles, Usage, Invites, Subscriptions

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Monthly Usage Table
CREATE TABLE IF NOT EXISTS public.usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: YYYY-MM
    questions INT NOT NULL DEFAULT 0,
    jobs INT NOT NULL DEFAULT 0,
    bonus_questions INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_month UNIQUE (user_id, month)
);

ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage"
    ON public.usage FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Invites & Referral Codes Table
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    bonus_questions INT NOT NULL DEFAULT 50,
    max_redemptions INT NOT NULL DEFAULT 1,
    redemption_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can check invite code"
    ON public.invites FOR SELECT
    TO authenticated
    USING (true);

-- 4. Invite Redemptions Table
CREATE TABLE IF NOT EXISTS public.invite_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_id UUID NOT NULL REFERENCES public.invites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_invite UNIQUE (invite_id, user_id)
);

ALTER TABLE public.invite_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own redemptions"
    ON public.invite_redemptions FOR SELECT
    USING (auth.uid() = user_id);
