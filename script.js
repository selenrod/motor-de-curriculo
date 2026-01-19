// Dados do currículo (estrutura inicial)
let curriculumData = {
    nome: "Paulo Roberto Alves Dorneles",
    idade: 30,
    estadoCivil: "Casado",
    endereco: "Nova Alvorada do Sul - Mato Grosso do Sul",
    telefone: "(41) 99126-9356",
    email: "prdorneles.eng@gmail.com",
    linkedin: "https://www.linkedin.com/in/robertodorneles/",
    objetivo: "Engenheiro de Produção | Coordenador | Especialista",
    resumo: [
        "Sou um Profissional com mais de 7 anos de experiência e sólida atuação em Melhoria Contínua e Excelência Operacional em setores de energia, fabricação de estruturas e também no setor sucroenergético. Histórico comprovado na implantação de culturas de melhoria do zero, liderando a execução de projetos Lean Six Sigma e Kaizen com foco em eficiência, segurança e compliance. Sou Especialista em liderança por influência, com forte habilidade em traduzir diretrizes estratégicas corporativas para a realidade operacional (chão de fábrica), engajando equipes multidisciplinares sem autoridade hierárquica direta. Possuo perfil analítico com domínio de ferramentas estatísticas (R, Minitab, Power BI) aliado à visão de governança corporativa (SGI). Destaco-me pela capacidade de resolver problemas complexos e inéditos (disruptivos), conectando visões distintas para criar soluções perenes. Busco atuar como agente de transformação, unindo visão consultiva interna e execução prática."
    ],
    formacoes: [],
    experiencias: [],
    atividades: [],
    cursos: []
};

// Modo atual (editar ou adicionar)
let currentMode = 'editar';

// Definir modo de edição
function setMode(mode) {
    currentMode = mode;
    
    // Atualizar botões
    document.getElementById('btn-editar').classList.remove('active');
    document.getElementById('btn-adicionar').classList.remove('active');
    document.getElementById(`btn-${mode}`).classList.add('active');
    
    // Mostrar/ocultar formulários
    document.getElementById('edit-form').style.display = mode === 'editar' ? 'block' : 'none';
    document.getElementById('add-form').style.display = mode === 'adicionar' ? 'block' : 'none';
    
    if (mode === 'editar') {
        populateEditForm();
    }
}

// Preencher formulário de edição com dados atuais
function populateEditForm() {
    document.getElementById('nome').value = curriculumData.nome;
    document.getElementById('idade').value = curriculumData.idade;
    document.getElementById('estadoCivil').value = curriculumData.estadoCivil;
    document.getElementById('endereco').value = curriculumData.endereco;
    document.getElementById('telefone').value = curriculumData.telefone;
    document.getElementById('email').value = curriculumData.email;
    document.getElementById('linkedin').value = curriculumData.linkedin;
    document.getElementById('objetivo').value = curriculumData.objetivo;
    document.getElementById('resumo').value = curriculumData.resumo.join('\n');
}

// Carregar arquivo Markdown e processar
function loadMarkdownFile() {
    const file = document.getElementById('mdFile').files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        processMarkdownContent(content);
    };
    reader.readAsText(file);
}

