import { useState, useEffect } from 'react'
import { Card } from './components/Card'
import { Modal } from './components/Modal'
import { Header } from './components/Header' 
import { Footer } from './components/Footer' 
import './App.css'

function App() {

  const [musicas, setMusicas] = useState([])
  const [genero, setGenero] = useState('') 
  const [ano, setAno] = useState('')
  const [duracaoMax, setDuracaoMax] = useState(10)
  const [idSelecionado, setIdSelecionado] = useState(null) 

  useEffect(() => {

    let url = 'http://localhost:3000/musics?pag-size=20'
    
    if (genero !== '') url = url + '&artist_genres=' + genero
    if (ano !== '') url = url + '&album_release_date=' + ano
    if (duracaoMax) {
      
      const ms = duracaoMax * 60000 
      url = url + '&track_duration_ms_lt=' + ms
    }

    fetch(url)
      .then(res => res.json())
      .then(data => setMusicas(data))
      .catch(err => console.error("Erro:", err))
      
  }, [genero, ano, duracaoMax])

  return (
    <div className="container">
      
      <Header 
        genero={genero} 
        setGenero={setGenero}
        ano={ano} 
        setAno={setAno}
        duracaoMax={duracaoMax} 
        setDuracaoMax={setDuracaoMax}
      />

      <div className="grid-musicas">
        {musicas.map((musica, index) => {
          const idNumerico = index + 1; 
          return (
            <div 
              key={musica.track_uri || index} 
              className="card-wrapper"
              onClick={() => setIdSelecionado(idNumerico)} 
            >
              <Card item={musica} />
            </div>
          )
        })}
        
        {musicas.length === 0 && (
          <p className="msg-vazio">Nenhuma música encontrada.</p>
        )}
      </div>

      {idSelecionado && (
        <Modal 
          musicId={idSelecionado} 
          onClose={() => setIdSelecionado(null)} 
        />
      )}

      <Footer />
      
    </div>
  )
}

export default App