import React from 'react'

export function Header({ 
  genero, setGenero, 
  ano, setAno, 
  duracaoMax, setDuracaoMax 
}) {
  
  return (
    <header>
      <h1>SoundWave 🎵</h1>
      
      <div className="filtros-container">
        
        <div className="filtro-item">
          <label>Gênero:</label>
          <select value={genero} onChange={(e) => setGenero(e.target.value)}>
            <option value="">Todos</option>
            <option value="pop">Pop</option>
            <option value="rock">Rock</option>
            <option value="hip hop">Hip Hop</option>
            <option value="jazz">Jazz</option>
            <option value="metal">Metal</option>
            <option value="electronic">Eletrônica</option>
          </select>
        </div>

        <div className="filtro-item">
          <label>Ano:</label>
          <input 
            type="number" 
            placeholder="Ex: 2015"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
          />
        </div>

        <div className="filtro-item">
          <label>Duração Máx: {duracaoMax} min</label>
          <input 
            type="range" 
            min="1" 
            max="15" 
            value={duracaoMax}
            onChange={(e) => setDuracaoMax(e.target.value)}
          />
        </div>

      </div>
    </header>
  )
}