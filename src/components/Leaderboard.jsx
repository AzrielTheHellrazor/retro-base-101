import React, { useState, useEffect } from 'react'
import RetroDevice from './RetroDevice'
import { getLeaderboard } from '../services/firebaseService'
import './Leaderboard.css'

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([])

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await getLeaderboard()
        setLeaderboardData(data)
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      }
    }
    
    loadLeaderboard()
    
    // Her 5 saniyede bir güncelle (gerçek uygulamada WebSocket veya real-time listener kullanılabilir)
    const interval = setInterval(loadLeaderboard, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  // En üstte birinci sıradaki kullanıcı
  const topUser = leaderboardData[0]
  // Diğer kullanıcılar
  const otherUsers = leaderboardData.slice(1)
  
  return (
    <div className="leaderboard-container">
      <h1 className="page-title">
        Leaderboard
      </h1>
      
      {leaderboardData.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--base-text-secondary)',
          fontSize: '18px',
          background: 'var(--base-card)',
          borderRadius: '24px',
          border: '1px solid var(--base-border)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          No entries yet. Be the first to connect your wallet and join the leaderboard!
        </div>
      ) : (
        <>
          {/* En üstte birinci sıradaki kullanıcı */}
          {topUser && (
            <div className="top-device">
              <div className="rank-badge rank-1">#1</div>
              <div className="device-wrapper">
                <RetroDevice
                  showControls={false}
                  nftImage={topUser.nftImage}
                  ledHue={topUser.ledHue}
                />
              </div>
              <div className="user-info">
                {topUser.username ? (
                  <div className="user-profile">
                    {topUser.avatar ? (
                      <img
                        src={topUser.avatar}
                        alt={topUser.username}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {topUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="username">{topUser.username}</div>
                  </div>
                ) : (
                  <div className="wallet-short">{topUser.walletAddress?.slice(0, 6)}...{topUser.walletAddress?.slice(-4)}</div>
                )}
                <div className="total-paid">{parseFloat(topUser.totalPaid || 0).toFixed(2)} USDC</div>
              </div>
            </div>
          )}

          {/* Altında ikişer ikişer dizilmiş retro device'lar */}
          {otherUsers.length > 0 && (
            <div className="device-grid">
              {otherUsers.map((user, index) => (
                <div key={user.walletAddress || index} className="grid-item">
                  <div className="rank-badge">#{index + 2}</div>
                  <div className="device-wrapper-small">
                    <RetroDevice
                      showControls={false}
                      nftImage={user.nftImage}
                      ledHue={user.ledHue}
                    />
                  </div>
                  <div className="user-info-small">
                    {user.username ? (
                      <div className="user-profile-small">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="user-avatar-small"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="avatar-placeholder-small">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="username-small">{user.username}</div>
                      </div>
                    ) : (
                      <div className="wallet-short-small">{user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}</div>
                    )}
                    <div className="total-paid">{parseFloat(user.totalPaid || 0).toFixed(2)} USDC</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Leaderboard

