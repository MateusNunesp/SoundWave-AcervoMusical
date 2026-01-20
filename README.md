# SoundWave 🎵

O **SoundWave** é um catálogo de músicas interativo desenvolvido como Single Page Application (SPA). O projeto simula uma plataforma de streaming, permitindo listar, filtrar e visualizar detalhes de músicas através de uma interface moderna e responsiva.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias e conceitos:

* **[React](https://react.dev/):** Biblioteca principal para construção da interface.
* **[Vite](https://vitejs.dev/):** Ferramenta de build rápida para o ambiente de desenvolvimento.
* **CSS3:** Estilização responsiva utilizando *Grid Layout* e *Flexbox*.
* **JavaScript (ES6+):** Lógica de manipulação de arrays e consumo de dados assíncronos.
* **Fetch API:** Utilizada para realizar as requisições HTTP RESTful.

## ⚙️ Integração com a API

A arquitetura do projeto foi desenhada para delegar o processamento de dados para o servidor (**Server-Side Filtering**), garantindo melhor performance:

1. **Filtragem no Back-end:**
   A aplicação não filtra os dados localmente. Ao alterar os inputs de *Gênero*, *Ano* ou *Duração*, o React constrói dinamicamente uma URL com parâmetros de consulta (Query Params) e dispara uma nova requisição `GET`.
   * *Exemplo:* `http://localhost:3000/musics?pag-size=20&artist_genres=pop`

2. **Tratamento de Filtros Numéricos:**
   Para a duração das músicas, foi implementada a lógica de filtro "menor que" (`_lt`), convertendo o valor de minutos para milissegundos antes do envio para a API.

3. **Detalhes Sob Demanda:**
   O modal de detalhes consome um endpoint específico (`/musics/:id`). Isso significa que os detalhes completos da música só são baixados quando o usuário clica no card, economizando dados.

## 📦 Instalação e Execução

Este repositório contém tanto o **Back-end (API)** quanto o **Front-end (Web)**. É necessário rodar ambos simultaneamente para que a aplicação funcione.

### Pré-requisitos
* Certifique-se de ter o **[Node.js](https://nodejs.org/)** instalado em sua máquina.

### Passo 1: Rodando a API
Abra um terminal na pasta raiz do projeto e execute os comandos abaixo:

~~~bash
cd api
npm install
npm start
~~~

> A API iniciará na porta **3000**. Mantenha este terminal aberto.

### Passo 2: Rodando a Aplicação Web
Abra um **novo terminal** (na pasta raiz do projeto) e execute:

~~~bash
cd web
npm install
npm run dev
~~~

> O site estará disponível no endereço indicado no terminal (geralmente `http://localhost:5173`).

---

### 📂 Estrutura do Projeto

~~~text
SoundWave/
├── api/              # Código do Servidor (Node.js)
└── web/              # Código do Front-end (React)
    ├── src/
    │   ├── components/
    │   │   ├── Card.jsx
    │   │   ├── Header.jsx
    │   │   ├── Modal.jsx
    │   │   └── Footer.jsx
    │   └── App.jsx
    └── public/
~~~

---

Desenvolvido por **Mateus** como parte do projeto final de Trainee.
