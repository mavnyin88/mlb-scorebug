import { useEffect, useState } from 'react'
import {useNavigate } from 'react-router-dom'

interface TeamData {
  team: {
    name: string
  }
  leagueRecord?: {
    wins: number
    losses: number
  }
}

interface Game {
  gamePk: number
  gameDateTime: string
  status: {
    abstractGameState: string
  }
  teams: {
    away: TeamData
    home: TeamData
  }
}

function GamesList() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    const fetchGames = async () => {
      try {
        const response = await fetch(
          `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateString}`
        )
        if (!response.ok) throw new Error('Failed to fetch games')
        const data = await response.json()
        setGames(data.dates?.[0]?.games || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  const handleGameClick = (game: Game) => {
    const awayName = game.teams.away.team.name
    const homeName = game.teams.home.team.name
    navigate(`/game/${game.gamePk}?away=${encodeURIComponent(awayName)}&home=${encodeURIComponent(homeName)}`)
  }

  if (loading) return <div className="container">Loading...</div>
  if (error) return <div className="container error">Error: {error}</div>
  if (games.length === 0) return <div className="container">No games today</div>

  return (
    <div className="container">
      <h1>MLB Scorebug</h1>
      <div className="games-grid">
        {games.map((game) => (
          <div
            key={game.gamePk}
            className="game-card"
            onClick={() => handleGameClick(game)}
            style={{ cursor: 'pointer' }}
          >
            <div className="teams">
              <div className="team away">
                <div className="team-name">{game.teams.away.team.name}</div>
                {game.teams.away.leagueRecord && (
                  <div className="team-record">
                    {game.teams.away.leagueRecord.wins}-{game.teams.away.leagueRecord.losses}
                  </div>
                )}
              </div>
              <div className="vs">vs</div>
              <div className="team home">
                <div className="team-name">{game.teams.home.team.name}</div>
                {game.teams.home.leagueRecord && (
                  <div className="team-record">
                    {game.teams.home.leagueRecord.wins}-{game.teams.home.leagueRecord.losses}
                  </div>
                )}
              </div>
            </div>
            <div className="game-status">{game.status.abstractGameState}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GamesList;