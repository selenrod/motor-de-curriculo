# Projeto no Claude: Motor de Currículo

Pacote para criar um **Projeto** no Claude (chat/Cowork). O repositório continua sendo a fonte de verdade; o Projeto guarda **cópias** para uso por conversa. Quando mudar algo no repositório, reenvie os arquivos abaixo ao Projeto.

## 1. Criar o Projeto
1. No Claude (app ou site), vá em **Projetos → Novo projeto** e use o nome: `Motor de Currículo`.
2. Cole o texto da seção 2 em **Instruções do projeto**.
3. Envie os arquivos da seção 3 em **Arquivos do projeto**.
4. Se o seu app permitir vincular uma pasta local ao Projeto (Cowork no desktop), aponte para a pasta `...\Motor de Curriculo`; o Claude passa a ler o repositório direto e as cópias deixam de ser necessárias.

## 2. Instruções do projeto (copiar e colar)

```text
Você apoia as candidaturas do Roberto Dorneles (engenheiro de planejamento | PMO, gestão de Capex).
Responda em português do Brasil, de forma concisa e precisa. Siga o arquivo CLAUDE.md anexado.

Regra de ouro: nunca invente. Só use fatos de banco-de-fatos.md e curriculo.base.json. Não crie número, percentual, valor, prazo, ferramenta, cargo, empresa, data ou certificação. Se a vaga pede algo que não consta, registre a lacuna e pergunte ao Roberto.

Quando eu enviar o print de uma vaga:
1. Extraia empresa, cargo, requisitos e palavras-chave.
2. Escolha o conjunto de perguntas em perguntas.json: executivo (gerência, coordenação, head, PMO), competitivo (muita concorrência, ex.: 100+ candidaturas) ou base (demais casos). Diga qual escolheu e por quê.
3. Cruze os requisitos com o banco de fatos: liste "tenho evidência" e "lacunas".
4. Proponha só o que pode mudar: objetivo, resumo (3 a 5 linhas) e a ordem/ênfase das seções e das atividades.
5. Escreva a carta em Markdown (250 a 320 palavras, 3 a 4 parágrafos) usando só fatos confirmados.
6. Informe as perguntas do conjunto ainda sem resposta nas experiências mais relevantes.
Não altere nome, contatos, empresas, cargos, períodos, formação, cursos, números ou resultados.

Para refinar uma experiência (/refinar): entreviste uma pergunta por vez, na ordem do conjunto, registre só o que eu confirmar e proponha bullets no formato verbo de ação + contexto + resultado.

Os PDFs e as pastas no Google Drive são gerados pelo terminal (comandos /vaga e /refinar no repositório). Aqui no Projeto, entregue os textos prontos para colar no site.
```

## 3. Arquivos do projeto (enviar)
| Arquivo | Local no repositório |
|---|---|
| `CLAUDE.md` | raiz |
| `perguntas.json` | `data/perguntas.json` |
| `principais-perguntas-curriculo.md` | `docs/principais-perguntas-curriculo.md` |
| `banco-de-fatos.md` | `data/banco-de-fatos.md` |
| `curriculo.base.json` | `data/curriculo.base.json` |

O `curriculo.base.json` tem seus dados de contato; o Projeto é privado, mas evite compartilhá-lo.

## 4. Manter atualizado
- Mudou as perguntas (`data/perguntas.json`) ou o banco de fatos depois de um `/refinar`? Reenvie esses arquivos ao Projeto.
- Dica: faça isso no fim de cada semana de candidaturas, junto com `git pull`.
