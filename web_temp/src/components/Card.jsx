import './Card.css' 

export function Card({ item }) {

  const minutos = Math.floor(item.track_duration_ms / 60000);
  const segundos = ((item.track_duration_ms % 60000) / 1000).toFixed(0);
  const tempoFormatado = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;

  return (
    <div className="card">
      <div className="card-content">
        <h3>{item.track_name}</h3>
        <p className="artist">🎤 {item.artist_name_s}</p>
        <p className="album">💿 {item.album_name}</p>
        
        <div className="tags">
          <span className="genre">{item.artist_genres ? item.artist_genres.split(',')[0] : 'Gênero n/a'}</span>
          <span className="time">⏱ {tempoFormatado}</span>
        </div>
      </div>
    </div>
  )
}