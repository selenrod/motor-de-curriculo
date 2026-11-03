# Tutorial: Claude no terminal para o Motor de Currículo

Objetivo: transformar o print de uma vaga do LinkedIn em uma pasta no Google Drive com currículo ajustado, carta e PDFs, e revisar tudo no site.
Pressupõe plano pago do Claude (Pro, Max, Team ou Enterprise). Comandos para Windows (PowerShell); no Mac/Linux troque os caminhos.

## 1. Preparar uma vez

1. **Instalar o Claude Code** (PowerShell, sem precisar de administrador):
   ```powershell
   irm https://claude.ai/install.ps1 | iex
   ```
   Feche e abra o PowerShell, depois confira: `claude --version`.
   Mac/Linux: `curl -fsSL https://claude.ai/install.sh | bash`.
2. **Instalar Git e Python** (se ainda não tiver) e o gerador de PDF: `pip install playwright`.
3. **Pasta do projeto** (onde fica o código): `E:\Users\RobertoDorneles\Documents\PRD Consultoria\Curriculo Eng. Roberto Dorneles\Motor de Curriculo`.
   Ela deve ficar **fora do Google Drive** (Git dentro do Drive corrompe o repositório) e conter a última versão aprovada do repositório.
   - Pasta vazia ou ainda inexistente:
     ```powershell
     git clone https://github.com/selenrod/motor-de-curriculo "E:\Users\RobertoDorneles\Documents\PRD Consultoria\Curriculo Eng. Roberto Dorneles\Motor de Curriculo"
     ```
   - Pasta com arquivos antigos: renomeie-a para `Motor de Curriculo (antigo)` e rode o comando acima (o Git não clona sobre pasta com arquivos).
   - Já clonada: atualize com `git pull` dentro dela.
4. **Criar a pasta de vagas no Drive**: `G:\Meu Drive\Vagas` e dentro dela `_entrada`.
5. **Login**: dentro da pasta do projeto, rode `claude`; o navegador abre para autorizar sua conta. Para sair: `/exit`.

## 2. Abrir a sessão do projeto

```powershell
cd "E:\Users\RobertoDorneles\Documents\PRD Consultoria\Curriculo Eng. Roberto Dorneles\Motor de Curriculo"
claude --add-dir "G:\Meu Drive\Vagas" --permission-mode manual
```
- O Claude lê o `CLAUDE.md` sozinho (regras, formato das pastas, regra de nunca inventar).
- `--permission-mode manual` faz ele pedir sua aprovação antes de gravar ou rodar comandos. Nas versões atuais a sessão começa em modo automático, que edita sem perguntar; para aprender, prefira manual. `/rewind` desfaz alterações.
- Na primeira vez, diga o caminho da pasta de vagas; ele grava em `vagas-dir.local.txt`.

## 3. Fluxo de cada vaga

1. No LinkedIn, tire o print da vaga (empresa, cargo e requisitos visíveis) e salve em `G:\Meu Drive\Vagas\_entrada`.
2. Na sessão do Claude:
   ```text
   /vaga
   ```
   (ou `/vaga "G:\Meu Drive\Vagas\_entrada\vaga1.png"` para um print específico).
3. Para cada print ele cria a pasta `AAAA-MM-DD_Empresa_Cargo` com `vaga.json`, `vaga.md`, `print_vaga.png`, `curriculo_R0.json`, `carta_R0.md` e os dois PDFs R0.
4. Ele devolve um resumo: o que mudou no resumo, as evidências usadas na carta e as **lacunas** (requisitos sem fato confirmado). Responda ou rode `/refinar` para completar.

## 4. Revisar e ajustar no site

1. Abra https://selenrod.github.io/motor-de-curriculo no **Chrome ou Edge**.
2. **Abrir pasta de vagas** → escolha `G:\Meu Drive\Vagas` (fica lembrada).
3. Escolha a vaga na caixa de seleção. O currículo e a carta carregam na última versão.
4. Clique em qualquer texto para editar. Passe o mouse sobre um bloco para ver ↑ ↓ ✕ e ＋. Enter em um item cria o próximo. A aba **Seções** liga, desliga e reordena seções.
5. **Salvar versão** grava `curriculo_R1.json` e `carta_R1.md` na pasta da vaga (R2, R3… nas próximas).
6. **PDF do currículo** / **PDF da carta**: o navegador abre a impressão; escolha "Salvar como PDF" e salve na pasta da vaga. O nome já vem sugerido (`CV_..._R1`). Alternativa: peça ao Claude `python tools/render_pdf.py --pasta "<pasta>"`.

## 5. Refinar as perguntas do currículo

```text
/refinar ATVOS Engenheiro de Planejamento
```
O Claude entrevista você, uma pergunta por vez (contexto, problema, ação, como, resultado, relevância), registra só o que você confirmar em `data/banco-de-fatos.md`, propõe os bullets e atualiza o currículo base. A aba **Qualidade** do site mostra o que falta em cada experiência.
Depois de refinar, as próximas vagas já usam os resultados novos.

## 6. Publicar mudanças do site (quando mudar o código)

```powershell
git add -A
git commit -m "Descreva a mudança"
git push
```
O GitHub Pages atualiza em alguns minutos. **Não** versione pastas de vagas, prints, cartas nem PDFs (o repositório é público).

## 7. Comandos do dia a dia

| Comando | Para que serve |
|---|---|
| `/vaga` | Processa prints e cria as pastas das vagas |
| `/refinar` | Entrevista sobre uma experiência |
| `/clear` | Conversa nova (contexto vazio) |
| `/resume` ou `claude -c` | Retoma a conversa anterior |
| `/rewind` | Desfaz alterações de arquivos |
| `/model` | Troca o modelo |
| `/help` | Lista os comandos |
| `Shift+Tab` | Alterna o modo de permissão |
| `Esc` | Interrompe a resposta |

## 8. Problemas comuns

| Sintoma | Solução |
|---|---|
| `claude` não é reconhecido | Feche e reabra o PowerShell. Se persistir, inclua `%USERPROFILE%\.local\bin` no PATH do usuário. |
| Site não grava na pasta | Use Chrome ou Edge e clique em "Abrir pasta de vagas" de novo (pode pedir permissão). Em outros navegadores os arquivos são baixados. |
| Chrome recusa a pasta | Escolha uma subpasta (ex.: `Meu Drive\Vagas`), não a raiz do drive `G:\`. |
| Arquivo só na nuvem não abre | No Drive para desktop, marque a pasta como "Disponível off-line" ou use "Espelhar arquivos". |
| `render_pdf.py` não acha navegador | Instale o Chrome ou rode `playwright install chromium`. |
| Erro de login | `/logout`, feche e rode `claude` de novo. |

## 9. Alternativa sem terminal

No chat do Claude (app ou site), com o conector do Google Drive ligado, anexe o print e peça: "crie a pasta da vaga no meu Drive com currículo ajustado e carta". O chat segue as mesmas regras, mas não gera os PDFs de forma automática; para isso use o terminal ou os botões do site.
