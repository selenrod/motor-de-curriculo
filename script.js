'use strict';

/* =====================================================================
   Motor de Currículo
   - O currículo é um objeto de dados (App.cv) desenhado na página.
     Cada texto é editável no próprio documento; botões ↑ ↓ ✕ ＋ cuidam da estrutura.
   - Cada vaga é uma pasta (ex.: Meu Drive/Vagas/2026-11-02_Empresa_Cargo) com:
       vaga.json, vaga.md, curriculo_R0.json, carta_R0.md, e os PDFs.
     "Salvar versão" grava curriculo_R{n+1}.json e carta_R{n+1}.md na mesma pasta.
   - O PDF sai da impressão do navegador (texto selecionável, compatível com ATS).
   ===================================================================== */

/* ---------- Constantes ---------- */
const SECOES = {
    resumo: 'Resumo',
    formacao: 'Formação acadêmica',
    experiencias: 'Experiência profissional',
    atividades: 'Descrição das atividades profissionais',
    cursos: 'Cursos',
    ferramentas: 'Ferramentas e conhecimentos aplicáveis'
};
const ORDEM_PADRAO = Object.keys(SECOES);

/* Perguntas por conjunto: vêm de data/perguntas.json (editável sem mexer no código).
   Este padrão só é usado se o arquivo não carregar. */
const PERGUNTAS_URL = 'data/perguntas.json';
const PERGUNTAS_PADRAO = {
    padrao: 'base',
    conjuntos: { base: { rotulo: 'Base', perguntas: ['contexto', 'problema', 'acao', 'como', 'resultado', 'porque'] } },
    perguntas: {
        contexto: { rotulo: 'Contexto (empresa, setor, porte, orçamento, equipe)' },
        problema: { rotulo: 'Problema ou responsabilidade (o desafio real)' },
        acao: { rotulo: 'Ação específica sua (verbo forte)' },
        como: { rotulo: 'Como fez (ferramentas e métodos)' },
        resultado: { rotulo: 'Resultado mensurável (número, prazo, custo)' },
        porque: { rotulo: 'Por que importa para a próxima vaga' }
    }
};
let PERG = PERGUNTAS_PADRAO;

function conjuntoAtual() {
    const id = App.vaga && App.vaga.conjuntoPerguntas;
    return PERG.conjuntos[id] ? id : PERG.padrao;
}

/** Perguntas do conjunto da vaga aberta (ou do padrão, no currículo base): [[id, rótulo], ...] */
function perguntasAtuais() {
    return PERG.conjuntos[conjuntoAtual()].perguntas
        .filter(id => PERG.perguntas[id])
        .map(id => [id, PERG.perguntas[id].rotulo]);
}