// Processar conteúdo Markdown e atualizar resumo
function processMarkdownContent(content) {
    // Aqui você pode processar o conteúdo Markdown
    // Por exemplo, extrair seções relevantes ou usar toda a descrição
    
    // Convertendo em lista de itens (simulação básica)
    const lines = content.split('\n').filter(line => line.trim());
    const resumoItems = [];
    
    // Lógica de processamento pode ser personalizada
    lines.forEach(line => {
        // Remove markdown básico (##, *, -, etc)
        let cleanLine = line.replace(/^[#\-\*\>]+\s*/, '').trim();
        if (cleanLine && cleanLine.length > 20) {
            if (!cleanLine.endsWith(';')) cleanLine += ';';
            resumoItems.push(cleanLine);
        }
    });
    
    if (resumoItems.length > 0) {
        curriculumData.resumo = resumoItems;
        document.getElementById('resumo').value = resumoItems.join('\n');
        updatePreview();
        alert('Resumo atualizado com sucesso a partir do arquivo .md!');
    }
}

// Aplicar alterações do modo edição
function applyChanges() {
    curriculumData.nome = document.getElementById('nome').value;
    curriculumData.idade = parseInt(document.getElementById('idade').value);
    curriculumData.estadoCivil = document.getElementById('estadoCivil').value;
    curriculumData.endereco = document.getElementById('endereco').value;
    curriculumData.telefone = document.getElementById('telefone').value;
    curriculumData.email = document.getElementById('email').value;
    curriculumData.linkedin = document.getElementById('linkedin').value;
    curriculumData.objetivo = document.getElementById('objetivo').value;
    
    const resumoText = document.getElementById('resumo').value;
    curriculumData.resumo = resumoText.split('\n').filter(line => line.trim());
    
    updatePreview();
    alert('Alterações aplicadas com sucesso!');
}

// Mostrar formulário de adição apropriado
function showAddForm() {
    const type = document.getElementById('addType').value;
    
    // Ocultar todos os formulários
    document.getElementById('form-experiencia').style.display = 'none';
    document.getElementById('form-atividade').style.display = 'none';
    document.getElementById('form-formacao').style.display = 'none';
    document.getElementById('form-curso').style.display = 'none';
    document.getElementById('btn-add-item').style.display = 'none';
    
    // Mostrar formulário selecionado
    if (type) {
        document.getElementById(`form-${type}`).style.display = 'block';
        document.getElementById('btn-add-item').style.display = 'block';
    }
}

// Adicionar novo item
function addNewItem() {
    const type = document.getElementById('addType').value;
    
    switch(type) {        case 'experiencia':
            addExperiencia();
            break;        case 'atividade':
            addAtividade();
            break;
        case 'formacao':
            addFormacao();
            break;
        case 'curso':
            addCurso();
            break;
    }
}

function addExperiencia() {
    const exp = {
        empresa: document.getElementById('exp-empresa').value,
        cargo: document.getElementById('exp-cargo').value,
        periodo: document.getElementById('exp-periodo').value
    };
    
    if (!exp.empresa || !exp.cargo) {
        alert('Preencha ao menos empresa e cargo!');
        return;
    }
    
    curriculumData.experiencias.unshift(exp);
    clearAddForm();
    updatePreview();
    alert('Experiência adicionada com sucesso!');
}

function addAtividade() {
    const ativ = {
        empresaCargo: document.getElementById('ativ-empresa').value,
        descricao: document.getElementById('ativ-descricao').value
    };
    
    if (!ativ.empresaCargo || !ativ.descricao) {
        alert('Preencha empresa/cargo e descrição das atividades!');
        return;
    }
    
    curriculumData.atividades.unshift(ativ);
    clearAddForm();
    updatePreview();
    alert('Atividade profissional adicionada com sucesso!');
}

function addFormacao() {
    const form = {
        grau: document.getElementById('form-grau').value,
        curso: document.getElementById('form-curso').value,
        instituicao: document.getElementById('form-instituicao').value,
        conclusao: document.getElementById('form-conclusao').value
    };
    
    if (!form.curso || !form.instituicao) {
        alert('Preencha ao menos curso e instituição!');
        return;
    }
    
    curriculumData.formacoes.unshift(form);
    clearAddForm();
    updatePreview();
    alert('Formação adicionada com sucesso!');
}

function addCurso() {
    const curso = {
        nome: document.getElementById('curso-nome').value,
        instituicao: document.getElementById('curso-instituicao').value,
        ano: document.getElementById('curso-ano').value
    };
    
    if (!curso.nome) {
        alert('Preencha o nome do curso!');
        return;
    }
    
    curriculumData.cursos.unshift(curso);
    clearAddForm();
    updatePreview();
    alert('Curso adicionado com sucesso!');
}

function clearAddForm() {
    document.querySelectorAll('#add-form input, #add-form textarea').forEach(input => {
        input.value = '';
    });
    document.getElementById('addType').value = '';
    showAddForm();
}

// Atualizar preview do currículo
function updatePreview() {
    // Dados pessoais
    document.getElementById('preview-nome').textContent = curriculumData.nome;
    document.getElementById('preview-info-pessoal').textContent = `${curriculumData.idade} anos - ${curriculumData.estadoCivil}`;
    document.getElementById('preview-endereco').textContent = curriculumData.endereco;
    document.getElementById('preview-telefone').textContent = curriculumData.telefone;
    document.getElementById('preview-email').textContent = curriculumData.email;
    document.getElementById('preview-linkedin').textContent = curriculumData.linkedin;
    document.getElementById('preview-objetivo').textContent = curriculumData.objetivo;
    
    // Resumo
    const resumoList = document.getElementById('preview-resumo');
    resumoList.innerHTML = '';
    curriculumData.resumo.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        resumoList.appendChild(li);
    });
    
    // Formações adicionadas
    if (curriculumData.formacoes.length > 0) {
        const formacaoList = document.getElementById('preview-formacao');
        curriculumData.formacoes.forEach(form => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${form.grau} em ${form.curso}</strong><br>
                           Instituição: ${form.instituicao}<br>
                           Conclusão: ${form.conclusao}`;
            formacaoList.insertBefore(li, formacaoList.firstChild);
        });
    }
    
    // Experiências adicionadas
    if (curriculumData.experiencias.length > 0) {
        const expDiv = document.getElementById('preview-experiencias');
        curriculumData.experiencias.forEach(exp => {
            const div = document.createElement('div');
            div.className = 'experience-item';
            div.innerHTML = `<p><strong>${exp.empresa}</strong><br>
                            Período: ${exp.periodo}<br>
                            Cargo: ${exp.cargo}</p>`;
            expDiv.insertBefore(div, expDiv.firstChild);
        });
    }
    
    // Atividades profissionais adicionadas
    if (curriculumData.atividades.length > 0) {
        const atividadesList = document.getElementById('preview-atividades');
        curriculumData.atividades.forEach(ativ => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${ativ.empresaCargo}:</strong> ${ativ.descricao}`;
            atividadesList.insertBefore(li, atividadesList.firstChild);
        });
    }
    
    // Cursos adicionados
    if (curriculumData.cursos.length > 0) {
        const cursosList = document.getElementById('preview-cursos');
        curriculumData.cursos.forEach(curso => {
            const li = document.createElement('li');
            li.textContent = `${curso.nome} -- ${curso.instituicao} -- ${curso.ano};`;
            cursosList.insertBefore(li, cursosList.firstChild);
        });
    }
}

// Gerar PDF
function generatePDF() {
    // Ocultar painel de controle antes de imprimir
    const controlPanel = document.querySelector('.control-panel');
    const originalDisplay = controlPanel.style.display;
    controlPanel.style.display = 'none';
    
    // Abrir diálogo de impressão do navegador
    window.print();
    
    // Restaurar painel de controle após impressão
    setTimeout(() => {
        controlPanel.style.display = originalDisplay;
    }, 500);
}

// Resetar formulário
function resetForm() {
    if (confirm('Tem certeza que deseja resetar todos os dados para o padrão?')) {
        location.reload();
    }
}

// Inicializar no modo edição
window.onload = function() {
    setMode('editar');
    populateEditForm();
};
