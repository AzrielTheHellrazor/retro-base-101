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
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        fontSize: '32px',
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.8)',
        letterSpacing: '-0.5px'
      }}>
        Retro NFT Leaderboard
      </h1>
      
      {leaderboardData.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: 'rgba(0, 0, 0, 0.5)',
          fontSize: '18px'
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
                <div className="wallet-short">{topUser.walletAddress?.slice(0, 6)}...{topUser.walletAddress?.slice(-4)}</div>
                <div className="total-paid">{parseFloat(topUser.totalPaid || 0).toFixed(6)} ETH</div>
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
                    <div className="wallet-short-small">{user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}</div>
                    <div className="total-paid-small">{parseFloat(user.totalPaid || 0).toFixed(6)} ETH</div>
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

