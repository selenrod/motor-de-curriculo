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

## Leitura estratégica da vaga (antes de escrever resumo e carta)
Resumo e carta nascem da vaga, não do currículo. Antes de escrever, registre em `vaga.md` uma seção `## Leitura estratégica` com:
1. **Dor central**: o problema que o gestor quer resolver ao contratar, em uma frase, com as palavras da vaga (ex.: Zenix: "projetos saem da rota e as decisões das reuniões não são executadas; falta previsibilidade no pipeline").
2. **Três requisitos decisivos**, em ordem de peso (o que eliminaria o candidato se faltasse), não a lista inteira.
3. **Tese de posicionamento**: uma frase dizendo por que o Roberto resolve essa dor (ex.: "PMO que tira a carteira do controle manual e dá visibilidade única e confiável para cobrar e decidir").
4. **Mapa requisito → evidência**: para cada requisito decisivo, o fato do banco de fatos que o prova (ou "lacuna").
5. **Vocabulário da vaga**: os termos que o texto deve reaproveitar (só onde há fato que sustente).

## Resumo (3 a 5 linhas), conforme `docs/principais-perguntas-curriculo.md`
O resumo é a resposta à dor central, não um resumo da carreira.
- **Linha 1, identidade na linguagem da vaga**: o papel que a vaga busca, sustentado por fatos (ex.: "PMO com foco em previsibilidade de carteira…"), não "Engenheiro de Produção com mais de 7 anos…" em toda vaga. Formação e PMP só na abertura se forem requisito decisivo.
- **Linha 2, o problema que resolve**, espelhando a dor central.
- **Linhas 3 e 4, uma ou duas provas**, escolhidas pelo mapa requisito → evidência, escritas como problema → ação → resultado. Não percorra empregadores em ordem cronológica.
- **Linha 5, diferencial ligado à vaga** (o que ele faz que outros candidatos à mesma vaga normalmente não fazem).
- **Primeira pessoa, com verbo de ação conjugado** (sujeito oculto, sem começar frases com "Eu"): passado para o que foi feito ("Implantei", "Coordenei", "Gerenciei", "Levantei", "Conduzi", "Estruturei"); presente para a função atual ("Gerencio", "Coordeno"). Cada frase deve mostrar o Roberto como protagonista que decidiu e agiu, não como quem cumpria tarefas: nada de "responsável por", "atuação em", "apoio a", "participação em" nem de terceira pessoa ("Atua", "Coordenou").
- **Evite**: abrir todas as vagas com a mesma frase; listar ferramentas entre parênteses; "perfil analítico", "engaja por influência" e outros adjetivos sem prova; citar todas as empresas; repetir o primeiro bullet do cargo atual.
- **Teste de troca**: se o resumo serviria igualmente para outra vaga da pasta, ele não está ajustado. Reescreva.

## Carta de apresentação (`carta_R0.md`)
- 250 a 320 palavras, 3 a 4 parágrafos, Markdown simples (o cabeçalho de contato é montado pelo site).
- Comece com "Prezados(as)," e termine com "Atenciosamente," e o nome.
- **Tom: confiante e formal, de quem pleiteia uma posição.** Fala com segurança sobre o que fez (afirma, não se justifica), mas reconhece que está se apresentando a quem decide: respeito sem bajulação, segurança sem arrogância. Escreva como uma pessoa escreveria a um gestor que admira, não como um relatório: frases de ritmo variado, transições naturais entre parágrafos, nada de listas disfarçadas de prosa, de dados empilhados (número, sigla e ferramenta na mesma frase) nem de fórmulas prontas ("Meu diferencial é…", "Algumas evidências ligadas aos requisitos…", "Fico à disposição para…" repetido em todas as cartas). Leia em voz alta: se soar como formulário, reescreva.
- A carta é um argumento: "vocês precisam de X; eu já fiz X aqui; é assim que eu trabalharia aí". Não é o currículo em prosa.
- **(1) A dor da empresa**: mostre que entendeu o desafio da posição, com as palavras da vaga, e ligue-o à tese de posicionamento. Nada de "Candidato-me à vaga de…" como primeira frase nem de elogio genérico à empresa.
- **(2) Duas evidências, no máximo três**, cada uma amarrada explicitamente a um requisito decisivo: situação → o que fez → resultado → por que isso responde ao requisito. Profundidade em vez de quantidade.
- **(3) Como atuaria na posição**: o diferencial (gestão de projetos + dados + melhoria contínua) traduzido para as responsabilidades da vaga, sem repetir as provas nem listar ferramentas, formação ou empregadores já citados.
- **(4) Fechamento** curto, com disponibilidade e um tema concreto para a conversa.
- **Evite**: citar todas as empresas do currículo; parágrafos que somam fatos com "também", "antes", "na mesma empresa"; frases como "o que se relaciona a…" e "o que conversa com…" (a ligação deve estar no próprio argumento).

