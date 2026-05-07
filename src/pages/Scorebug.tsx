import { useParams, useSearchParams } from 'react-router-dom'
import { usePolling } from '../hooks/usePolling'
import { usePageVisibility } from '../hooks/usePageVisibility'

const Scorebug = () => {
  const { gamePk } = useParams<{ gamePk: string }>()
  const [searchParams] = useSearchParams()
  const isPageVisible = usePageVisibility()

  const awayTeam = searchParams.get('away') || 'Away'
  const homeTeam = searchParams.get('home') || 'Home'

  // Fetch linescore data
  const fetchLinescore = async () => {
    if (!gamePk) throw new Error('Game ID not found')
    const response = await fetch(
      `https://statsapi.mlb.com/api/v1/game/${gamePk}/linescore`
    )
    if (!response.ok) throw new Error('Failed to fetch game linescore')
    return await response.json()
  }

  // Use polling hook - polls every 10 seconds when page is visible
  const { data, isPending, error, lastUpdated } = usePolling(
    fetchLinescore,
    {
      interval: 10000,
      enabled: isPageVisible
    }
  )

  if (error && !data) {
    return (
      <div style={{ padding: "20px", color: '#FFF' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: '#1e40af',
            color: '#FFF',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back
        </button>
        <div style={{ color: '#ff6b6b', fontSize: '16px' }}>Error: {error}</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: "20px", color: '#FFF' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: '#1e40af',
            color: '#FFF',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back
        </button>
        <div>Loading game data...</div>
      </div>
    )
  }

  const svgArrow = (inningState: string) => {
    switch (inningState) {
      case "Top":
        return (
          <svg
            width="15"
            height="10"
            viewBox="0 0 200 150"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="15" height="10" fill="transparent" />
            <polygon points="100,20 30,120 170,120" fill="#FFF" />
          </svg>
        );
      case "Bottom": {
        return (
          <svg
            width="15"
            height="10"
            viewBox="0 0 200 150"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="15" height="10" fill="transparent" />
            <polygon points="100,130 30,30 170,30" fill="#FFF" />
          </svg>
        );
      }
      default:
        return <span style={{ fontSize: '12px' }}>Mid{" "}</span>;
    }
  };

  // Show loading state
  if (!data) {
    return (
      <div style={{ padding: "20px", color: '#FFF' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: '#1e40af',
            color: '#FFF',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back
        </button>
        <div>Loading game data...</div>
      </div>
    )
  }

  const teams = data.teams;

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => window.history.back()}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: '#1e40af',
          color: '#FFF',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        ← Back
      </button>
      <div style={{ marginBottom: '20px', color: '#FFF', fontSize: '18px' }}>
        {awayTeam} vs {homeTeam}
      </div>
      {/* <div style={{
        marginBottom: '15px',
        fontSize: '12px',
        color: '#9ca3af',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <span>{isPageVisible ? '👁️ Page Visible' : '⚫ Page Hidden'}</span>
        {isPending && <span>🔄 Updating...</span>}
        {error && <span style={{ color: '#fca5a5' }}>⚠️ {error}</span>}
        {lastUpdated && (
          <span>Last: {lastUpdated.toLocaleTimeString()}</span>
        )}
      </div> */}
      <div className="scorebug-box">
        <div className="team-score-container">
          <p className="team-score-wrapper">
            <span className="team-name">{homeTeam.substring(0, 3).toUpperCase()}</span>
            <span className="team-score">{teams.home.runs}</span>
          </p>
          <p className="team-score-wrapper">
            <span className="team-name">{awayTeam.substring(0, 3).toUpperCase()}</span>
            <span className="team-score">{teams.away.runs}</span>
          </p>
        </div>
        <div className="bases-and-count">
          <svg
            className="bases-svg"
            width="60"
            height="40"
            viewBox="-4 -4 66 48"
          >
            <rect
              className={`base second ${data.offense?.second ? 'active' : ''}`}
              x="22"
              y="2"
              width="16"
              height="16"
              transform="rotate(45 30 10)"
            />
            <rect
              className={`base third ${data.offense?.third ? 'active' : ''}`}
              x="6"
              y="22"
              width="16"
              height="16"
              transform="rotate(45 14 30)"
            />
            <rect
              className={`base first ${data.offense?.first ? 'active' : ''}`}
              x="38"
              y="22"
              width="16"
              height="16"
              transform="rotate(45 46 30)"
            />
          </svg>
          <p className="balls-strikes">
            <span>{data.balls}</span> - <span>{data.strikes}</span>
          </p>
        </div>
        <div className="inning-and-outs">
          <div className="inning">
            {svgArrow(data.inningState)}
            <p>{data.currentInningOrdinal}</p>
          </div>
          <div className="outs-container">
            {[0, 1].map((i) => (
              <div
                key={`out-${i}`}
                className="out-circle"
                style={{
                  backgroundColor: data.outs > i ? "#FFF" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scorebug;

