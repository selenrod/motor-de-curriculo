#!/usr/bin/env python3
"""Gera os PDFs (currículo e carta) de uma vaga a partir dos arquivos da pasta.

O PDF sai da mesma página do site (impressão do Chrome), então o texto é
selecionável e o leiaute é o mesmo que você vê no navegador (compatível com ATS).

Uso:
  python tools/render_pdf.py --pasta "G:/Meu Drive/Vagas/2026-11-02_Empresa_Cargo"
  python tools/render_pdf.py --pasta "<pasta da vaga>" --versao 1
  python tools/render_pdf.py --base --saida ./saida          # currículo base

Requisitos (uma vez):  pip install playwright
Navegador: usa o Chrome ou o Edge instalados; se não houver, rode  playwright install chromium
"""
import argparse
import functools
import http.server
import json
import re
import socketserver
import threading
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def slug(s: str) -> str:
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-")


def versoes(pasta: Path):
    nums = set()
    for f in pasta.iterdir():
        m = re.fullmatch(r"(?:curriculo|carta)_R(\d+)\.(?:json|md)", f.name)
        if m:
            nums.add(int(m.group(1)))
    return sorted(nums)


def mais_proxima(pasta: Path, prefixo: str, ext: str, n: int):
    for k in range(n, -1, -1):
        f = pasta / f"{prefixo}_R{k}.{ext}"
        if f.exists():
            return f
    return None


def servidor():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(RAIZ))
    handler.log_message = lambda *a, **k: None  # silencioso
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def abrir_navegador(p):
    for canal in ("chrome", "msedge", None):
        try:
            return p.chromium.launch(channel=canal) if canal else p.chromium.launch()
        except Exception:
            continue
    try:  # ambientes Linux sem canal registrado
        return p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    except Exception as e:
        raise SystemExit(f"Nenhum navegador encontrado ({e}). Instale o Chrome ou rode: playwright install chromium")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pasta", help="pasta da vaga (com curriculo_R*.json e carta_R*.md)")
    ap.add_argument("--versao", type=int, help="número da versão (padrão: a mais recente)")
    ap.add_argument("--base", action="store_true", help="gera o currículo base (data/curriculo.base.json)")
    ap.add_argument("--saida", help="pasta de saída (padrão: a própria pasta da vaga)")
    args = ap.parse_args()

    meta, carta, n = {}, "", None
    if args.base:
        cv = json.loads((RAIZ / "data" / "curriculo.base.json").read_text(encoding="utf-8"))
        saida = Path(args.saida or ".")
    elif args.pasta:
        pasta = Path(args.pasta)
        if not pasta.is_dir():
            raise SystemExit(f"Pasta não encontrada: {pasta}")
        vs = versoes(pasta)
        if not vs:
            raise SystemExit("A pasta não tem curriculo_R*.json nem carta_R*.md.")
        n = args.versao if args.versao is not None else vs[-1]
        fj = mais_proxima(pasta, "curriculo", "json", n)
        fc = mais_proxima(pasta, "carta", "md", n)
        if not fj:
            raise SystemExit(f"Não há curriculo_R{n}.json (nem versão anterior).")
        cv = json.loads(fj.read_text(encoding="utf-8"))
        carta = fc.read_text(encoding="utf-8") if fc else ""
        if (pasta / "vaga.json").exists():
            meta = json.loads((pasta / "vaga.json").read_text(encoding="utf-8"))
        saida = Path(args.saida) if args.saida else pasta
    else:
        ap.error("informe --pasta ou --base")

    saida.mkdir(parents=True, exist_ok=True)
    partes = [cv.get("nomeArquivo") or "CURRICULO"]
    if meta.get("empresa"):
        partes.append(slug(meta["empresa"]))
    if n is not None:
        partes.append(f"R{n}")
    sufixo = "_".join(partes)

    from playwright.sync_api import sync_playwright

    httpd = servidor()
    url = f"http://127.0.0.1:{httpd.server_address[1]}/index.html?render=1"
    gerados = []
    with sync_playwright() as p:
        nav = abrir_navegador(p)
        pg = nav.new_page()
        pg.goto(url)
        pg.wait_for_selector("#cv .section")
        pg.evaluate("([cv, carta, vaga]) => MotorCV.carregar(cv, carta, vaga)", [cv, carta, meta or None])
        for qual, prefixo in (("cv", "CV"), ("carta", "Carta")):
            if qual == "carta" and not carta.strip():
                continue
            nome = f"{prefixo}_{sufixo}"
            pg.evaluate("([q, t]) => MotorCV.prepararImpressao(q, t)", [qual, nome])
            pg.emulate_media(media="print")
            destino = saida / f"{nome}.pdf"
            pg.pdf(path=str(destino), prefer_css_page_size=True, print_background=True)
            gerados.append(destino)
        nav.close()
    httpd.shutdown()
    for g in gerados:
        print("PDF:", g)


if __name__ == "__main__":
    main()
