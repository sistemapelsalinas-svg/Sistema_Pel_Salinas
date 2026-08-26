-- ==============================================================================
-- SISTEMA DE GESTÃO OPERACIONAL - PMMG
-- Seed de Dados Iniciais Oficiais do 2º Pelotão de Salinas
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

-- 2. CATÁLOGO DE NATUREZAS DE OPERAÇÕES DO 2º PELOTÃO
-- 2.1 POG
INSERT INTO public.tipos_operacoes (grupo, codigo_natureza, titulo, descricao, link_google_drive, requer_reds_origem, min_envolvidos, area_rural_obrigatoria) VALUES
('POG', 'Y04009', 'Trânsito Seguro', 'Fiscalização de trânsito rodoviário e urbano, abordagens a veículos e condutores.', 'https://drive.google.com', FALSE, 0, FALSE),
('POG', 'Y07001', 'Batida Policial', 'Ação tática e repressiva com foco na apreensão de armas, drogas e foragidos em pontos quentes.', 'https://drive.google.com', FALSE, 0, FALSE),
('POG', 'Y07002', 'Operação Presença', 'Posicionamento estratégico da viatura e patrulhamento a pé para dissuasão delitiva.', 'https://drive.google.com', FALSE, 0, FALSE),
('POG', 'Y07003', 'Incursão em ZQC', 'Ação qualificada em Zona Quente de Criminalidade para saturação e abordagens.', 'https://drive.google.com', FALSE, 0, FALSE),
('POG', 'Y07010', 'Divisas Seguras', 'Operação em corredores de acesso e divisas municipais/estaduais.', 'https://drive.google.com', FALSE, 0, FALSE),
('POG', 'Y07001-MBA', 'Cumprimento de Busca e Apreensão', 'Execução de Mandados Judiciais de Busca e Apreensão de Objetos/Armas/Animais.', 'https://drive.google.com', FALSE, 0, FALSE),

-- 2.2 POLICIAMENTO DE PROXIMIDADE
('PROXIMIDADE', 'Y15001', 'Patrulha Escolar / PROERD', 'Ações de segurança e prevenção em educandários e mediações escolares.', 'https://drive.google.com', FALSE, 0, FALSE),
('PROXIMIDADE', 'Y15010', 'Patrulha Rural', 'Patrulhamento preventivo, cadastramento de propriedades e visitas na zona rural.', 'https://drive.google.com', FALSE, 0, TRUE),
('PROXIMIDADE', 'Y15020', 'GEPAR', 'Grupo Especializado de Policiamento em Áreas de Risco.', 'https://drive.google.com', FALSE, 0, FALSE),
('PROXIMIDADE', 'Y15052', 'BSC - Base de Segurança Comunitária', 'Ponto focal comunitário, atendimento ao cidadão e registro imediato.', 'https://drive.google.com', FALSE, 0, FALSE),
('PROXIMIDADE', 'A20003', 'RPPM - Rede de Proteção Preventiva', 'Visitas e contatos com integrantes da Rede de Proteção Preventiva Mulher.', 'https://drive.google.com', FALSE, 0, FALSE),
('PROXIMIDADE', 'A20014', 'RPPM - Ronda e Acompanhamento', 'Ronda preventiva e fiscalização de medidas protetivas de urgência.', 'https://drive.google.com', FALSE, 0, FALSE),

-- 2.3 INTERAÇÕES COMUNITÁRIAS
('INTERACOES_COMUNITARIAS', 'A21.007', 'VCP — Visita Comunitária Preventiva', 'Contato com líder comunitário/morador. Mínimo 1 envolvido + orientações e demanda.', 'https://drive.google.com', FALSE, 1, FALSE),
('INTERACOES_COMUNITARIAS', 'A19.000', 'RC — Reunião Comunitária', 'Reunião formal com a comunidade. Mínimo 3 envolvidos + entidade, pauta e encaminhamentos.', 'https://drive.google.com', FALSE, 3, FALSE),
('INTERACOES_COMUNITARIAS', 'A19.001', 'RCR — Reunião Comunitária Rural', 'Reunião em comunidade rural. Mínimo 3 envolvidos + área rural obrigatória.', 'https://drive.google.com', FALSE, 3, TRUE),
('INTERACOES_COMUNITARIAS', 'A19.006', 'MRPP — Manutenção de Rede de Proteção', 'Encontro com integrantes de Redes Protegidas. Mínimo 3 membros + rede e providências.', 'https://drive.google.com', FALSE, 3, FALSE),
('INTERACOES_COMUNITARIAS', 'A20.028', 'VT — Visita Tranquilizadora (Furto)', 'Visita à vítima de furto para orientações de autoproteção. REDS DE FURTO OBRIGATÓRIO.', 'https://drive.google.com', TRUE, 1, FALSE),
('INTERACOES_COMUNITARIAS', 'A20.001', 'VTCV — Visita Tranquilizadora (Crime Violento)', 'Visita à vítima de crime violento (roubo/agressão grave). REDS CRIME VIOLENTO OBRIGATÓRIO.', 'https://drive.google.com', TRUE, 1, FALSE),

