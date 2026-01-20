
import { useState, useEffect } from 'react'
import './Modal.css'

export function Modal({ musicId, onClose }) {
  const [detalhes, setDetalhes] = useState(null)

useEffect(() => {

    fetch(`http://localhost:3000/musics/${musicId}`)
      .then(res => res.json())
      .then(data => setDetalhes(data))
      .catch(err => console.error(err))
  }, [musicId])


  if (!detalhes) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{textAlign: 'center', color: 'white'}}>
          <h2>Carregando...</h2>
          <button className="close-btn" onClick={onClose}>X</button>
        </div>
      </div>
    )
  }


  const minutos = Math.floor(detalhes.track_duration_ms / 60000)
  const segundos = ((detalhes.track_duration_ms % 60000) / 1000).toFixed(0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>
        
        <h2>{detalhes.track_name}</h2>
        <hr style={{margin: '15px 0', borderColor: '#444'}}/>
        
        <div className="modal-body">
          <p><strong>Artista:</strong> {detalhes.artist_name_s}</p>
          <p><strong>Álbum:</strong> {detalhes.album_name}</p>
          <p><strong>Duração:</strong> {minutos}:{segundos.padStart(2, '0')}</p>
        </div>
      </div>
    </div>
  )
}