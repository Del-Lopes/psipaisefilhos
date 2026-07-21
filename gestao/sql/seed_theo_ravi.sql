-- ============================================================================
--  SEED (dados de teste) — Gêmeos Theo e Ravi (caso real de avaliação)
--  Popula: pacientes, responsáveis, 8 sessões (avaliação, domiciliares),
--  evolução clínica por sessão, indicadores + pontuações, e objetivos.
--
--  Requer: SQLs 00→07 já rodados. Idempotente (limpa e reinsere pelo nome).
--  Como usar: Supabase > SQL Editor > New query > colar tudo > Run.
--  IMPORTANTE: rode LOGADA/vinculada ao usuário dono — o script pega o 1º
--  usuário de auth.users como owner. Se houver mais de um usuário, ajuste
--  o WHERE em v_owner abaixo para o e-mail correto.
-- ============================================================================

do $$
declare
  v_owner   uuid;
  v_theo    uuid;
  v_ravi    uuid;
  -- 8ª (última) sessão ~ semana passada; recua semanalmente.
  v_base    timestamptz := (now()::date - interval '7 days') + time '10:00';
  s_theo    uuid[];
  s_ravi    uuid[];
  v_sid     uuid;
  i         int;
  -- indicadores (por criança)
  ind_voc_t uuid; ind_aut_t uuid; ind_soc_t uuid; ind_mot_t uuid; ind_reg_t uuid;
  ind_voc_r uuid; ind_aut_r uuid; ind_soc_r uuid; ind_mot_r uuid;
