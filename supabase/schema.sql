-- ==============================================================================
-- SISTEMA DE GESTÃO OPERACIONAL - PMMG
-- 2º PELOTÃO / 2ª CIA PM IND / 11ª RPM - SALINAS/MG
-- Schema Oficial Supabase PostgreSQL
-- ==============================================================================

-- 1. ENUMS E TIPOS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'SOF', 'ALERTA_HOMICIDIO', 'EQUIPE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grupo_operacao AS ENUM ('POG', 'PROXIMIDADE', 'INTERACOES_COMUNITARIAS', 'ORDENS_SERVICO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nivel_risco AS ENUM ('BAIXO', 'MEDIO', 'ALTO', 'CRITICO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_alerta AS ENUM ('ATIVO', 'CONTROLADO', 'EVOLUIDO', 'ARQUIVADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA DE PERFIS DE USUÁRIOS (MILITARES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Opcional: vínculo com auth.users do Supabase
    numero_pm VARCHAR(20) UNIQUE NOT NULL,
    nome_completo VARCHAR(120) NOT NULL,
    nome_guerra VARCHAR(60) NOT NULL,
    graduacao VARCHAR(20) NOT NULL, -- Sd, Cb, 3º Sgt, 2º Sgt, 1º Sgt, Sub Ten, Ten
    whatsapp VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'EQUIPE' NOT NULL,
    equipe_padrao VARCHAR(40),
    primeiro_acesso BOOLEAN DEFAULT TRUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CATÁLOGO DE OPERAÇÕES E ORDENS DE SERVIÇO
CREATE TABLE IF NOT EXISTS public.tipos_operacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grupo grupo_operacao NOT NULL,
    codigo_natureza VARCHAR(30) NOT NULL, -- Ex: Y04009, A21.007, OS 3.028/2025
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    link_google_drive TEXT,
    requer_reds_origem BOOLEAN DEFAULT FALSE,
    min_envolvidos INT DEFAULT 0,
    area_rural_obrigatoria BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. METAS MENSAIS (GERAL E DISTRIBUIÇÃO POR EQUIPES)
CREATE TABLE IF NOT EXISTS public.metas_mensais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    ano INT NOT NULL,
    tipo_operacao_id UUID NOT NULL REFERENCES public.tipos_operacoes(id) ON DELETE CASCADE,
    meta_total INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(mes, ano, tipo_operacao_id)
);

CREATE TABLE IF NOT EXISTS public.metas_equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meta_mensal_id UUID NOT NULL REFERENCES public.metas_mensais(id) ON DELETE CASCADE,
    equipe VARCHAR(40) NOT NULL, -- ALFA, BRAVO, CHARLIE, DELTA, RURAL, MP, RPPM, PATRULHA ESCOLAR
    percentual_alocado NUMERIC(5,2) DEFAULT 0.00,
    meta_quantitativa INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(meta_mensal_id, equipe)
);

-- 5. LANÇAMENTO DE EXECUÇÃO DE OPERAÇÕES
CREATE TABLE IF NOT EXISTS public.registros_operacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_operacao_id UUID NOT NULL REFERENCES public.tipos_operacoes(id) ON DELETE RESTRICT,
    data_execucao DATE NOT NULL,
    equipe VARCHAR(40) NOT NULL,
    militar_responsavel_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reds_numero VARCHAR(30),
    reds_origem VARCHAR(30), -- Obrigatório para VT Furto e VTCV
    local_fato TEXT,
    bairro VARCHAR(80),
    area_rural BOOLEAN DEFAULT FALSE,
    quantidade_envolvidos INT DEFAULT 0,
    detalhes_interacao JSONB DEFAULT '{}'::jsonb, -- Pauta, encaminhamentos, rede atendida, demanda
    observacoes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. MÓDULO ALERTA DE HOMICÍDIOS (Prevenção e Monitoramento)
CREATE TABLE IF NOT EXISTS public.alertas_homicidio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reds_numero VARCHAR(30) NOT NULL,
    natureza_ocorrencia VARCHAR(120) NOT NULL,
    data_fato DATE NOT NULL,
    municipio VARCHAR(80) DEFAULT 'Salinas' NOT NULL,
    bairro VARCHAR(80) NOT NULL,
    endereco_completo TEXT,
    autores TEXT NOT NULL,
    vitimas TEXT NOT NULL,
    grau_risco nivel_risco DEFAULT 'ALTO' NOT NULL,
    avaliacao_cenario TEXT NOT NULL,
    acoes_preventivas_adotadas TEXT NOT NULL,
    status status_alerta DEFAULT 'ATIVO' NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ESCALA OPERACIONAL MENSAL
CREATE TABLE IF NOT EXISTS public.legendas_escala (
    codigo VARCHAR(10) PRIMARY KEY,
    descricao VARCHAR(80) NOT NULL,
    conta_como_servico BOOLEAN DEFAULT FALSE,
    cor_badge VARCHAR(30) DEFAULT 'gray'
);

CREATE TABLE IF NOT EXISTS public.escalas_mensais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    ano INT NOT NULL,
    titulo VARCHAR(120) DEFAULT 'Escala Operacional Mensal',
    status VARCHAR(20) DEFAULT 'PUBLICADA', -- RASCUNHO, PUBLICADA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(mes, ano)
);

CREATE TABLE IF NOT EXISTS public.escala_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escala_id UUID NOT NULL REFERENCES public.escalas_mensais(id) ON DELETE CASCADE,
    equipe VARCHAR(40) NOT NULL,
    militar_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    dia_mes INT NOT NULL CHECK (dia_mes BETWEEN 1 AND 31),
    legenda_codigo VARCHAR(10) NOT NULL REFERENCES public.legendas_escala(codigo) ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(escala_id, militar_id, dia_mes)
);

-- 8. INDEXES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_registros_operacoes_data ON public.registros_operacoes(data_execucao);
CREATE INDEX IF NOT EXISTS idx_registros_operacoes_equipe ON public.registros_operacoes(equipe);
CREATE INDEX IF NOT EXISTS idx_alertas_homicidio_status ON public.alertas_homicidio(status);
CREATE INDEX IF NOT EXISTS idx_alertas_homicidio_risco ON public.alertas_homicidio(grau_risco);
CREATE INDEX IF NOT EXISTS idx_escala_itens_militar ON public.escala_itens(militar_id);

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_operacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_mensais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_operacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_homicidio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas_mensais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legendas_escala ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Simplificadas para Autenticação Flexível
CREATE POLICY "Permitir leitura para todos autenticados" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de operações" ON public.tipos_operacoes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de metas" ON public.metas_mensais FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de metas_equipes" ON public.metas_equipes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de registros_operacoes" ON public.registros_operacoes FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de alertas" ON public.alertas_homicidio FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de escalas" ON public.escalas_mensais FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de escala_itens" ON public.escala_itens FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de legendas" ON public.legendas_escala FOR SELECT USING (true);
