import React, { useState, useEffect } from 'react'
import './RetroDevice.css'
// GIF dosyasını import et (assets klasörüne koyduğunuz GIF dosyasının adını buraya yazın)
import gifAnimation from '../assets/animation.gif'
import beeImage from '../assets/bee.png'
import unicornImage from '../assets/unicorn.png'

function RetroDevice({ showControls = true, nftImage = null, ledHue: externalHue, onLedHueChange, userProfile = null, nftConnector = null, paymentButton = null, imageObjectFit = 'contain' }) {
  // Çerçeve boyutu: 264x380px (80% küçültüldü)
  // Ekran boyutu: 192x224px (80% küçültüldü)
  const frameWidth = 264
  const frameHeight = 380
  const screenWidth = 192
  const screenHeight = 224

  // LED rengi state'i (HSL hue değeri, başlangıç turuncu ~30)
  const [hue, setHue] = useState(externalHue !== undefined ? externalHue : 30)

  // External hue değiştiğinde güncelle
  useEffect(() => {
    if (externalHue !== undefined) {
      setHue(externalHue)
    }
  }, [externalHue])

  // Hue değiştiğinde parent'a bildir
  const handleHueChange = (newHue) => {
    setHue(newHue)
    if (onLedHueChange) {
      onLedHueChange(newHue)
    }
  }

  // Ekran metni state'i
  const [screenText, setScreenText] = useState('')

  // Ekranda gösterilecek içerik: 'gif', 'bee', 'unicorn', veya null (metin gösterilir)
  const [screenContent, setScreenContent] = useState('gif')

  // Ekran arka plan rengi state'i (HSL hue değeri, başlangıç beyaz için 0)
  const [screenBgHue, setScreenBgHue] = useState(0)

  // Ekran arka plan modu: 'white', 'black', 'color'
  const [screenBgMode, setScreenBgMode] = useState('white')

  // HSL'yi hex'e çevir
  const hslToHex = (h, s = 100, l = 50) => {
    h = h % 360
    s = s / 100
    l = l / 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = l - c / 2

    let r = 0, g = 0, b = 0

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c
    } else {
      r = c; g = 0; b = x
    }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  const ledColor = hslToHex(hue)

  // Rainbow gradient - violet, indigo, blue, yellow, red, orange
  const rainbowGradient = `
    radial-gradient(circle at 15% 25%, rgba(143, 0, 255, 0.7) 0%, transparent 40%),
    radial-gradient(circle at 35% 20%, rgba(75, 0, 130, 0.7) 0%, transparent 40%),
    radial-gradient(circle at 55% 25%, rgba(0, 150, 255, 0.7) 0%, transparent 40%),
    radial-gradient(circle at 75% 35%, rgba(255, 255, 0, 0.7) 0%, transparent 40%),
    radial-gradient(circle at 35% 75%, rgba(255, 0, 0, 0.7) 0%, transparent 40%),
    radial-gradient(circle at 65% 70%, rgba(255, 127, 0, 0.7) 0%, transparent 40%),
    linear-gradient(135deg, #8F00FF 0%, #6B00B3 12%, #4B0082 24%, #3366FF 36%, #0080FF 48%, #CCCC00 60%, #FFFF00 72%, #FF0000 84%, #FF9500 92%, #FFAA00 100%)
  `

  // Ekran arka plan rengi (beyaz, siyah veya renkli)
  const screenBgColor =
    screenBgMode === 'white' ? '#ffffff' :
    screenBgMode === 'black' ? '#000000' :
    hslToHex(screenBgHue, 100, 50)

  // Ekran rengine göre yazı rengi (kontrastlı)
  const screenTextColor =
    screenBgMode === 'white' ? '#000000' :
    screenBgMode === 'black' ? '#ffffff' :
    '#000000' // Renkli modda lightness 50 olduğu için siyah yazı

  // Ekranı çerçevenin ortasına yerleştir ve üst çizgiden 96px aşağı (80% küçültüldü)
  const screenLeft = (frameWidth - screenWidth) / 2
  const screenTop = 96

  // Gradient'i dinamik olarak oluştur (288px'den sonra kırık beyaz - 80% küçültüldü)
  const gradientStyle = {
    background: `linear-gradient(to bottom, transparent 0%, transparent 240px, #efefef 288px, #efefef 100%), ${rainbowGradient}`
  }

  return (
    <div className="retro-device-container">
      <div className="retro-device">
        {/* Çerçeve (Frame) */}
        <div
          className="device-frame"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            ...gradientStyle,
          }}
        >
          {/* Ekran (Screen) */}
          <div
            className="device-screen"
            style={{
              width: `${screenWidth}px`,
              height: `${screenHeight}px`,
              left: `${screenLeft}px`,
              top: `${screenTop}px`,
              backgroundColor: screenBgColor,
            }}
          >
            {nftImage ? (
              <img
                src={nftImage}
                alt="NFT"
                className="screen-gif"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: imageObjectFit,
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300'
                }}
              />
            ) : screenContent === 'gif' ? (
              <img 
                src={gifAnimation} 
                alt="GIF" 
                className="screen-gif"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : screenContent === 'bee' ? (
              <img 
                src={beeImage} 
                alt="Bee" 
                className="screen-gif"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : screenContent === 'unicorn' ? (
              <img 
                src={unicornImage} 
                alt="Unicorn" 
                className="screen-gif"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div className="screen-text" style={{ color: screenTextColor }}>{screenText}</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Kullanıcı Profili ve NFT Bağla */}
      {(userProfile || nftConnector) && (
        <div className="user-profile-section" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* User Info Card */}
          {userProfile && (
            <div className="user-info-card">
              <div className="user-avatar">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="user-details">
                <span className="user-label">OWNER</span>
                <span className="user-name">{userProfile.username}</span>
              </div>
            </div>
          )}
          
          {/* NFT Bağla Butonu */}
          {nftConnector}
        </div>
      )}
      
      {/* Payment Button */}
      {paymentButton}

      {/* Kontrol Paneli - En Alta (Payment Button'dan sonra) */}
      {showControls && (
        <div className="control-panel">
          <label className="color-label">
            Light Color:
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => handleHueChange(parseInt(e.target.value))}
              className="rainbow-slider"
            />
          </label>
        </div>
      )}
    </div>
  )
}

export default RetroDevice

