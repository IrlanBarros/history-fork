# HistoryFork: O Motor de Paradoxos Temporais ⏳🍴

O **HistoryFork** é uma plataforma avançada de simulação de ucronias (histórias alternativas) que utiliza inteligência artificial generativa para projetar ramificações temporais a partir de pontos de divergência históricos. 

Diferente de simuladores lineares, o HistoryFork permite a criação de uma **Árvore de Realidades**, onde cada simulação pode servir de base para novas bifurcações, calculando dinamicamente o risco de colapso temporal (paradoxos).

## 🚀 Funcionalidades Principais

- **Ramificação Recursiva (The Fork):** Crie novas realidades a partir de simulações existentes, preservando o contexto histórico da linhagem.
- **Cálculo de Risco de Paradoxo:** Algoritmo dinâmico que avalia a instabilidade da linha do tempo baseada na magnitude da mudança e na distância temporal ($\Delta t$).
- **Visualização Multimodal:**
    - **Grafos de Divergência:** Visualização clara entre a linha do tempo real e a alternativa via *Mermaid.js*.
    - **Cartografia de Impacto:** Mapeamento geográfico dos epicentros da mudança via *Leaflet.js*.
- **Galeria de Arquivos Temporais:** Sistema de busca e filtragem de todas as ucronias persistidas no banco de dados.
- **Engine de IA Modular:** Prompts externalizados em JSON para ajuste fino da "personalidade" do historiador artificial.

## 🏗️ Arquitetura do Sistema

O projeto segue os princípios da **Clean Architecture**, garantindo baixo acoplamento e alta manutenibilidade.

### Estrutura de Pastas
```text
/
├── app/
│   ├── core/           # Lógica de negócio (Services, Repositories, Models)
│   ├── resources/      # Configurações e Prompts JSON
│   ├── static/         # Frontend (HTML, CSS Modular, JS Modules)
│   └── main.py         # Ponto de entrada do FastAPI
├── data/               # Banco de dados SQLite persistente
├── .env                # Chaves de API e variáveis de ambiente
├── .gitignore          # Ignorar arquivos que não devem subir para a repo remota
└── requirements.txt    # Dependências do projeto
```

### Tecnologias Utilizadas
* **Backend**: Python 3.13, FastAPI, SQLAlchemy, Pydantic.
* **IA**: Google Gemini 3.1 Flash (SDK `google-genai`).
* **Banco de Dados**: SQLite.
* **Frontend**: HTML5, CSS3 (Modularizado), JavaScript (ES6 Modules), Leaflet.js, Mermaid.js.

## 🧮 A Fórmula do Paradoxo

A estabilidade de cada ramificação é calculada matematicamente para determinar o risco de colapso da realidade:

**R_total = R_pai + ((delta_t * Magnitude) / 20)**

Onde:
* **R_pai**: Risco acumulado herdado da realidade ancestral.
* **delta_t**: Diferença temporal entre o ano da mudança e o presente.
* **Magnitude**: Nível de ruptura histórica (1 a 10) avaliado pela inteligência artificial.

## 🛠️ Configuração e Instalação

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/IrlanBarros/history-fork.git
   cd history-fork
   ```

2. **Configurar o Ambiente Virtual**:
   ```bash
    python -m venv venv
    source venv/bin/activate  # No Linux
   ```

3. **Instalar Dependências:**
   ```bash
    pip install -r requirements.txt
   ```

4. **Variáveis de Ambiente**:
Crie um arquivo .env na raiz e adicione sua chave:
GEMINI_API_KEY=sua_chave_aqui

5. **Preparar o Banco de Dados**:
   ```bash
    mkdir -p data
   ```

6. **Executar o Servidor (na raiz do projeto)**:
   ```bash
    uvicorn app.main:app --reload
   ```

## 👨‍💻 Autor
**Francisco Irlan de Oliveira Barros** Estudante de Ciência da Computação - Universidade Federal do Cariri (UFCA)

---
*Projeto desenvolvido por que estava com vontade de programar!*