async function carregarPerguntas() {
    try {
        const r = await fetch(PERGUNTAS_URL, { cache: 'no-store' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();
        if (!d.conjuntos || !d.perguntas || !d.conjuntos[d.padrao]) throw new Error('formato inválido');
        PERG = d;
    } catch (e) {
        PERG = PERGUNTAS_PADRAO;
        aviso('Não consegui carregar data/perguntas.json; usando as 6 perguntas básicas.', true);
    }
}

const BASE_URL = 'data/curriculo.base.json';
const LS_BASE = 'mc.base.v1';

/* ---------- Estado ---------- */
const App = {
    base: null,        // currículo base (ponto de partida de toda vaga)
    cv: null,          // currículo em edição
    carta: '',         // carta em Markdown
    vaga: null,        // {empresa, cargo, link, status, descricao, ...} ou null
    vagaNome: null,    // nome da pasta da vaga
    versao: null,      // número da versão carregada (R0 = 0) ou null
    versoes: [],       // números de versões existentes na pasta
    sujo: false,       // há alterações não salvas
    hist: []           // histórico para "Desfazer"
};

/* ---------- Utilitários ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clone = o => JSON.parse(JSON.stringify(o));

function h(tag, props = {}, ...filhos) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
        if (v === false || v == null) continue;
        if (k === 'class') e.className = v;
        else if (k === 'text') e.textContent = v;
        else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
        else if (v === true) e.setAttribute(k, '');
        else e.setAttribute(k, v);
    }
    for (const f of filhos.flat(Infinity)) if (f != null) e.append(f);
    return e;
}

function aviso(msg, erro = false) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast no-print show' + (erro ? ' erro' : '');
    clearTimeout(aviso._t);
    aviso._t = setTimeout(() => t.classList.remove('show'), erro ? 6500 : 3200);
}

function slug(s) {
    return String(s || '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function dataISO() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function baixar(nome, texto, tipo = 'text/plain') {
    const a = h('a', { href: URL.createObjectURL(new Blob([texto], { type: tipo + ';charset=utf-8' })), download: nome });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ---------- Modelo de dados ---------- */
function novoRefino() {
    return Object.fromEntries(perguntasAtuais().map(([k]) => [k, false]));
}

function normalizar(c) {
    c = c || {};
    const s = (v, d = '') => (typeof v === 'string' ? v : d);
    const ord = (c.secoes && Array.isArray(c.secoes.ordem) ? c.secoes.ordem : []).filter(k => SECOES[k]);
    for (const k of ORDEM_PADRAO) if (!ord.includes(k)) ord.push(k);
    const out = {
        versaoEsquema: 1,
        secoes: { ordem: ord, ocultas: ((c.secoes && c.secoes.ocultas) || []).filter(k => SECOES[k]) },
        nome: s(c.nome),
        nomeArquivo: s(c.nomeArquivo, 'CURRICULO'),
        infoPessoal: s(c.infoPessoal),
        endereco: s(c.endereco),
        telefone: s(c.telefone),
        email: s(c.email),
        linkedin: s(c.linkedin),
        objetivo: s(c.objetivo),
        resumo: s(c.resumo),
        formacao: (c.formacao || []).map(f => ({ titulo: s(f.titulo), instituicao: s(f.instituicao), conclusao: String(f.conclusao ?? '') })),
        experiencias: (c.experiencias || []).map(x => ({
            empresa: s(x.empresa),
            periodos: (x.periodos || []).map(p => ({ periodo: s(p.periodo), cargo: s(p.cargo) }))
        })),
        atividades: (c.atividades || []).map(a => ({
            titulo: s(a.titulo),
            itens: (a.itens || []).map(String),
            refino: a.refino && typeof a.refino === 'object' ? { ...novoRefino(), ...a.refino } : null
        })),
        cursos: (c.cursos || []).map(String),
        ferramentas: (c.ferramentas || []).map(g => ({ grupo: s(g.grupo), itens: (g.itens || []).map(String) }))
    };
    for (const k of Object.keys(c)) if (!(k in out)) out[k] = c[k]; // preserva campos extras
    return out;
}

async function carregarBase() {
    try {
        const ls = localStorage.getItem(LS_BASE);
        if (ls) return normalizar(JSON.parse(ls));
    } catch (e) { /* ignora */ }
    const r = await fetch(BASE_URL, { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return normalizar(await r.json());
}

/* ---------- Estado sujo e histórico ---------- */
function marcarSujo() {
    App.sujo = true;
    atualizarStatus();
}

function atualizarStatus() {
    const s = $('#statusSalvo');
    let t = '';
    if (App.sujo) t = 'Alterações não salvas';
    else if (App.vaga && App.versao != null) t = `Versão R${App.versao} salva`;
    else if (App.vaga) t = 'Sem versão salva';
    s.textContent = t;
    s.classList.toggle('sujo', App.sujo);
    const prox = (App.versoes.length ? Math.max(...App.versoes) : -1) + 1;
    $('#btnSalvarVersao').textContent = App.vaga ? `Salvar versão (R${prox})` : 'Salvar versão';
}

function snap() {
    App.hist.push(JSON.stringify(App.cv));
    if (App.hist.length > 40) App.hist.shift();
}

function desfazer() {
    const s = App.hist.pop();
    if (!s) return aviso('Nada para desfazer.');
    App.cv = JSON.parse(s);
    renderTudo();
    marcarSujo();
}

/* ---------- Edição na página ---------- */
const _uid = new WeakMap();
let _n = 0;
const uid = o => { if (!_uid.has(o)) _uid.set(o, ++_n); return _uid.get(o); };

function colocarCursorFim(el) {
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
}

/** Texto editável ligado a obj[chave]. */
function ed(obj, chave, op = {}) {
    const s = h('span', { class: 'ed' + (op.bloco ? ' resumo-txt' : ''), 'data-ph': op.ph || '(vazio)' });
    s.textContent = obj[chave] ?? '';
    s.dataset.fid = uid(obj) + ':' + chave;
    try { s.contentEditable = 'plaintext-only'; } catch (e) { /* navegador sem suporte */ }
    if (s.contentEditable !== 'plaintext-only') s.contentEditable = 'true';
    s.spellcheck = true;
    s.addEventListener('input', () => { obj[chave] = s.textContent; marcarSujo(); });
    s.addEventListener('paste', e => {
        e.preventDefault();
        const t = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, op.bloco ? t : t.replace(/\s*\n\s*/g, ' '));
    });
    s.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !op.bloco) {
            e.preventDefault();
            if (op.onEnter) op.onEnter();
        }
    });
    return s;
}

function mover(arr, i, d) {
    const j = i + d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
}

/** Executa uma mudança estrutural: guarda histórico, redesenha e devolve o foco. */
function mutar(fn, focoId) {
    snap();
    fn();
    marcarSujo();
    renderCV(focoId);
    renderQualidade();
}

function botao(txt, titulo, fn, cls = '') {
    return h('button', { type: 'button', title: titulo, class: cls, onclick: ev => { ev.preventDefault(); fn(); } }, txt);
}

/** Controles ↑ ↓ ✕ de um item de lista. */
function ctl(arr, i, op = {}) {
    const w = h('span', { class: 'ctl no-print' });
    if (op.up !== false && i > 0) w.append(botao('↑', 'Mover para cima', () => mutar(() => mover(arr, i, -1))));
    if (op.down !== false && i < arr.length - 1) w.append(botao('↓', 'Mover para baixo', () => mutar(() => mover(arr, i, 1))));
    if (op.del !== false) w.append(botao('✕', op.rot || 'Remover', () => mutar(() => arr.splice(i, 1)), 'del'));
    return w;
}

function addBtn(txt, fn) {
    return h('button', { type: 'button', class: 'add no-print', onclick: fn }, txt);
}

