# Motor de Currículo — instruções para o Claude

Projeto de candidaturas do Roberto Dorneles (engenheiro de planejamento, PMO, gestão de Capex).
Para cada vaga do LinkedIn, gerar um **currículo ajustado** e uma **carta de apresentação**, guardar tudo na pasta da vaga (Google Drive) e permitir revisão no site.
Responda sempre em português do Brasil, de forma concisa e precisa.

## Regra de ouro: nunca inventar
- Só use fatos de `data/banco-de-fatos.md` e `data/curriculo.base.json`.
- Nunca crie número, percentual, valor em R$, prazo, ferramenta, cargo, empresa, data ou certificação que não esteja nesses arquivos.
- Se a vaga pede algo que não consta (ex.: "experiência com Primavera P6"), **não afirme**. Registre a lacuna e pergunte ao Roberto.
- Palavras-chave da vaga só entram no texto se o Roberto realmente tem a experiência.
- Resultado ausente vira pergunta (`/refinar`), nunca estimativa.

## Arquitetura
- `index.html`, `script.js`, `styles.css`: site estático (GitHub Pages: selenrod.github.io/motor-de-curriculo). Currículo editável na própria página, seletor de vagas, versões R0, R1…, carta em Markdown, PDF pela impressão do navegador.
- `data/curriculo.base.json`: currículo base (ponto de partida de toda vaga).
- `data/banco-de-fatos.md`: fatos confirmados e lacunas por experiência.
- `data/perguntas.json`: conjuntos de perguntas por nível de concorrência (`base`, `competitivo`, `executivo`), com versão e histórico. É a fonte das perguntas usadas pelo site, pelo `/vaga` e pelo `/refinar`.
- `docs/principais-perguntas-curriculo.md`: origem e justificativa das perguntas.
- `tools/render_pdf.py`: gera os PDFs de uma pasta de vaga com o mesmo leiaute do site (texto selecionável, ATS).
- `.claude/commands/vaga.md` (`/vaga`) e `.claude/commands/refinar.md` (`/refinar`).

## Pasta de vagas (fora do repositório, no Google Drive)
O caminho está em `vagas-dir.local.txt` (raiz do repositório, não versionado). Se não existir, pergunte o caminho uma vez e grave nele.
**Nunca guarde repositório Git dentro do Drive; as vagas ficam no Drive, o código fica em outra pasta.**

```
Vagas/
  _entrada/                       prints novos de vagas (o /vaga processa e move)
  2026-11-02_Empresa_Cargo/
    vaga.json                     {empresa, cargo, link, status, conjuntoPerguntas, criadoEm, atualizadoEm, ultimaVersao}
    vaga.md                       texto da vaga extraído do print
    print_vaga.png                print original
    curriculo_R0.json             currículo completo desta vaga (mesmo formato do base)
    carta_R0.md                   carta em Markdown
    CV_<NOME>_<Empresa>_R0.pdf    gerado por tools/render_pdf.py
    Carta_<NOME>_<Empresa>_R0.pdf
```
- Nome da pasta: `AAAA-MM-DD_Empresa_Cargo`, sem acentos, com hífens nas palavras. Uma pasta por vaga.
- Versão = `R` + número. `R0` é a gerada pelo Claude. Cada edição salva no site cria `R1`, `R2`… Nunca sobrescreva uma versão existente.
- `vaga.json` guarda `status`: `Nova`, `Candidatura enviada`, `Em processo` ou `Encerrada`.

## O que pode mudar por vaga (em `curriculo_R0.json`)
Pode ajustar: `objetivo`, `resumo`, `secoes.ordem`, `secoes.ocultas`, a ordem dos itens dentro de `atividades` e a ênfase/ordem de `ferramentas`.
**Não altere:** nome, contatos, empresas, cargos, períodos, formação, cursos, números e resultados. Sem exceção.
Mantenha o formato ATS: texto simples, sem tabelas, sem imagens, sem colunas.

## Resumo (3 a 5 linhas), conforme `docs/principais-perguntas-curriculo.md`
Responde: quem é o profissional, em que contextos atua, qual problema resolve, como entrega valor, qual o diferencial. Sem "eu/meu/minha". Presente para o que faz hoje, passado para conquistas concluídas. Alinhado às palavras-chave reais da vaga.

## Carta de apresentação (`carta_R0.md`)
- 250 a 320 palavras, 3 a 4 parágrafos, Markdown simples (o cabeçalho de contato é montado pelo site).
- Estrutura: (1) vaga e motivo do interesse na empresa; (2) duas ou três evidências do banco de fatos ligadas aos requisitos da vaga; (3) diferencial (gestão de projetos + dados + melhoria contínua); (4) fechamento com disponibilidade.
- Comece com "Prezados(as)," e termine com "Atenciosamente," e o nome.
- Não repita o currículo; escolha as evidências mais ligadas à vaga.

## Perguntas que cada experiência deve responder (por rodada do /vaga)
As perguntas ficam em `data/perguntas.json`, em conjuntos por nível de concorrência. Cada rodada do `/vaga` escolhe **um** conjunto e grava o id em `vaga.json` (`conjuntoPerguntas`):
- `base` (padrão): contexto, problema, ação, como, resultado, por que importa (6 perguntas).
- `competitivo` (muitas candidaturas): base + escala, linha de base (antes → depois), stakeholders e evidência verificável.
- `executivo` (gerência, coordenação, PMO): competitivo + decisão de negócio, risco gerenciado e liderança de pessoas.

Cada atividade tem `refino` com uma chave por pergunta (`true` = respondida e confirmada; `false` = falta; `null` = não avaliada). Chaves de conjuntos não usados podem estar ausentes; ausente conta como não respondida.

**Para melhorar as perguntas:** edite `data/perguntas.json` (rótulo, texto de `entrevista`, ou quais perguntas entram em cada conjunto), aumente `versao`, acrescente uma linha em `historico` com o motivo e faça o commit. Para criar um novo nível, adicione um conjunto em `conjuntos` e descreva em `quando` o critério de uso. Nunca apague uma pergunta já usada em `refino` sem avisar o Roberto.

## Pendências conhecidas do currículo base (não corrija sem confirmar com o Roberto)
- ATVOS: o cargo de Trainee está como "07/2024 - Atual" e o de Engenheiro de Planejamento como "04/2026 - Atual" (sobreposição).
- Nome de exibição "Roberto Dorneles, PMP" no currículo; nome do arquivo "PAULO ROBERTO ALVES DORNELES".
- Engenheiro de Planejamento | PMO na ATVOS: só há uma frase, sem contexto, ação detalhada ou resultados. Prioridade do `/refinar`.

## Comandos úteis
- Gerar PDFs de uma vaga: `python tools/render_pdf.py --pasta "<pasta da vaga>"` (usa a versão mais recente; `--versao N` para outra).
- Testar o site localmente: `python -m http.server 8000` e abrir http://localhost:8000.

## Git
- Commits pequenos e descritivos, em português. Não commitar pastas de vagas, prints, cartas ou PDFs (o repositório é público).
- O `data/curriculo.base.json` já contém dados de contato do Roberto; alertar antes de incluir qualquer dado pessoal novo.
