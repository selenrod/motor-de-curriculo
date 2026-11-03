---
description: Entrevista o Roberto sobre uma experiência para preencher as seis perguntas do currículo e registrar resultados reais
argument-hint: [empresa/cargo; vazio = a experiência com mais lacunas]
---

Refine a experiência: $ARGUMENTS
(Se vazio, escolha a atividade de `data/curriculo.base.json` com mais respostas faltando em `refino`; hoje é **ATVOS — Engenheiro de Planejamento | PMO**.)

Objetivo: transformar descrição de tarefas em evidência (ação + contexto + resultado verificável), **sem inventar nada**. Use as seis perguntas de `docs/principais-perguntas-curriculo.md`.

Como conduzir:
1. Leia `data/banco-de-fatos.md` e a atividade no `data/curriculo.base.json`. Mostre em 3 linhas o que já está confirmado e quais das seis perguntas estão sem resposta.
2. Pergunte **uma pergunta por vez** (no máximo duas relacionadas), em linguagem simples, com um exemplo do tipo de resposta esperada. Para Capex/PMO, por exemplo:
   - Contexto: quantos projetos na carteira? valor total de Capex? quais áreas ou unidades?
   - Problema: o que estava fora de controle antes (atraso, desvio de custo, falta de visão consolidada, controles paralelos)?
   - Ação: o que você implantou ou passou a fazer (rito, indicador, cronograma integrado, painel)?
   - Como: ferramentas e métodos (MS Project, Power BI, EVM, curva S, caminho crítico…).
   - Resultado: números antes e depois (prazo, custo, tempo de relatório, aderência, nº de projetos no prazo).
   - Relevância: que tipo de vaga isso comprova?
3. Se o Roberto não souber o número exato, aceite faixa ou "aproximadamente", registrando como tal. Se não houver número, aceite um resultado qualitativo verificável (ex.: "passou a existir uma única visão consolidada da carteira"). Nunca preencha sozinho.
4. Ao terminar cada resposta, repita em uma linha o fato registrado e peça confirmação quando houver número.
5. No final:
   - Atualize `data/banco-de-fatos.md` com os fatos confirmados (data da confirmação e origem: "informado pelo Roberto").
   - Proponha 2 a 4 bullets no formato **verbo de ação + contexto + resultado** para `atividades[].itens` e mostre o texto antes de gravar.
   - Após a aprovação, grave em `data/curriculo.base.json` e atualize `refino` (`true` só nas perguntas respondidas).
   - Informe o que ainda falta e sugira continuar com a próxima experiência.

Não altere datas, cargos nem empresas. Se encontrar inconsistência (ex.: período do Trainee na ATVOS), pergunte e registre a decisão.
