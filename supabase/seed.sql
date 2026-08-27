-- ==============================================================================
-- SISTEMA DE GESTÃO OPERACIONAL - PMMG
-- 2º PELOTÃO / 2ª CIA PM IND / 11ª RPM - SALINAS/MG
-- Seed Oficial Limpo (Apenas Naturezas, Legendas e Conta Admin Inicial)
-- ==============================================================================

-- 1. LEGENDAS DE ESCALA PADRÃO PMMG
INSERT INTO public.legendas_escala (codigo, descricao, conta_como_servico, cor_badge) VALUES
('S', 'Serviço Operacional / Turno Normal', TRUE, 'bg-emerald-600 text-white'),
('SN', 'Serviço Noturno', TRUE, 'bg-blue-600 text-white'),
('F', 'Folga', FALSE, 'bg-slate-600 text-slate-200'),
('FA', 'Férias Anuais', FALSE, 'bg-amber-600 text-white'),
('L', 'Licença Especial / Saúde', FALSE, 'bg-purple-600 text-white'),
('DISP', 'Dispensa Recompensa / Administrativa', FALSE, 'bg-indigo-600 text-white'),
('CUR', 'Curso / Treinamento', TRUE, 'bg-teal-600 text-white'),
('A', 'Atestado Médico', FALSE, 'bg-rose-600 text-white')
ON CONFLICT (codigo) DO NOTHING;

-- 2. CATÁLOGO OFICIAL DE NATUREZAS DE OPERAÇÕES DO 2º PELOTÃO
INSERT INTO public.tipos_operacoes (grupo, codigo_natureza, titulo, descricao, link_google_drive, requer_reds_origem, min_envolvidos, area_rural_obrigatoria, ativo) VALUES
-- 2.1 POG
('POG', 'Y04009', 'Trânsito Seguro', 'Fiscalização de trânsito rodoviário e urbano, abordagens a veículos e condutores.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('POG', 'Y07001', 'Batida Policial', 'Ação tática e repressiva com foco na apreensão de armas, drogas e foragidos em pontos quentes.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('POG', 'Y07002', 'Operação Presença', 'Posicionamento estratégico da viatura e patrulhamento a pé para dissuasão delitiva.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('POG', 'Y07003', 'Incursão em ZQC', 'Ação qualificada em Zona Quente de Criminalidade para saturação e abordagens.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('POG', 'Y07010', 'Divisas Seguras', 'Operação em corredores de acesso e divisas municipais/estaduais.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('POG', 'Y07001-MBA', 'Cumprimento de Busca e Apreensão', 'Execução de Mandados Judiciais de Busca e Apreensão de Objetos/Armas/Animais.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),

-- 2.2 POLICIAMENTO DE PROXIMIDADE
('PROXIMIDADE', 'Y15001', 'Patrulha Escolar / PROERD', 'Ações de segurança e prevenção em educandários e mediações escolares.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('PROXIMIDADE', 'Y15010', 'Patrulha Rural', 'Patrulhamento preventivo, cadastramento de propriedades e visitas na zona rural.', 'https://drive.google.com', FALSE, 0, TRUE, TRUE),
('PROXIMIDADE', 'Y15020', 'GEPAR', 'Grupo Especializado de Policiamento em Áreas de Risco.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('PROXIMIDADE', 'Y15052', 'BSC - Base de Segurança Comunitária', 'Ponto focal comunitário, atendimento ao cidadão e registro imediato.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('PROXIMIDADE', 'A20003', 'RPPM - Rede de Proteção Preventiva', 'Visitas e contatos com integrantes da Rede de Proteção Preventiva Mulher.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('PROXIMIDADE', 'A20014', 'RPPM - Ronda e Acompanhamento', 'Ronda preventiva e fiscalização de medidas protetivas de urgência.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),

-- 2.3 INTERAÇÕES COMUNITÁRIAS
('INTERACOES_COMUNITARIAS', 'A21.007', 'VCP — Visita Comunitária Preventiva', 'Contato com líder comunitário/morador. Mínimo 1 envolvido + orientações e demanda.', 'https://drive.google.com', FALSE, 1, FALSE, TRUE),
('INTERACOES_COMUNITARIAS', 'A19.000', 'RC — Reunião Comunitária', 'Reunião formal com a comunidade. Mínimo 3 envolvidos + entidade, pauta e encaminhamentos.', 'https://drive.google.com', FALSE, 3, FALSE, TRUE),
('INTERACOES_COMUNITARIAS', 'A19.001', 'RCR — Reunião Comunitária Rural', 'Reunião em comunidade rural. Mínimo 3 envolvidos + área rural obrigatória.', 'https://drive.google.com', FALSE, 3, TRUE, TRUE),
('INTERACOES_COMUNITARIAS', 'A19.006', 'MRPP — Manutenção de Rede de Proteção', 'Encontro com integrantes de Redes Protegidas. Mínimo 3 membros + rede e providências.', 'https://drive.google.com', FALSE, 3, FALSE, TRUE),
('INTERACOES_COMUNITARIAS', 'A20.028', 'VT — Visita Tranquilizadora (Furto)', 'Visita à vítima de furto para orientações de autoproteção. REDS DE FURTO OBRIGATÓRIO.', 'https://drive.google.com', TRUE, 1, FALSE, TRUE),
('INTERACOES_COMUNITARIAS', 'A20.001', 'VTCV — Visita Tranquilizadora (Crime Violento)', 'Visita à vítima de crime violento (roubo/agressão grave). REDS CRIME VIOLENTO OBRIGATÓRIO.', 'https://drive.google.com', TRUE, 1, FALSE, TRUE),

-- 2.4 ORDENS DE SERVIÇO (OS)
('ORDENS_SERVICO', 'OS 3.028/2025', 'Operação Visibilidade Institucional', 'Ordem de Serviço nº 3.028/2025 — Presença Ostensiva em pontos estratégicos de Salinas.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('ORDENS_SERVICO', 'OS 3.038/2026', 'Enfrentamento a Homicídios (Bares e Similares)', 'Ordem de Serviço nº 3.038/2026-2ª Cia PM IND — Fiscalização qualificada em estabelecimentos de risco.', 'https://drive.google.com', FALSE, 0, FALSE, TRUE),
('ORDENS_SERVICO', 'OS AGROGERAIS', 'Operação Agrogerais Segura', 'Ações coordenadas de segurança no campo, combate ao furto de gado e insumos agrícolas.', 'https://drive.google.com', FALSE, 0, TRUE, TRUE);

-- 3. ÚNICO USUÁRIO ADMINISTRADOR INICIAL (Sgt André Santos)
-- Senha inicial padrão: 'pmmg1234' (com alteração solicitada ou permitida no primeiro acesso)
INSERT INTO public.profiles (numero_pm, nome_completo, nome_guerra, graduacao, whatsapp, password_hash, role, equipe_padrao, primeiro_acesso, ativo) VALUES
('1578426', 'André Santos', 'Sgt André Santos', '3º Sgt', '38999990001', 'pmmg1234', 'ADMIN', 'ADM', FALSE, TRUE)
ON CONFLICT (numero_pm) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    nome_guerra = EXCLUDED.nome_guerra,
    graduacao = EXCLUDED.graduacao,
    role = 'ADMIN',
    ativo = TRUE;