/* ---------- Currículo ---------- */
function ordemSecoes(cv) {
    const o = (cv.secoes && cv.secoes.ordem) || [];
    const set = new Set(o.filter(k => SECOES[k]));
    for (const k of ORDEM_PADRAO) set.add(k);
    return [...set];
}

function secao(k, ...conteudo) {
    const cv = App.cv;
    const ord = ordemSecoes(cv);
    const i = ord.indexOf(k);
    const mv = d => mutar(() => { cv.secoes.ordem = ordemSecoes(cv); mover(cv.secoes.ordem, i, d); });
    const ctrl = h('span', { class: 'ctl no-print' },
        i > 0 ? botao('↑', 'Mover seção para cima', () => mv(-1)) : null,
        i < ord.length - 1 ? botao('↓', 'Mover seção para baixo', () => mv(1)) : null);
    return h('div', { class: 'section', 'data-sec': k },
        h('h2', {}, SECOES[k].toUpperCase(), ctrl),
        conteudo);
}

function semNumero(a) {
    return !/\d/.test(a.itens.join(' '));
}

function atividadeLi(cv, a, i) {
    const it = a.itens;
    const novo = pos => mutar(() => it.splice(pos, 0, ''), uid(it) + ':' + pos);

    const cab = h('div', {},
        h('strong', {}, ed(a, 'titulo', { ph: 'Empresa (Cargo)' }), ':'), ' ',
        it.length ? ed(it, 0, { ph: 'Descreva a atividade e o resultado', onEnter: () => novo(1) }) : null,
        it.length ? ctl(it, 0, { up: false, rot: 'Remover este item' }) : null,
        ctl(cv.atividades, i, { rot: 'Remover esta empresa/cargo e todos os seus itens' }),
        a.refino && perguntasAtuais().some(([k]) => !a.refino[k])
            ? h('span', { class: 'lint no-print', text: `⚠ refinar ${perguntasAtuais().filter(([k]) => a.refino[k]).length}/${perguntasAtuais().length}` })
            : (semNumero(a) ? h('span', { class: 'lint no-print', text: '⚠ sem número' }) : null));

    const sub = h('ul', { class: 'sub' }, it.slice(1).map((_, k) => {
        const idx = k + 1;
        return h('li', {}, ed(it, idx, { ph: 'Item', onEnter: () => novo(idx + 1) }), ctl(it, idx));
    }));

    return h('li', {},
        cab,
        it.length > 1 ? sub : null,
        addBtn('＋ Item', () => novo(it.length)));
}

const RENDER = {
    resumo: cv => secao('resumo',
        h('div', {}, ed(cv, 'resumo', { bloco: true, ph: 'Resumo profissional: quem é, onde atua, que problema resolve, como entrega valor, diferencial.' }))),

    formacao: cv => secao('formacao',
        h('ul', {}, cv.formacao.map((f, i) => h('li', {},
            h('strong', {}, ed(f, 'titulo', { ph: 'Curso' })), ctl(cv.formacao, i), h('br'),
            'Instituição: ', ed(f, 'instituicao', { ph: 'Instituição' }), h('br'),
            'Conclusão: ', ed(f, 'conclusao', { ph: 'Ano' })))),
        addBtn('＋ Formação', () => {
            const n = { titulo: '', instituicao: '', conclusao: '' };
            mutar(() => cv.formacao.push(n), uid(n) + ':titulo');
        })),

    experiencias: cv => secao('experiencias',
        cv.experiencias.map((x, i) => h('div', { class: 'experiencia' },
            h('div', { class: 'linha' }, h('strong', {}, ed(x, 'empresa', { ph: 'Empresa' })), ctl(cv.experiencias, i)),
            x.periodos.map((p, j) => h('div', { class: 'periodo' },
                'Período: ', ed(p, 'periodo', { ph: 'MM/AAAA - MM/AAAA' }), h('br'),
                'Cargo: ', ed(p, 'cargo', { ph: 'Cargo' }), ctl(x.periodos, j))),
            addBtn('＋ Cargo nesta empresa', () => {
                const n = { periodo: '', cargo: '' };
                mutar(() => x.periodos.push(n), uid(n) + ':periodo');
            }))),
        addBtn('＋ Empresa', () => {
            const p = { periodo: '', cargo: '' };
            const n = { empresa: '', periodos: [p] };
            mutar(() => cv.experiencias.push(n), uid(n) + ':empresa');
        })),

    atividades: cv => secao('atividades',
        h('ul', {}, cv.atividades.map((a, i) => atividadeLi(cv, a, i))),
        addBtn('＋ Empresa / cargo', () => {
            const n = { titulo: '', itens: [''], refino: novoRefino() };
            mutar(() => cv.atividades.push(n), uid(n) + ':titulo');
        })),

    cursos: cv => secao('cursos',
        h('ul', {}, cv.cursos.map((c, i) => h('li', {},
            ed(cv.cursos, i, { ph: 'Curso - Instituição - Ano', onEnter: () => mutar(() => cv.cursos.splice(i + 1, 0, ''), uid(cv.cursos) + ':' + (i + 1)) }),
            ctl(cv.cursos, i)))),
        addBtn('＋ Curso', () => mutar(() => cv.cursos.push(''), uid(cv.cursos) + ':' + cv.cursos.length))),

    ferramentas: cv => secao('ferramentas',
        cv.ferramentas.map((g, gi) => h('div', {},
            h('h4', {}, ed(g, 'grupo', { ph: 'GRUPO' }), ctl(cv.ferramentas, gi)),
            h('ul', {}, g.itens.map((t, i) => h('li', {},
                ed(g.itens, i, { ph: 'Ferramenta', onEnter: () => mutar(() => g.itens.splice(i + 1, 0, ''), uid(g.itens) + ':' + (i + 1)) }),
                ctl(g.itens, i)))),
            addBtn('＋ Item', () => mutar(() => g.itens.push(''), uid(g.itens) + ':' + g.itens.length)))),
        addBtn('＋ Grupo', () => {
            const n = { grupo: '', itens: [''] };
            mutar(() => cv.ferramentas.push(n), uid(n) + ':grupo');
        }))
};