## Perguntas que cada experiência deve responder (por rodada do /vaga)
As perguntas ficam em `data/perguntas.json`, em conjuntos por nível de concorrência. Cada rodada do `/vaga` escolhe **um** conjunto e grava o id em `vaga.json` (`conjuntoPerguntas`):
- `base` (padrão): contexto, problema, ação, como, resultado, por que importa (6 perguntas).
- `competitivo` (muitas candidaturas): base + escala, linha de base (antes → depois), stakeholders e evidência verificável.
- `executivo` (gerência, coordenação, PMO): competitivo + decisão de negócio, risco gerenciado e liderança de pessoas.

Cada atividade tem `refino` com uma chave por pergunta (`true` = respondida e confirmada; `false` = falta; `null` = não avaliada). Chaves de conjuntos não usados podem estar ausentes; ausente conta como não respondida.

**Para melhorar as perguntas:** edite `data/perguntas.json` (rótulo, texto de `entrevista`, ou quais perguntas entram em cada conjunto), aumente `versao`, acrescente uma linha em `historico` com o motivo e faça o commit. Para criar um novo nível, adicione um conjunto em `conjuntos` e descreva em `quando` o critério de uso. Nunca apague uma pergunta já usada em `refino` sem avisar o Roberto.

**Nível do texto:** o conjunto escolhido também define o registro do resumo e da carta. `base`: método, ferramenta e execução. `competitivo`: escala e antes → depois em primeiro plano. `executivo`: decisão de negócio, risco, governança e liderança de pessoas, com menos detalhe de ferramenta.

Texto das atividades (decidido pelo Roberto em 03/11/2026):
- Mesma regra de voz do resumo: primeira pessoa, verbo de ação conjugado no início ("Implantei", "Coordenei", "Levantei"; presente no cargo atual: "Gerencio"). Sem "Responsável por", "Atuação em", "Suporte na", rótulos como "Governança e Processos:" nem terceira pessoa.
- Cada item responde às perguntas do conjunto, com **termos técnicos usados com mais liberdade** do que no resumo (métodos, sistemas, indicadores, artefatos). Esses termos vêm das entrevistas do `/refinar` e ficam registrados no banco de fatos; não use termo técnico que o Roberto não tenha dito ou confirmado.

## Pendências conhecidas do currículo base (não corrija sem confirmar com o Roberto)
- Nome de exibição "Roberto Dorneles, PMP" no currículo; nome do arquivo "PAULO ROBERTO ALVES DORNELES".
- Resolvidas em 03/11/2026: período do Trainee ATVOS (07/2024 - 03/2026) e refino do Engenheiro de Planejamento | PMO (ver banco de fatos).

## Comandos úteis
- Gerar PDFs de uma vaga: `python tools/render_pdf.py --pasta "<pasta da vaga>"` (usa a versão mais recente; `--versao N` para outra).
- Testar o site localmente: `python -m http.server 8000` e abrir http://localhost:8000.

## Git
- Commits pequenos e descritivos, em português. Não commitar pastas de vagas, prints, cartas ou PDFs (o repositório é público).
- O `data/curriculo.base.json` já contém dados de contato do Roberto; alertar antes de incluir qualquer dado pessoal novo.
