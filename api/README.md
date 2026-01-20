# API de Musics

## Descrição

Esta é uma **API RESTful em Node.js** que consome dados do arquivo CSV `top_2010-now.csv` (exportado do Spotify / coleções pessoais) e expõe endpoints para consulta.

Principais funcionalidades:

- Retorna todas as faixas com **filtragem flexível** (busca por *contains* em qualquer campo)
- Retornar todos os filems com filtragem de **menor, igual, ou maior**, para campos numéricos
- **Ordenação** por qualquer campo do dataset
- **Paginação** opcional com `pag` e `pag-size`
- Recuperação de um registro específico por **ID** (índice baseado em 1)

O servidor utiliza **Express.js** e carrega os dados em memória no startup para respostas rápidas. A rota raiz (`GET /`) apresenta rotas e campos disponíveis para exploração rápida.

---

## Campos Disponíveis

Os nomes de coluna são normalizados para *snake_case* durante a leitura do CSV. Exemplos de campos que você pode usar em filtros/ordenação:

- `track_uri`
- `track_name`
- `artist_uri_s` (quando houver múltiplos URIs)
- `artist_name_s` (quando houver múltiplos artistas)
- `album_uri`, `album_name`
- `album_release_date` (ano extraído automaticamente)
- `track_duration_ms`
- `explicit` (booleano)
- `popularity`
- `artist_genres`
- `danceability`, `energy`, `key`, `loudness`, `speechiness`, `acousticness`, `instrumentalness`, `liveness`, `valence`, `tempo`, `time_signature`

Observação: o conjunto completo de campos retornados está disponível no JSON da rota raiz (`GET /`).

---

## Instalação

Pré-requisitos: Node.js (versão 14 ou superior recomendado).

1. Entre na pasta `musics`:

    ```bash
    cd musics
    ```

2. Instale dependências (você precisa estar no mesmo diretório de "package.json"):

    ```bash
    npm install
    ```

3. Inicie o servidor:

    ```bash
    npm start
    ```

Por padrão o servidor escuta na porta `3000`. Para alterar, defina a variável de ambiente `PORT`.

Exemplo (Windows cmd):

```cmd
set PORT=4000
npm start
```

---

## Rotas da API

### GET `/

Retorna uma introdução à API, rotas disponíveis e a lista de campos (`fieldsAvailable`) — útil para descobrir quais colunas você pode filtrar/ordenar.

### GET `/musics`

Retorna a lista completa de faixas ou uma versão filtrada/ordenada/paginada.

Comportamento resumido:

- Sem query strings: retorna todos os registros (atenção: arquivo grande pode gerar resposta volumosa)
- Filtros: busca por substring (*contains*), *case-insensitive*, aplicada a qualquer campo
- Ordenação: aplicável após filtro usando `sort`
- Paginação: use `pag` e `pag-size` para limitar resultados

### GET `/musics/:id`

Retorna o objeto da faixa pelo ID sequencial (1-based). Retorna **404** se o ID for inválido.

---

## Query Strings

### Filtros por campo

Formato:

```http
?campo=valor
```

Regras:

- Busca por **substring** (não exige igualdade)
- *Case-insensitive*
- Vários filtros são combinados com **AND**

Exemplos:

```http
GET /musics?artist_name_s=ed%20sheeran
GET /musics?artist_genres=pop
GET /musics?album_release_date=2014
GET /musics?track_name=love&artist_name_s=dua%20lipa
```

### Comparações Numéricas (`_gt`, `_lt`, `_eq`)

Além da filtragem textual por substring, alguns campos inteiros suportam filtros de comparação numérica usando sufixos:

- `campo_gt` — maior que
- `campo_lt` — menor que
- `campo_eq` — igual a

Campos inteiros suportados (exemplos): `track_duration_ms`, `popularity`, `key`, `time_signature`, `disc_number`, `track_number`, `album_release_date`.

Exemplos:

```http
GET /musics?album_release_date_gt=2015
GET /musics?popularity_gt=70&popularity_lt=90
GET /musics?track_duration_ms_eq=210000
```

Se um valor não for um inteiro válido, a API retorna `400 Bad Request` com um erro descritivo.

### Ordenação (`sort`)

Formato:

```http
?sort=campo:ordem
```

- `ordem`: `asc` (padrão) ou `desc`
- Qualquer campo pode ser usado (numéricos ordenam numericamente, strings alfabeticamente)

Exemplos:

```http
GET /musics?sort=popularity:desc
GET /musics?artist_name_s=queen&sort=album_release_date:asc
```

### Paginação (`pag` e `pag-size`)

- `pag`: página (inteiro ≥ 1)
- `pag-size`: itens por página (inteiro ≥ 1, padrão 10)

Exemplos:

```http
GET /musics?pag=1&pag-size=20
GET /musics?sort=popularity:desc&pag=2&pag-size=5
```

Erros de paginação resultam em HTTP 400 com mensagem explicativa.

---

## Exemplo de uso

```http
GET http://localhost:3000/musics
GET http://localhost:3000/musics?artist_name_s=ed%20sheeran&sort=popularity:desc&pag=1&pag-size=5
GET http://localhost:3000/musics?danceability=0.8&sort=tempo:asc
GET http://localhost:3000/musics/10
```

Exemplo com `curl`:

```bash
curl "http://localhost:3000/musics?artist_name_s=dua%20lipa&sort=popularity:desc&pag-size=5"
```

---

## Tratamento de Erros

Formato consistente para erros:

```json
{ "error": "Mensagem clara e descritiva" }
```

Códigos comuns:

- **400 Bad Request** — parâmetros inválidos (ex.: `pag < 1`, `pag-size = 0`)
- **404 Not Found** — ID inexistente ou rota inválida
- **500 Internal Server Error** — erro interno ou falha ao carregar/parsing do CSV

---

## Estrutura do projeto

```text
musics/
├── index.js                # Servidor Express e lógica de leitura/filtragem
├── package.json            # Dependências e scripts
├── top_2010-now.csv  # Dataset usado pela API (apenas registros com ano >= 2010)
├── README.md               # Documentação (este arquivo)
└── .gitignore
```

---

## Observações

- O CSV deve estar na mesma pasta de `index.js` (`musics/top_2010-now.csv`).
- Campos numéricos são convertidos automaticamente (`track_duration_ms`, `danceability`, `energy`, `loudness`, `tempo`, `popularity`, entre outros).
- O campo `album_release_date` tem apenas o ano extraído para facilitar ordenação e filtragem por ano.
- Filtragem é por contenção textual; para buscas numéricas/intervalos, filtre utilizando os sufixos "_gt", "_lt", "_eq"