function renderCabecalho(cv) {
    return h('div', { class: 'header' },
        h('h1', {}, ed(cv, 'nome', { ph: 'Nome' })),
        h('p', {}, ed(cv, 'infoPessoal', { ph: 'Idade - Estado civil' })),
        h('p', {}, h('strong', { text: 'Endereço: ' }), ed(cv, 'endereco', { ph: 'Cidade - UF' })),
        h('p', {}, h('strong', { text: 'Telefones: ' }), ed(cv, 'telefone', { ph: 'Telefone' }),
            ' | ', h('strong', { text: 'E-mail: ' }), ed(cv, 'email', { ph: 'E-mail' })),
        h('p', {}, h('strong', { text: 'LinkedIn: ' }), ed(cv, 'linkedin', { ph: 'URL do LinkedIn' })),
        h('p', { class: 'objetivo' }, h('strong', { text: 'Objetivo Profissional: ' }), ed(cv, 'objetivo', { ph: 'Cargos-alvo' })));
}

function renderCV(focoId) {
    const cv = App.cv;
    const raiz = $('#cv');
    raiz.replaceChildren(renderCabecalho(cv));
    for (const k of ordemSecoes(cv)) {
        if ((cv.secoes.ocultas || []).includes(k)) continue;
        raiz.append(RENDER[k](cv));
    }
    if (focoId) {
        const alvo = raiz.querySelector(`[data-fid="${focoId}"]`);
        if (alvo) { alvo.focus(); colocarCursorFim(alvo); }
    }
    renderCarta();
}

