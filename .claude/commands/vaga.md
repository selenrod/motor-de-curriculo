---
description: Processa prints de vagas do LinkedIn e cria, para cada vaga, a pasta com currículo ajustado (R0), carta e PDFs
argument-hint: [caminho do print ou pasta de prints; vazio = pasta _entrada] [--nivel base|competitivo|executivo]
---

Processe as vagas indicadas em: $ARGUMENTS
(Se vazio, use todos os prints novos da pasta `_entrada` dentro da pasta de vagas. `--nivel` força o conjunto de perguntas; sem ele, você escolhe pelo passo 3.)

Siga o `CLAUDE.md`, principalmente a regra de nunca inventar. Para **cada print**, em ordem:

1. **Pasta de vagas.** Leia `vagas-dir.local.txt`. Se não existir, pergunte o caminho (ex.: `G:\Meu Drive\Vagas`), grave no arquivo e continue.
2. **Ler o print** e extrair: empresa, cargo, local/modalidade, link (se visível), requisitos, responsabilidades e palavras-chave. Se o print estiver ilegível ou faltar empresa/cargo, pare e pergunte.
3. **Escolher o conjunto de perguntas** em `data/perguntas.json` (o nível de concorrência desta rodada), nesta ordem: (a) `--nivel`, se informado; (b) `executivo` se o cargo for de gerência, coordenação, head ou PMO; (c) `competitivo` se o print mostrar muita concorrência (ex.: 100 ou mais candidaturas) ou se a empresa/vaga for muito disputada; (d) senão, o `padrao` do arquivo. Se (b) e (c) valerem, use `executivo`. Registre a escolha e o motivo em uma linha para o resumo final.
4. **Criar a pasta** `AAAA-MM-DD_Empresa_Cargo` (data de hoje). Se já existir, não sobrescreva: avise e pergunte se é a mesma vaga.
5. **Gravar** `vaga.json` (status `Nova`, `conjuntoPerguntas` com o id escolhido), `vaga.md` (texto da vaga em Markdown, com os requisitos organizados) e mover o print para `print_vaga.png`.
6. **Cruzar** os requisitos da vaga com `data/banco-de-fatos.md` e `data/curriculo.base.json`. Monte duas listas: *tenho evidência* e *lacuna* (requisito sem fato confirmado). Nas 2 ou 3 experiências mais ligadas à vaga, liste também quais perguntas do conjunto escolhido ainda não têm resposta confirmada no banco de fatos.
7. **Criar `curriculo_R0.json`** a partir do base, ajustando apenas o permitido: `objetivo`, `resumo`, ordem e visibilidade de seções, ordem de itens em `atividades` e ênfase em `ferramentas`. Preserve `refino`. Não toque em datas, empresas, cargos, formação, cursos nem números.
8. **Escrever `carta_R0.md`** conforme o `CLAUDE.md`, usando só fatos confirmados.
9. **Gerar os PDFs:** `python tools/render_pdf.py --pasta "<pasta da vaga>"`. Confira com `pdftotext` que o texto é selecionável e que o currículo ficou em até 3 páginas.
10. **Resumir para o Roberto**, por vaga, em poucas linhas: pasta criada, conjunto de perguntas escolhido (e por quê), o que mudou no resumo, as evidências usadas na carta e as **lacunas** (requisitos sem fato confirmado) com a pergunta a fazer, e as perguntas do conjunto ainda sem resposta nas experiências mais relevantes.

Ao final: diga que ele pode revisar no site (selenrod.github.io/motor-de-curriculo → "Abrir pasta de vagas" → escolher a vaga), editar e salvar como R1. Se houver lacunas que enfraquecem a candidatura, sugira rodar `/refinar` para a experiência correspondente.