begin
  -- 0. Descobre o dono (ajuste o WHERE se tiver múltiplos usuários) --------
  select id into v_owner from auth.users order by created_at asc limit 1;
  if v_owner is null then
    raise exception 'Nenhum usuário em auth.users. Crie o usuário no painel primeiro.';
  end if;

  -- Limpa dados anteriores deste seed (por nome), para reexecução limpa.
  delete from public.patients
   where owner_id = v_owner and nome in ('Theo (gêmeo)', 'Ravi (gêmeo)');

  -- 1. Pacientes -----------------------------------------------------------
  -- ~1 ano e 2 meses (14 meses): nascimento ~14 meses atrás.
  insert into public.patients (owner_id, nome, data_nascimento, sexo, escola, ano_escolar, queixa_inicial, observacoes, status)
  values (
    v_owner, 'Theo (gêmeo)', (now()::date - interval '14 months')::date, 'M', null, null,
    'Avaliação do desenvolvimento (14 meses). Gêmeo. Comportamento de bater a cabeça no chão/parede (contrariedade e busca de atenção); vocalização em emergência.',
    'Sessões domiciliares. Gêmeo de Ravi. Colaborativo. Vocaliza mais que o irmão (predomínio de "tetete"). Reconhece e imita sentimentos ("bravo"/"feliz"), faz sons de animais. Socioemocional preservado (afeto com pelúcia ao fim das sessões).',
    'ativo'
  ) returning id into v_theo;

  insert into public.patients (owner_id, nome, data_nascimento, sexo, escola, ano_escolar, queixa_inicial, observacoes, status)
  values (
    v_owner, 'Ravi (gêmeo)', (now()::date - interval '14 months')::date, 'M', null, null,
    'Avaliação do desenvolvimento (14 meses). Gêmeo. Desenvolvimento dentro do esperado; foco em estimular autonomia e linguagem.',
    'Sessões domiciliares. Gêmeo de Theo. Colaborativo. A partir da 5ª sessão passou a demonstrar mais independência (prefere explorar e descobrir sozinho). Facilidade com blocos e encaixes. Reconhece/imita sentimentos, faz sons de animais.',
    'ativo'
  ) returning id into v_ravi;

  -- 2. Responsáveis (mãe, pai, babá) para cada criança ---------------------
  insert into public.guardians (owner_id, patient_id, nome, parentesco, is_pagante) values
    (v_owner, v_theo, 'Mãe',  'mãe',  true),
    (v_owner, v_theo, 'Pai',  'pai',  false),
    (v_owner, v_theo, 'Babá', 'babá', false),
    (v_owner, v_ravi, 'Mãe',  'mãe',  true),
    (v_owner, v_ravi, 'Pai',  'pai',  false),
    (v_owner, v_ravi, 'Babá', 'babá', false);

  -- 3. 8 sessões de avaliação (semanais, realizadas) por criança -----------
  s_theo := array[]::uuid[];
  s_ravi := array[]::uuid[];
  for i in 1..8 loop
    insert into public.sessions (owner_id, patient_id, inicio, duracao_min, status, valor, observacoes)
    values (v_owner, v_theo, v_base - ((8 - i) || ' weeks')::interval, 50, 'realizada', null,
            'Sessão ' || i || ' de avaliação — domiciliar.')
    returning id into v_sid;
    s_theo := s_theo || v_sid;

    insert into public.sessions (owner_id, patient_id, inicio, duracao_min, status, valor, observacoes)
    values (v_owner, v_ravi, v_base - ((8 - i) || ' weeks')::interval, 50, 'realizada', null,
            'Sessão ' || i || ' de avaliação — domiciliar.')
    returning id into v_sid;
    s_ravi := s_ravi || v_sid;
  end loop;

  -- 4. Evolução clínica (session_notes) — pontos-chave do relato ----------
  -- Theo
  insert into public.session_notes (session_id, owner_id, conteudo) values
    (s_theo[1], v_owner, 'Sessão inicial de avaliação, domiciliar, com mãe e babá presentes. Theo colaborativo, aceita as atividades propostas. Rotina combinada: sentar-se para brincar a cada novo brinquedo.'),
    (s_theo[2], v_owner, 'Vocalizações frequentes, predomínio de "tetete". Reconhece expressões emocionais e imita "bravo" e "feliz". Faz sons de animais.'),
    (s_theo[3], v_owner, 'Atividades: bolinha de sabão e pintura com giz de cera (coordenação motora fina, atenção compartilhada). Bom engajamento.'),
    (s_theo[4], v_owner, 'Boliche e argolas de encaixe com turnos ("a vez de cada um"): trabalho de espera e autorregulação. Pai passa a participar a partir desta fase.'),
    (s_theo[5], v_owner, 'Observado comportamento de bater a cabeça no chão/parede, tanto ao ser contrariado quanto para chamar atenção. Registrado para plano de intervenção.'),
    (s_theo[6], v_owner, 'Ao fim da sessão, entrega de pelúcia para "tchau": Theo demonstra afeto (beijos, faz "dormir") — socioemocional preservado. Orientação parental sobre o bater a cabeça.'),
    (s_theo[7], v_owner, 'Trabalho de vínculo com a figura paterna nas atividades. Relato dos pais sobre recusa/choro na troca de fralda — orientado manejo.'),
    (s_theo[8], v_owner, 'Encerramento da fase de avaliação. Marcos de 12–18 meses majoritariamente presentes; linguagem expressiva a estimular. Encaminhado para fase de intervenção.');
  -- Ravi
  insert into public.session_notes (session_id, owner_id, conteudo) values
    (s_ravi[1], v_owner, 'Sessão inicial de avaliação, domiciliar, com mãe e babá. Ravi colaborativo, aceita bem as atividades. Rotina de sentar-se para cada novo brinquedo combinada.'),
    (s_ravi[2], v_owner, 'Reconhece e imita sentimentos ("bravo"/"feliz"), faz sons de animais. Vocaliza um pouco menos que o irmão.'),
    (s_ravi[3], v_owner, 'Bolinha de sabão e pintura com giz de cera. Boa coordenação; demonstra facilidade com blocos e encaixes.'),
    (s_ravi[4], v_owner, 'Argolas de encaixe com turnos e boliche: espera a vez, boa autorregulação. Pai passa a participar a partir desta fase.'),
    (s_ravi[5], v_owner, 'Passa a demonstrar mais independência: pega os brinquedos oferecidos mas prefere brincar sozinho e descobrir sozinho como fazer, em vez de ser ensinado.'),
    (s_ravi[6], v_owner, 'Autonomia exploratória mantida. Pelúcia de "tchau": demonstra afeto (beijos, faz "dormir") — socioemocional preservado.'),
    (s_ravi[7], v_owner, 'Vínculo com a figura paterna trabalhado nas atividades. Relato dos pais sobre recusa/choro na troca de fralda — orientado manejo.'),
    (s_ravi[8], v_owner, 'Encerramento da avaliação. Marcos de 12–18 meses presentes; forte no motor fino (encaixes). Linguagem a estimular. Encaminhado para intervenção.');

  -- 5. Indicadores + pontuações por sessão (0–10) -------------------------
  -- Theo
  insert into public.indicators (owner_id, patient_id, nome, escala_min, escala_max, cor)
    values (v_owner, v_theo, 'Vocalização/Linguagem', 0, 10, '#F28E6F') returning id into ind_voc_t;
  insert into public.indicators (owner_id, patient_id, nome, escala_min, escala_max, cor)
    values (v_owner, v_theo, 'Autonomia', 0, 10, '#4B5945') returning id into ind_aut_t;
  insert into public.indicators (owner_id, patient_id, nome, escala_min, escala_max, cor)
    values (v_owner, v_theo, 'Socioemocional', 0, 10, '#AEC370') returning id into ind_soc_t;
  insert into public.indicators (owner_id, patient_id, nome, escala_min, escala_max, cor)
    values (v_owner, v_theo, 'Coordenação motora', 0, 10, '#FFD55D') returning id into ind_mot_t;
  insert into public.indicators (owner_id, patient_id, nome, escala_min, escala_max, cor)
    values (v_owner, v_theo, 'Autorregulação', 0, 10, '#8DA15A') returning id into ind_reg_t;

  -- Ravi
  insert into public.indicators (owner_id, patient_id, nome, escala_min, escala_max, cor)
    values (v_owner, v_ravi, 'Vocalização/Linguagem', 0, 10, '#F28E6F') returning id into ind_voc_r;
  insert into public.indicators (owner_id, patient_id, nome, escala_min, escala_max, cor)
    values (v_owner, v_ravi, 'Autonomia', 0, 10, '#4B5945') returning id into ind_aut_r;
  insert into public.indicators (owner_id, patient_id, nome, escala_min, escala_max, cor)
    values (v_owner, v_ravi, 'Socioemocional', 0, 10, '#AEC370') returning id into ind_soc_r;
  insert into public.indicators (owner_id, patient_id, nome, escala_min, escala_max, cor)
    values (v_owner, v_ravi, 'Coordenação motora', 0, 10, '#FFD55D') returning id into ind_mot_r;

  -- Pontuações por sessão (i=1..8). Refletem o relato:
  -- Theo: vocalização ligeiramente maior; autorregulação cai na 5ª (bater a cabeça) e melhora com intervenção.
  -- Ravi: autonomia sobe a partir da 5ª sessão; motor fino forte.
  for i in 1..8 loop
    -- Theo
    insert into public.indicator_scores (owner_id, indicator_id, session_id, valor) values
      (v_owner, ind_voc_t, s_theo[i], least(10.0, 4 + i*0.4)),                        -- linguagem sobe devagar
      (v_owner, ind_aut_t, s_theo[i], least(10.0, 4 + i*0.3)),
      (v_owner, ind_soc_t, s_theo[i], least(10.0, 6 + i*0.3)),                        -- socioemocional forte
      (v_owner, ind_mot_t, s_theo[i], least(10.0, 5 + i*0.3)),
      (v_owner, ind_reg_t, s_theo[i], case when i < 5 then 6.0 when i = 5 then 3.0 else 3.0 + (i-5)*1.3 end); -- cai na 5ª, recupera
    -- Ravi
    insert into public.indicator_scores (owner_id, indicator_id, session_id, valor) values
      (v_owner, ind_voc_r, s_ravi[i], least(10.0, 3.5 + i*0.35)),
      (v_owner, ind_aut_r, s_ravi[i], case when i < 5 then 5.0 else least(10.0, 5.0 + (i-4)*1.1) end), -- salta na 5ª
      (v_owner, ind_soc_r, s_ravi[i], least(10.0, 6 + i*0.3)),
      (v_owner, ind_mot_r, s_ravi[i], least(10.0, 6 + i*0.4));                        -- motor fino forte
  end loop;

  -- 6. Objetivos terapêuticos (fase de intervenção) -----------------------
  insert into public.goals (owner_id, patient_id, titulo, descricao, status, ordem) values
    (v_owner, v_theo, 'Reduzir comportamento de bater a cabeça', 'Intervenção para o comportamento de bater a cabeça (contrariedade e busca de atenção): compreender função do comportamento e ensinar respostas alternativas.', 'em_andamento', 1),
    (v_owner, v_theo, 'Ampliar linguagem expressiva', 'Estimular vocabulário além de "tetete"; nomeação e imitação de sons.', 'em_andamento', 2),
    (v_owner, v_theo, 'Manejo da troca de fralda', 'Reduzir recusa/choro na troca de fralda com antecipação e rotina lúdica.', 'em_andamento', 3),
    (v_owner, v_theo, 'Fortalecer vínculo com a figura paterna', 'Atividades conjuntas com o pai para fortalecer o vínculo.', 'em_andamento', 4),
    (v_owner, v_ravi, 'Estimular linguagem expressiva', 'Ampliar vocalizações e nomeação, aproveitando o bom engajamento.', 'em_andamento', 1),
    (v_owner, v_ravi, 'Canalizar a autonomia', 'Aproveitar a independência crescente com desafios graduais, mantendo espaços de aprendizagem guiada.', 'em_andamento', 2),
    (v_owner, v_ravi, 'Manejo da troca de fralda', 'Reduzir recusa/choro na troca de fralda com antecipação e rotina lúdica.', 'em_andamento', 3),
    (v_owner, v_ravi, 'Fortalecer vínculo com a figura paterna', 'Atividades conjuntas com o pai para fortalecer o vínculo.', 'em_andamento', 4);

  raise notice 'Seed concluído. Theo=% Ravi=% (owner=%)', v_theo, v_ravi, v_owner;
end $$;