/* ---------- Carta (Markdown) ---------- */
function mdParaHtml(md) {
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inline = s => esc(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
    const out = [];
    let lista = null;
    let par = [];
    const fechaPar = () => { if (par.length) { out.push('<p>' + par.map(inline).join('<br>') + '</p>'); par = []; } };
    const fechaLista = () => { if (lista) { out.push('<ul>' + lista.map(i => '<li>' + inline(i) + '</li>').join('') + '</ul>'); lista = null; } };
    for (const linha of md.replace(/\r/g, '').split('\n')) {
        if (!linha.trim()) { fechaPar(); fechaLista(); continue; }
        let m;
        if ((m = linha.match(/^(#{1,3})\s+(.*)$/))) {
            fechaPar(); fechaLista();
            out.push(`<h${m[1].length} class="md">${inline(m[2])}</h${m[1].length}>`);
        } else if ((m = linha.match(/^\s*[-*]\s+(.*)$/))) {
            fechaPar();
            (lista = lista || []).push(m[1]);
        } else {
            fechaLista();
            par.push(linha.trim());
        }
    }
    fechaPar(); fechaLista();
    return out.join('\n');
}

function renderCarta() {
    const cv = App.cv;
    const cab = h('div', { class: 'cab' },
        h('h1', { text: cv.nome }),
        h('p', { text: cv.endereco }),
        h('p', { text: [cv.telefone, cv.email].filter(Boolean).join(' | ') }),
        h('p', { text: cv.linkedin }));
    const corpo = h('div', {});
    corpo.innerHTML = App.carta.trim()
        ? mdParaHtml(App.carta)
        : '<p class="vazio">A carta desta vaga ainda está vazia. Escreva na aba “Carta” ou peça ao Claude (/vaga).</p>';
    $('#carta').replaceChildren(cab, corpo);
}

/* ---------- Painel lateral ---------- */
const CAMPOS_VAGA = {
    vagaEmpresa: 'empresa', vagaCargo: 'cargo', vagaLink: 'link', vagaStatus: 'status', vagaDescricao: 'descricao',
    vagaConjunto: 'conjuntoPerguntas'
};

function preencherPainelVaga() {
    const tem = !!App.vaga;
    $('#vagaAviso').hidden = tem;
    const selC = $('#vagaConjunto');
    selC.replaceChildren(...Object.entries(PERG.conjuntos).map(([id, c]) => h('option', { value: id, text: c.rotulo || id })));
    for (const [id, k] of Object.entries(CAMPOS_VAGA)) {
        const e = $('#' + id);
        e.disabled = !tem;
        e.value = tem ? (App.vaga[k] ?? '') : '';
    }
    selC.value = conjuntoAtual();
    $('#conjuntoQuando').textContent = (PERG.conjuntos[conjuntoAtual()] || {}).quando || '';
    $('#mdFile').disabled = !tem;
}

function renderSecoes() {
    const cv = App.cv;
    const ul = $('#listaSecoes');
    const ord = ordemSecoes(cv);
    ul.replaceChildren(...ord.map((k, i) => {
        const cb = h('input', { type: 'checkbox', checked: !(cv.secoes.ocultas || []).includes(k) });
        cb.addEventListener('change', () => {
            snap();
            const oc = new Set(cv.secoes.ocultas || []);
            cb.checked ? oc.delete(k) : oc.add(k);
            cv.secoes.ocultas = [...oc];
            marcarSujo(); renderCV();
        });
        const mv = d => () => { snap(); cv.secoes.ordem = ordemSecoes(cv); mover(cv.secoes.ordem, i, d); marcarSujo(); renderCV(); renderSecoes(); };
        return h('li', {}, cb, h('span', { text: SECOES[k] }),
            h('button', { class: 'mini', type: 'button', title: 'Subir', onclick: mv(-1) }, '↑'),
            h('button', { class: 'mini', type: 'button', title: 'Descer', onclick: mv(1) }, '↓'));
    }));
}

function renderQualidade() {
    const box = $('#listaQualidade');
    const ps = perguntasAtuais();
    const cab = h('p', { class: 'ajuda', text: `Conjunto de perguntas: ${PERG.conjuntos[conjuntoAtual()].rotulo || conjuntoAtual()} (${ps.length} perguntas). Para trocar, use a aba Vaga.` });
    box.replaceChildren(cab, ...App.cv.atividades.map(a => {
        const item = h('div', { class: 'q-item' }, h('h4', { text: a.titulo || '(sem título)' }));
        if (!a.refino) {
            item.append(
                h('p', { class: 'q-tag', text: 'Ainda não avaliada.' }),
                h('button', {
                    class: 'btn', type: 'button',
                    onclick: () => { a.refino = novoRefino(); marcarSujo(); renderQualidade(); renderCV(); }
                }, `Avaliar com as ${ps.length} perguntas`));
        } else {
            const n = ps.filter(([k]) => a.refino[k]).length;
            item.append(h('div', { class: 'q-bar' }, h('i', { style: `width:${Math.round(n / ps.length * 100)}%` })));
            for (const [k, rot] of ps) {
                const cb = h('input', { type: 'checkbox', checked: !!a.refino[k] });
                cb.addEventListener('change', () => { a.refino[k] = cb.checked; marcarSujo(); renderQualidade(); renderCV(); });
                item.append(h('label', {}, cb, rot));
            }
        }
        const num = !semNumero(a);
        item.append(h('p', { class: 'q-tag' + (num ? ' bom' : ''), text: num ? 'O texto contém número.' : 'Sem número ou resultado mensurável no texto.' }));
        return item;
    }));
}

function atualizarSelectVersao() {
    const sel = $('#versaoSelect');
    sel.replaceChildren(...App.versoes.map(n => h('option', { value: n, text: 'R' + n, selected: n === App.versao })));
    sel.disabled = App.versoes.length === 0;
    atualizarStatus();
}

function renderTudo() {
    renderCV();
    renderSecoes();
    renderQualidade();
    preencherPainelVaga();
    $('#cartaTexto').value = App.carta;
    atualizarSelectVersao();
}

/* ---------- Pasta de vagas (Chrome/Edge gravam direto; outros só leem) ---------- */
function idb() {
    return new Promise((res, rej) => {
        const r = indexedDB.open('motor-curriculo', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
    });
}
async function idbGet(k) {
    const db = await idb();
    return new Promise((res, rej) => {
        const q = db.transaction('kv').objectStore('kv').get(k);
        q.onsuccess = () => res(q.result);
        q.onerror = () => rej(q.error);
    });
}
async function idbSet(k, v) {
    const db = await idb();
    return new Promise((res, rej) => {
        const t = db.transaction('kv', 'readwrite');
        t.objectStore('kv').put(v, k);
        t.oncomplete = res;
        t.onerror = () => rej(t.error);
    });
}

const EH_ARQUIVO_DE_VAGA = /^(vaga\.(json|md)|curriculo_R\d+\.json|carta_R\d+\.md)$/;

const Pasta = {
    suporta: 'showDirectoryPicker' in window,
    modo: null,      // 'fsa' | 'upload'
    raiz: null,      // FileSystemDirectoryHandle
    pendente: null,  // pasta lembrada que precisa de permissão
    arvore: null,    // modo upload: Map<vaga, Map<arquivo, File>>
    unica: false,    // a pasta aberta já é uma única vaga

    get aberta() { return !!(this.raiz || this.arvore); },
    get podeGravar() { return this.modo === 'fsa'; },

    async escolher() {
        if (this.suporta) {
            const hdl = await window.showDirectoryPicker({ id: 'motor-vagas', mode: 'readwrite' });
            try { await idbSet('raiz', hdl); } catch (e) { /* sem lembrar a pasta; segue normalmente */ }
            await this.usar(hdl);
        } else {
            await this.escolherUpload();
        }
    },

    escolherUpload() {
        return new Promise(res => {
            const inp = h('input', { type: 'file', webkitdirectory: true, multiple: true });
            inp.addEventListener('change', () => {
                const mapa = new Map();
                let unica = false;
                for (const f of inp.files) {
                    const p = f.webkitRelativePath.split('/');
                    if (p.length === 2) { unica = true; const k = p[0]; if (!mapa.has(k)) mapa.set(k, new Map()); mapa.get(k).set(p[1], f); }
                    else if (p.length >= 3) { const k = p[1]; if (!mapa.has(k)) mapa.set(k, new Map()); mapa.get(k).set(p.slice(2).join('/'), f); }
                }
                this.modo = 'upload'; this.arvore = mapa; this.raiz = null; this.unica = unica;
                res();
            });
            inp.click();
        });
    },

    async usar(hdl) {
        this.modo = 'fsa'; this.raiz = hdl; this.arvore = null; this.pendente = null;
        this.unica = false;
        for await (const [nome, e] of hdl.entries()) {
            if (e.kind === 'file' && EH_ARQUIVO_DE_VAGA.test(nome)) { this.unica = true; break; }
        }
    },

    async listarVagas() {
        if (this.modo === 'upload') return [...this.arvore.keys()].sort().reverse();
        if (this.unica) return [this.raiz.name];
        const nomes = [];
        for await (const [nome, e] of this.raiz.entries()) {
            if (e.kind === 'directory' && !/^[._]/.test(nome)) nomes.push(nome);
        }
        return nomes.sort().reverse();
    },

    async dir(vaga, criar = false) {
        if (this.unica) return this.raiz;
        return this.raiz.getDirectoryHandle(vaga, { create: criar });
    },

    async arquivos(vaga) {
        if (this.modo === 'upload') return [...(this.arvore.get(vaga) || new Map()).keys()];
        const d = await this.dir(vaga);
        const out = [];
        for await (const [nome, e] of d.entries()) if (e.kind === 'file') out.push(nome);
        return out;
    },

    async ler(vaga, arq) {
        try {
            if (this.modo === 'upload') {
                const f = (this.arvore.get(vaga) || new Map()).get(arq);
                return f ? await f.text() : null;
            }
            const d = await this.dir(vaga);
            const fh = await d.getFileHandle(arq);
            return await (await fh.getFile()).text();
        } catch (e) {
            return null;
        }
    },

    async escrever(vaga, arq, texto) {
        if (this.modo !== 'fsa') { baixar(arq, texto); return; }
        const d = await this.dir(vaga, true);
        const fh = await d.getFileHandle(arq, { create: true });
        const w = await fh.createWritable();
        await w.write(texto);
        await w.close();
    }
};

async function restaurarPasta() {
    if (!Pasta.suporta) return;
    try {
        const hdl = await idbGet('raiz');
        if (!hdl) return;
        const p = await hdl.queryPermission({ mode: 'readwrite' });
        if (p === 'granted') { await Pasta.usar(hdl); await recarregarVagas(); }
        else { Pasta.pendente = hdl; $('#btnPasta').textContent = `Reconectar “${hdl.name}”`; }
    } catch (e) { /* sem pasta lembrada */ }
}

async function recarregarVagas(selecionar) {
    const nomes = await Pasta.listarVagas();
    const sel = $('#vagaSelect');
    const itens = [];
    for (const nome of nomes) {
        let rot = nome;
        const meta = await Pasta.ler(nome, 'vaga.json');
        if (meta) {
            try { const m = JSON.parse(meta); if (m.empresa || m.cargo) rot = `${m.empresa || ''} — ${m.cargo || ''}  (${nome.slice(0, 10)})`; } catch (e) { /* mantém nome */ }
        }
        itens.push(h('option', { value: nome, text: rot }));
    }
    sel.replaceChildren(h('option', { value: '', text: 'Currículo base (sem vaga)' }), ...itens);
    sel.disabled = false;
    $('#btnNovaVaga').disabled = !Pasta.podeGravar || Pasta.unica;
    $('#btnPasta').textContent = 'Trocar pasta de vagas';
    if (selecionar) { sel.value = selecionar; await abrirVaga(selecionar); }
    else if (Pasta.unica && nomes[0]) { sel.value = nomes[0]; await abrirVaga(nomes[0]); }
    aviso(`${nomes.length} ${nomes.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}.`);
}

/* ---------- Vagas e versões ---------- */
function descartarOk() {
    return !App.sujo || confirm('Há alterações não salvas. Deseja descartá-las?');
}

function maisProxima(arqs, prefixo, ext, n) {
    for (let k = n; k >= 0; k--) if (arqs.has(`${prefixo}_R${k}.${ext}`)) return k;
    return null;
}

async function abrirVaga(nome) {
    if (!nome) {
        App.vaga = null; App.vagaNome = null; App.versoes = []; App.versao = null;
        App.cv = clone(App.base); App.carta = ''; App.sujo = false; App.hist = [];
        renderTudo();
        return;
    }
    const arqs = await Pasta.arquivos(nome);
    const nums = new Set();
    for (const a of arqs) { const m = a.match(/^(?:curriculo|carta)_R(\d+)\.(?:json|md)$/); if (m) nums.add(+m[1]); }
    App.versoes = [...nums].sort((a, b) => a - b);

    let meta = {};
    try { meta = JSON.parse((await Pasta.ler(nome, 'vaga.json')) || '{}'); } catch (e) { aviso('vaga.json inválido; usando valores vazios.', true); }
    const desc = await Pasta.ler(nome, 'vaga.md');
    App.vaga = { empresa: '', cargo: '', link: '', status: 'Nova', ...meta, descricao: desc ?? meta.descricao ?? '' };
    App.vagaNome = nome;

    if (App.versoes.length) await carregarVersao(App.versoes[App.versoes.length - 1]);
    else { App.versao = null; App.cv = clone(App.base); App.carta = ''; App.sujo = false; App.hist = []; renderTudo(); }
}

async function carregarVersao(n) {
    const arqs = new Set(await Pasta.arquivos(App.vagaNome));
    const kj = maisProxima(arqs, 'curriculo', 'json', n);
    const kc = maisProxima(arqs, 'carta', 'md', n);
    let cv = null;
    if (kj != null) {
        try { cv = normalizar(JSON.parse(await Pasta.ler(App.vagaNome, `curriculo_R${kj}.json`))); }
        catch (e) { aviso(`curriculo_R${kj}.json está inválido. Usando o currículo base.`, true); }
    }
    App.cv = cv || clone(App.base);
    App.carta = kc != null ? (await Pasta.ler(App.vagaNome, `carta_R${kc}.md`)) || '' : '';
    App.versao = n; App.sujo = false; App.hist = [];
    renderTudo();
}

async function salvarVersao() {
    if (!App.vaga) { aviso('Abra uma vaga para salvar versões. Para mudar o currículo base, use a aba Arquivo.', true); return false; }
    if (!Pasta.aberta) { aviso('Abra a pasta de vagas primeiro.', true); return false; }
    const n = (App.versoes.length ? Math.max(...App.versoes) : -1) + 1;
    const nome = App.vagaNome;
    try {
        await Pasta.escrever(nome, `curriculo_R${n}.json`, JSON.stringify(App.cv, null, 2));
        await Pasta.escrever(nome, `carta_R${n}.md`, App.carta);
        const { descricao, ...meta } = App.vaga;
        meta.ultimaVersao = n;
        meta.atualizadoEm = new Date().toISOString();
        if (!meta.criadoEm) meta.criadoEm = meta.atualizadoEm;
        await Pasta.escrever(nome, 'vaga.json', JSON.stringify(meta, null, 2));
        if (descricao && descricao.trim()) await Pasta.escrever(nome, 'vaga.md', descricao);
    } catch (e) {
        aviso('Não consegui gravar na pasta: ' + e.message, true);
        return false;
    }
    App.versoes.push(n); App.versao = n; App.sujo = false;
    atualizarSelectVersao();
    aviso(Pasta.podeGravar
        ? `Versão R${n} salva na pasta da vaga. Exporte o PDF e salve na mesma pasta.`
        : `Versão R${n} baixada. Mova os arquivos para a pasta da vaga.`);
    return true;
}

async function novaVaga() {
    if (!Pasta.podeGravar || Pasta.unica) return;
    const empresa = (prompt('Empresa:') || '').trim();
    if (!empresa) return;
    const cargo = (prompt('Cargo:') || '').trim();
    const nome = [dataISO(), slug(empresa), slug(cargo)].filter(Boolean).join('_');
    try {
        const agora = new Date().toISOString();
        await Pasta.escrever(nome, 'vaga.json', JSON.stringify({ empresa, cargo, link: '', status: 'Nova', criadoEm: agora, atualizadoEm: agora, ultimaVersao: 0 }, null, 2));
        await Pasta.escrever(nome, 'curriculo_R0.json', JSON.stringify(App.base, null, 2));
        await Pasta.escrever(nome, 'carta_R0.md', '');
    } catch (e) { return aviso('Não consegui criar a pasta: ' + e.message, true); }
    await recarregarVagas(nome);
}

/* ---------- PDF (impressão do navegador) ---------- */
function nomePdf(qual) {
    const pre = qual === 'carta' ? 'Carta' : 'CV';
    const partes = [pre, App.cv.nomeArquivo];
    if (App.vaga && App.vaga.empresa) partes.push(slug(App.vaga.empresa));
    if (App.versao != null) partes.push('R' + App.versao);
    return partes.filter(Boolean).join('_');
}

async function imprimir(qual) {
    if (App.sujo && App.vaga && Pasta.aberta) {
        const prox = (App.versoes.length ? Math.max(...App.versoes) : -1) + 1;
        if (confirm(`Há alterações não salvas. Salvar como R${prox} antes de exportar o PDF?`)) {
            if (!(await salvarVersao())) return;
        }
    }
    document.body.dataset.print = qual;
    const antes = document.title;
    document.title = nomePdf(qual);
    const fim = () => { delete document.body.dataset.print; document.title = antes; window.removeEventListener('afterprint', fim); };
    window.addEventListener('afterprint', fim);
    window.print();
}

/* ---------- Ligações da interface ---------- */
function ligarPainel() {
    // Abas do painel
    $$('.tab').forEach(b => b.addEventListener('click', () => {
        $$('.tab').forEach(x => x.classList.toggle('active', x === b));
        $$('.tabpane').forEach(p => p.classList.toggle('active', p.id === 'pane-' + b.dataset.tab));
        if (b.dataset.tab === 'carta') document.body.dataset.aba = 'carta';
        if (b.dataset.tab === 'secoes' || b.dataset.tab === 'qualidade') document.body.dataset.aba = 'cv';
        $$('.stab').forEach(x => x.classList.toggle('active', x.dataset.aba === document.body.dataset.aba));
    }));
    $$('.stab').forEach(b => b.addEventListener('click', () => {
        document.body.dataset.aba = b.dataset.aba;
        $$('.stab').forEach(x => x.classList.toggle('active', x === b));
    }));

    // Campos da vaga
    for (const [id, k] of Object.entries(CAMPOS_VAGA)) {
        $('#' + id).addEventListener('input', e => { if (App.vaga) { App.vaga[k] = e.target.value; marcarSujo(); } });
    }
    $('#vagaConjunto').addEventListener('change', () => {
        $('#conjuntoQuando').textContent = (PERG.conjuntos[conjuntoAtual()] || {}).quando || '';
        renderQualidade(); renderCV();
    });
    $('#mdFile').addEventListener('change', async e => {
        const f = e.target.files[0];
        if (!f || !App.vaga) return;
        App.vaga.descricao = await f.text();
        $('#vagaDescricao').value = App.vaga.descricao;
        marcarSujo();
        aviso('Descrição da vaga carregada.');
    });

    // Carta
    let t;
    $('#cartaTexto').addEventListener('input', e => {
        App.carta = e.target.value; marcarSujo();
        clearTimeout(t); t = setTimeout(renderCarta, 120);
    });

    // Barra superior
    $('#btnPasta').addEventListener('click', async () => {
        try {
            if (Pasta.pendente) {
                const p = await Pasta.pendente.requestPermission({ mode: 'readwrite' });
                if (p === 'granted') { await Pasta.usar(Pasta.pendente); await recarregarVagas(); return; }
            }
            await Pasta.escolher();
            await recarregarVagas();
        } catch (e) {
            if (e.name !== 'AbortError') aviso('Não consegui abrir a pasta: ' + e.message, true);
        }
    });
    $('#vagaSelect').addEventListener('change', async e => {
        if (!descartarOk()) { e.target.value = App.vagaNome || ''; return; }
        await abrirVaga(e.target.value);
    });
    $('#versaoSelect').addEventListener('change', async e => {
        if (!descartarOk()) { e.target.value = App.versao; return; }
        await carregarVersao(+e.target.value);
    });
    $('#btnNovaVaga').addEventListener('click', novaVaga);
    $('#btnDesfazer').addEventListener('click', desfazer);
    $('#btnSalvarVersao').addEventListener('click', salvarVersao);
    $('#btnPdfCv').addEventListener('click', () => imprimir('cv'));
    $('#btnPdfCarta').addEventListener('click', () => imprimir('carta'));

    // Aba Arquivo
    $('#btnSalvarBase').addEventListener('click', () => {
        if (!confirm('Substituir o currículo base deste navegador pela edição atual? As próximas vagas partirão dele.')) return;
        App.base = clone(App.cv);
        try { localStorage.setItem(LS_BASE, JSON.stringify(App.base)); aviso('Currículo base atualizado neste navegador.'); }
        catch (e) { aviso('Não consegui gravar neste navegador: ' + e.message, true); }
    });
    $('#btnBaixarJson').addEventListener('click', () => baixar(`curriculo_${App.cv.nomeArquivo}.json`, JSON.stringify(App.cv, null, 2), 'application/json'));
    $('#jsonFile').addEventListener('change', async e => {
        const f = e.target.files[0];
        if (!f) return;
        try {
            snap();
            App.cv = normalizar(JSON.parse(await f.text()));
            renderTudo(); marcarSujo();
            aviso('Currículo importado.');
        } catch (err) { aviso('Arquivo JSON inválido.', true); }
        e.target.value = '';
    });
    $('#btnRestaurarBase').addEventListener('click', async () => {
        if (!confirm('Apagar a base salva neste navegador e voltar à base do repositório?')) return;
        localStorage.removeItem(LS_BASE);
        try {
            App.base = await carregarBase();
            snap(); App.cv = clone(App.base); renderTudo(); marcarSujo();
            aviso('Base do repositório restaurada.');
        } catch (err) { aviso('Não consegui carregar a base: ' + err.message, true); }
    });
    $('#infoNavegador').textContent = Pasta.suporta
        ? 'Este navegador grava direto na pasta das vagas (Chrome/Edge). A pasta escolhida fica lembrada.'
        : 'Este navegador só lê pastas. Ao salvar, os arquivos serão baixados. Use Chrome ou Edge para gravar direto no Google Drive.';

    // Aviso ao sair com alterações
    window.addEventListener('beforeunload', e => { if (App.sujo) { e.preventDefault(); e.returnValue = ''; } });
}

/* ---------- Início ---------- */
async function init() {
    ligarPainel();
    await carregarPerguntas();
    try {
        App.base = await carregarBase();
    } catch (e) {
        App.base = normalizar({});
        aviso('Não consegui carregar data/curriculo.base.json. Abra pelo GitHub Pages ou importe um JSON na aba Arquivo.', true);
    }
    App.cv = clone(App.base);
    renderTudo();
    if (!new URLSearchParams(location.search).has('render')) await restaurarPasta();
}

// Interface para automação (tools/render_pdf.py)
window.MotorCV = {
    carregar(cv, carta, vaga) {
        App.cv = normalizar(cv); App.carta = carta || ''; App.vaga = vaga || null;
        App.versao = null; App.sujo = false; renderTudo();
    },
    prepararImpressao(qual, titulo) {
        document.body.dataset.print = qual;
        if (titulo) document.title = titulo;
    },
    estado: () => ({ cv: clone(App.cv), carta: App.carta, vaga: App.vaga && clone(App.vaga), versao: App.versao })
};

init();
