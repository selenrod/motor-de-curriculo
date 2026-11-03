---
description: Entrevista o Roberto sobre uma experiência para preencher as perguntas do currículo (conjunto por nível de concorrência) e registrar resultados reais
argument-hint: [empresa/cargo; vazio = a experiência com mais lacunas] [--conjunto base|competitivo|executivo]
---

Refine a experiência: $ARGUMENTS
(Se vazio, escolha a atividade de `data/curriculo.base.json` com mais respostas faltando em `refino`; hoje é **ATVOS — Engenheiro de Planejamento | PMO**.)

Objetivo: transformar descrição de tarefas em evidência (ação + contexto + resultado verificável), **sem inventar nada**.

**Perguntas:** use o conjunto de `data/perguntas.json`: o de `--conjunto`, ou o `conjuntoPerguntas` da vaga em foco (`vaga.json`), ou o `padrao`. Cada pergunta do conjunto tem o texto de `entrevista` para você adaptar. A origem das perguntas está em `docs/principais-perguntas-curriculo.md`.

Como conduzir:
1. Leia `data/banco-de-fatos.md` e a atividade no `data/curriculo.base.json`. Mostre em 3 linhas o que já está confirmado e quais perguntas do conjunto estão sem resposta.
2. Pergunte **uma pergunta por vez** (no máximo duas relacionadas), na ordem do conjunto, em linguagem simples, com um exemplo do tipo de resposta esperada, adaptado a Capex/PMO (ex.: quantos projetos na carteira, valor de Capex, indicadores, ferramentas como MS Project e Power BI, números antes e depois).
3. Se o Roberto não souber o número exato, aceite faixa ou "aproximadamente", registrando como tal. Se não houver número, aceite um resultado qualitativo verificável (ex.: "passou a existir uma única visão consolidada da carteira"). Nunca preencha sozinho.
4. Ao terminar cada resposta, repita em uma linha o fato registrado e peça confirmação quando houver número.
5. No final:
   - Atualize `data/banco-de-fatos.md` com os fatos confirmados (data da confirmação e origem: "informado pelo Roberto").
   - Proponha 2 a 4 bullets no formato **verbo de ação + contexto + resultado** para `atividades[].itens` e mostre o texto antes de gravar.
   - Após a aprovação, grave em `data/curriculo.base.json` e atualize `refino` (`true` só nas perguntas do conjunto que foram respondidas; mantenha as chaves de outros conjuntos como estão).
   - Informe o que ainda falta e sugira continuar com a próxima experiência.

Não altere datas, cargos nem empresas. Se encontrar inconsistência (ex.: período do Trainee na ATVOS), pergunte e registre a decisão.
