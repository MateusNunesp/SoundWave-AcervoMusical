const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;
let musics = [];

const filteredCsv = 'top_2010-now.csv';

if (!fs.existsSync(filteredCsv)) {
  console.error(`Arquivo ${filteredCsv} não encontrado. Coloque o CSV (com registros desde 2010) na pasta 'musics' antes de iniciar o servidor.`);
} else {
  fs.createReadStream(filteredCsv)
    .pipe(csv({ mapHeaders: ({ header }) => {
      // Normalização dos cabeçalhos para snake_case (minúsculas, não alfanuméricos -> sublinhado)
      return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    } }))
    .on('data', (data) => {
      const normalized = {};
      for (const key in data) {
        let val = data[key];
        if (typeof val === 'string') val = val.trim();
        if (val === '') val = null;
        // Detecção de campos numéricos a partir de colunas comuns do conjunto de dados do Spotify
        if (val !== null) {
          const numericFields = [
            'track_duration_ms', 'danceability', 'energy', 'key', 'loudness', 'mode', 'speechiness',
            'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature', 'popularity',
            'disc_number', 'track_number'
          ];

          if (numericFields.includes(key)) {
            const num = parseFloat(val.toString().replace(/,/g, '.'));
            normalized[key] = isNaN(num) ? null : num;
            continue;
          }

          if (key === 'album_release_date') {
            const digits = val.toString().slice(0, 10); // YYYY or YYYY-MM-DD
            const year = parseInt(digits.split('-')[0], 10);
            normalized[key] = isNaN(year) ? val : year;
            continue;
          }

          if (key === 'explicit') {
            const low = val.toString().toLowerCase();
            if (low === 'true' || low === '1') normalized[key] = true;
            else if (low === 'false' || low === '0') normalized[key] = false;
            else normalized[key] = val;
            continue;
          }
        }

        normalized[key] = val;
      }

      musics.push(normalized);
    })
    .on('end', () => {
      console.log('CSV de músicas carregado com sucesso');
    })
    .on('error', (err) => {
      console.error('Erro ao carregar o CSV:', err);
    });
}

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API de Musics (top_2010-now.csv)! Esta API expõe dados do dataset de músicas carregados de um arquivo CSV.',
    availableRoutes: [
      {
        method: 'GET',
        path: '/musics',
        description: 'Retorna todas as músicas com suporte a filtragem, ordenação e paginação opcional via query strings.'
      },
      {
        method: 'GET',
        path: '/musics/:id',
        description: 'Retorna uma música específica pelo ID (índice baseado em 1).'
      }
    ],
    fieldsAvailable: [
      'track_uri', 'track_name', 'artist_uri_s', 'artist_name_s', 'album_uri', 'album_name', 'album_release_date',
      'track_duration_ms', 'explicit', 'popularity', 'artist_genres', 'danceability', 'energy', 'key', 'loudness',
      'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature', 'label'
    ],
    note: 'Filtragem é case-insensitive e por contenção de string. Use URL encoding para espaços. Para ordenar use `sort=field:asc|desc`.'
  });
});

app.get('/musics', (req, res) => {
  try {
    let filtered = [...musics];

    // Comparação numérica para campos inteiros
    const intFields = ['track_duration_ms', 'popularity', 'key', 'time_signature', 'disc_number', 'track_number', 'album_release_date'];
    for (const f of intFields) {
      const gt = req.query[`${f}_gt`];
      const lt = req.query[`${f}_lt`];
      const eq = req.query[`${f}_eq`];
      if (gt !== undefined) {
        const n = parseInt(gt, 10);
        if (isNaN(n)) return res.status(400).json({ error: `Parâmetro inválido para ${f}_gt` });
        filtered = filtered.filter(m => typeof m[f] === 'number' && m[f] > n);
      }
      if (lt !== undefined) {
        const n = parseInt(lt, 10);
        if (isNaN(n)) return res.status(400).json({ error: `Parâmetro inválido para ${f}_lt` });
        filtered = filtered.filter(m => typeof m[f] === 'number' && m[f] < n);
      }
      if (eq !== undefined) {
        const n = parseInt(eq, 10);
        if (isNaN(n)) return res.status(400).json({ error: `Parâmetro inválido para ${f}_eq` });
        filtered = filtered.filter(m => typeof m[f] === 'number' && m[f] === n);
      }
    }

    // Filtragem por campos via query string (busca parcial, case-insensitive)
    for (let key in req.query) {
      if (key !== 'sort' && key !== 'pag' && key !== 'pag-size') {
        if (/(_gt|_lt|_eq)$/.test(key)) continue;
        filtered = filtered.filter(item =>
          item[key] && item[key].toString().toLowerCase().includes(req.query[key].toLowerCase())
        );
      }
    }

    if (req.query.sort) {
      const [field, order = 'asc'] = req.query.sort.split(':');
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (!isNaN(valA)) valA = parseFloat(valA);
        if (!isNaN(valB)) valB = parseFloat(valB);
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (order === 'desc') {
          return valA < valB ? 1 : (valA > valB ? -1 : 0);
        } else {
          return valA > valB ? 1 : (valA < valB ? -1 : 0);
        }
      });
    }

    if (req.query.pag) {
      const page = parseInt(req.query.pag) || 1;
      const pageSize = parseInt(req.query['pag-size']) || 10;
      if (page < 1 || pageSize < 1) {
        return res.status(400).json({ error: 'Parâmetros de paginação inválidos' });
      }
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      filtered = filtered.slice(start, end);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.get('/musics/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id < 1 || id > musics.length) {
      return res.status(404).json({ error: 'Música não encontrada' });
    }
    res.json(musics[id - 1]);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

app.listen(port, () => {
  console.log(`Servidor de musics rodando na porta ${port}`);
});