-- 2.4 ORDENS DE SERVIÇO (OS)
('ORDENS_SERVICO', 'OS 3.028/2025', 'Operação Visibilidade Institucional', 'Ordem de Serviço nº 3.028/2025 — Presença Ostensiva em pontos estratégicos de Salinas.', 'https://drive.google.com', FALSE, 0, FALSE),
('ORDENS_SERVICO', 'OS 3.038/2026', 'Enfrentamento a Homicídios (Bares e Similares)', 'Ordem de Serviço nº 3.038/2026-2ª Cia PM IND — Fiscalização qualificada em estabelecimentos de risco.', 'https://drive.google.com', FALSE, 0, FALSE),
('ORDENS_SERVICO', 'OS AGROGERAIS', 'Operação Agrogerais Segura', 'Ações coordenadas de segurança no campo, combate ao furto de gado e insumos agrícolas.', 'https://drive.google.com', FALSE, 0, TRUE);

-- 3. USUÁRIOS DE TESTE (SENHA INICIAL: 'pmmg1234' - primeiro acesso com troca)
-- Obs: Em ambiente de desenvolvimento local, o sistema aceita 'pmmg1234' ou a senha temporária gerada.
INSERT INTO public.profiles (numero_pm, nome_completo, nome_guerra, graduacao, whatsapp, password_hash, role, equipe_padrao, primeiro_acesso, ativo) VALUES
('100001-1', 'Leonardo Santos Silva', 'Ten Leonardo', 'Ten', '38999991001', '$2a$10$defaultHashPasswordPMMG', 'ADMIN', 'ADM', FALSE, TRUE),
('100002-2', 'Carlos Eduardo Moreira', 'Sgt Moreira', '2º Sgt', '38999991002', '$2a$10$defaultHashPasswordPMMG', 'SOF', 'SOF ALFA 1', FALSE, TRUE),
('100003-3', 'Juliana Pereira Ramos', 'Cb Juliana', 'Cb', '38999991003', '$2a$10$defaultHashPasswordPMMG', 'ALERTA_HOMICIDIO', 'RPPM', FALSE, TRUE),
('100004-4', 'Marcos Vinicius Costa', 'Sd Marcos', 'Sd', '38999991004', '$2a$10$defaultHashPasswordPMMG', 'EQUIPE', 'ALFA 1', FALSE, TRUE),
('100005-5', 'Rodrigo Alves Ferreira', 'Cb Rodrigo', 'Cb', '38999991005', '$2a$10$defaultHashPasswordPMMG', 'EQUIPE', 'BRAVO 1', TRUE, TRUE),
('100006-6', 'Antonio Carlos Dias', 'Sgt Dias', '3º Sgt', '38999991006', '$2a$10$defaultHashPasswordPMMG', 'EQUIPE', 'PATRULHA RURAL 1', FALSE, TRUE)
ON CONFLICT (numero_pm) DO NOTHING;

-- 4. EXEMPLOS DE ALERTAS DE HOMICÍDIO EM SALINAS
INSERT INTO public.alertas_homicidio (reds_numero, natureza_ocorrencia, data_fato, municipio, bairro, endereco_completo, autores, vitimas, grau_risco, avaliacao_cenario, acoes_preventivas_adotadas, status) VALUES
('2026-004589123-001', 'Ameaça de Morte / Desavença Tráfico', CURRENT_DATE - INTERVAL '2 days', 'Salinas', 'São Geraldo', 'Rua Bahia, nº 145', 'Lucas Silva (vulgo "Luquinhas do Morro")', 'Matheus Ribeiro (vulgo "Teteu")', 'CRITICO', 'Disputa territorial de ponto de venda de drogas no bairro São Geraldo. Histórico de ameaças reiteradas com ostentação de arma de fogo em redes sociais.', 'Patrulhamento intensificado pela equipe ALFA 1, abordagem qualificada ao autor e monitoramento constante do endereço da vítima.', 'ATIVO'),
('2026-003891456-001', 'Violência Doméstica / Descumprimento de Medida Protetiva', CURRENT_DATE - INTERVAL '4 days', 'Salinas', 'Centro', 'Av. Antônio Carlos, nº 500', 'Roberto Nonato', 'Amanda Cristina Duarte', 'ALTO', 'Ex-companheiro não aceita término da relação, proferiu ameaças graves com faca na residência da genitora da vítima.', 'Visita de acompanhamento pela equipe RPPM, reforço de ronda no horário de deslocamento da vítima ao trabalho.', 'ATIVO'),
('2026-002984125-001', 'Lesão Corporal / Briga Generalizada em Bar', CURRENT_DATE - INTERVAL '6 days', 'Salinas', 'Vila Nova', 'Rua Projetada A, Bar do Zé', 'Valdir Gomes e comparsas', 'Felipe Santos', 'MEDIO', 'Desentendimento por motivo fútil em estabelecimento com consumo excessivo de bebidas alcoólicas. Autor prometeu vingança.', 'Aplicação da OS 3.038/2026 com fiscalização de alvará e revista pessoal no estabelecimento.', 'CONTROLADO');
