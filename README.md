# Motor de Currículo

Gera, para cada vaga do LinkedIn, um currículo ajustado (compatível com ATS) e uma carta de apresentação, organizados por pasta no Google Drive e editáveis no site.

- Site: https://selenrod.github.io/motor-de-curriculo (use Chrome ou Edge para gravar direto na pasta das vagas)
- Plano e decisões: [docs/PROJETO.md](docs/PROJETO.md)
- Passo a passo no terminal: [docs/TUTORIAL.md](docs/TUTORIAL.md)
- Regras para o Claude: [CLAUDE.md](CLAUDE.md) · comandos `/vaga` e `/refinar` em `.claude/commands/`
- Perguntas que cada experiência deve responder: [docs/principais-perguntas-curriculo.md](docs/principais-perguntas-curriculo.md)

## Estrutura

| Caminho | Função |
|---|---|
| `index.html`, `script.js`, `styles.css` | Site (HTML/CSS/JS puro, sem dependências externas) |
| `data/curriculo.base.json` | Currículo base |
| `data/banco-de-fatos.md` | Fatos confirmados e lacunas por experiência |
| `tools/render_pdf.py` | Gera os PDFs de uma pasta de vaga com o mesmo leiaute do site |

## Rodar localmente

```bash
python -m http.server 8000   # abra http://localhost:8000
```

## Privacidade

O repositório é público. Pastas de vagas, prints, cartas e PDFs ficam no Google Drive e não são versionados.
