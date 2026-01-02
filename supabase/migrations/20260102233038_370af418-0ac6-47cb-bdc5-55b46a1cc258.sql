-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT,
    cpf_cnpj TEXT,
    address TEXT,
    is_adult BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles de usuários (segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Tabela de vendedores
CREATE TABLE public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de apostas/bilhetes
CREATE TABLE public.bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES public.sellers(id),
    numbers INTEGER[] NOT NULL,
    order_number TEXT NOT NULL,
    bet_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bet_time TIME NOT NULL DEFAULT CURRENT_TIME,
    prize_value DECIMAL(10,2) NOT NULL DEFAULT 25000.00,
    bet_value DECIMAL(10,2) NOT NULL DEFAULT 25.00,
    status TEXT NOT NULL DEFAULT 'pending',
    pdf_url TEXT,
    email_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de contagem de ordem diária
CREATE TABLE public.daily_order_counter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counter_date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    current_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_order_counter ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email, city)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'city', 'Não informada')
    );
    
    -- Assign default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Trigger para criar perfil
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para gerar número de ordem
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    today DATE := CURRENT_DATE;
    new_count INTEGER;
BEGIN
    INSERT INTO public.daily_order_counter (counter_date, current_count)
    VALUES (today, 1)
    ON CONFLICT (counter_date) 
    DO UPDATE SET current_count = daily_order_counter.current_count + 1
    RETURNING current_count INTO new_count;
    
    RETURN LPAD(new_count::TEXT, 5, '0');
END;
$$;

-- Função update timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger update timestamp
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies para profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para sellers
CREATE POLICY "Sellers viewable by authenticated"
ON public.sellers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage sellers"
ON public.sellers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para bets
CREATE POLICY "Users can view their own bets"
ON public.bets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bets"
ON public.bets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bets"
ON public.bets FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all bets"
ON public.bets FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para daily_order_counter
CREATE POLICY "Counter accessible to authenticated"
ON public.daily_order_counter FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Counter insert by authenticated"
ON public.daily_order_counter FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Counter update by authenticated"
ON public.daily_order_counter FOR UPDATE
TO authenticated
USING (true);

-- Inserir vendedor padrão
INSERT INTO public.sellers (name, email, phone)
VALUES ('Vendedor Padrão', 'vendedor@navarzeaegol.com', '(11) 99999-9999');