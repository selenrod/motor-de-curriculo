# Plano do projeto — Motor de Currículo

## Objetivo
A partir do print de uma vaga do LinkedIn, produzir em minutos: (1) currículo com o resumo ajustado à vaga, (2) carta de apresentação, (3) PDFs prontos para ATS, tudo organizado por vaga no Google Drive e revisável no site.

## Fluxo
```
print da vaga ──► /vaga (Claude)
                   ├─ lê requisitos, cruza com data/banco-de-fatos.md
                   ├─ cria Vagas/AAAA-MM-DD_Empresa_Cargo/
                   │    vaga.json · vaga.md · print_vaga.png
                   │    curriculo_R0.json · carta_R0.md · PDFs R0
                   └─ informa lacunas (requisitos sem evidência)
site (Chrome/Edge) ◄── "Abrir pasta de vagas" → escolhe a vaga
   ├─ edita currículo e carta na própria página
   ├─ Salvar versão → curriculo_R1.json + carta_R1.md na mesma pasta
   └─ PDF (Salvar como PDF) → CV_..._R1.pdf / Carta_..._R1.pdf
/refinar (Claude) ──► entrevista → banco de fatos → currículo base
```

## Decisões
| Tema | Decisão | Motivo |
|---|---|---|
| Hospedagem | Site estático no GitHub Pages | Sem servidor; reaproveita o repositório atual |
| Dados do currículo | JSON único (`data/curriculo.base.json`) | Claude e site leem e gravam o mesmo formato |
| Dados por vaga | Cópia completa do currículo em `curriculo_R{n}.json` | Cada versão é autossuficiente e auditável |
| Integração com o Drive | Pasta do Drive para desktop + API de pastas do navegador (Chrome/Edge) | Sem OAuth nem backend; grava direto na pasta |
| PDF | Impressão do navegador (e `tools/render_pdf.py` com o mesmo leiaute) | Texto selecionável, necessário para ATS; geradores por imagem não servem |
| Edição | Campos editáveis no próprio documento (visão de componentes) | Substitui o formulário que só permitia adicionar |
| Versões | `R0` gerada pelo Claude; edições do site viram `R1`, `R2`… | Histórico por vaga, nada é sobrescrito |
| Refinamento | `/refinar` + aba Qualidade + `refino` por atividade | Preenche as perguntas sem inventar resultados |
| Perguntas | `data/perguntas.json` com conjuntos `base`, `competitivo` e `executivo`; o `/vaga` escolhe um por rodada | O nível de concorrência da vaga define o grau de exigência; as perguntas evoluem sem mexer no código |
| Projeto no Claude | Pacote em `docs/projeto-claude/` com as instruções e a lista de arquivos | Uso pelo chat e Cowork; o repositório continua sendo a fonte de verdade |
| Privacidade | Vagas, cartas e PDFs ficam no Drive, fora do repositório público | O repositório é aberto |

## Limites conhecidos
- Gravar direto na pasta só funciona em Chrome e Edge; em outros navegadores os arquivos são baixados.
- O navegador não entrega os bytes do PDF ao site; por isso o PDF sai pelo diálogo "Salvar como PDF" ou por `tools/render_pdf.py`.
- Resultados e números só entram depois de confirmados em `/refinar`.

## Pendências para o Roberto decidir
1. Fim do cargo de Trainee na ATVOS (hoje "07/2024 - Atual", com sobreposição ao cargo atual).
2. Nome de exibição: "Roberto Dorneles, PMP" (atual) ou o nome completo.
3. Rodar `/refinar` na experiência de Engenheiro de Planejamento | PMO (ATVOS) para incluir contexto, ações e resultados.
4. Endereço, telefone e e-mail do currículo base estão no repositório público; avaliar se mantém assim.

## Próximos passos possíveis
- Painel de acompanhamento das candidaturas (lê `vaga.json` de todas as pastas e mostra status).
- Índice `Vagas/_indice.md` gerado pelo `/vaga`, para abrir no Obsidian.
- Importar o currículo do LinkedIn para alimentar o banco de fatos.
