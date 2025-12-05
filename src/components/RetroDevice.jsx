import React, { useState, useEffect } from 'react'
import './RetroDevice.css'
// GIF dosyasını import et (assets klasörüne koyduğunuz GIF dosyasının adını buraya yazın)
import gifAnimation from '../assets/animation.gif'
import beeImage from '../assets/bee.png'
import unicornImage from '../assets/unicorn.png'

function RetroDevice({ showControls = true, nftImage = null, ledHue: externalHue, onLedHueChange, userProfile = null, nftConnector = null, paymentButton = null }) {
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
    background: `linear-gradient(to bottom, ${ledColor} 0%, ${ledColor} 240px, #efefef 288px, #efefef 100%)`
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
                  objectFit: 'contain',
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          marginTop: '24px',
          marginBottom: '24px'
        }}>
          {/* Avatar ve Kullanıcı Adı */}
          {userProfile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexDirection: 'row'
            }}>
              {/* Profil Fotoğrafı - Sol tarafta */}
              {userProfile.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt={userProfile.username}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                  onError={(e) => {
                    // Avatar yüklenemezse placeholder'a geç
                    e.target.style.display = 'none'
                  }}
                />
              ) : null}
              {/* Avatar yoksa placeholder göster */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#007aff',
                display: userProfile.avatar ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                {userProfile.username.charAt(0).toUpperCase()}
              </div>
              {/* Kullanıcı Adı - Sağ tarafta */}
              <span style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'rgba(0, 0, 0, 0.8)'
              }}>
                {userProfile.username}
              </span>
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
          LED Color:
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={(e) => handleHueChange(parseInt(e.target.value))}
            className="rainbow-slider"
          />
        </label>
        <label className="text-label">
          <span style={{ marginBottom: '12px', display: 'block' }}>Select Image:</span>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <img
              src={gifAnimation}
              alt="GIF"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setScreenContent('gif')
              }}
              className="thumbnail-image"
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain',
                cursor: 'pointer',
                border: screenContent === 'gif' ? '2px solid #007aff' : '2px solid transparent',
                borderRadius: '8px',
                padding: '4px',
                transition: 'all 0.2s',
                backgroundColor: screenContent === 'gif' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
              }}
            />
            <img
              src={beeImage}
              alt="Bee"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setScreenContent('bee')
              }}
              className="thumbnail-image"
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain',
                cursor: 'pointer',
                border: screenContent === 'bee' ? '2px solid #007aff' : '2px solid transparent',
                borderRadius: '8px',
                padding: '4px',
                transition: 'all 0.2s',
                backgroundColor: screenContent === 'bee' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
              }}
            />
            <img
              src={unicornImage}
              alt="Unicorn"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setScreenContent('unicorn')
              }}
              className="thumbnail-image"
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain',
                cursor: 'pointer',
                border: screenContent === 'unicorn' ? '2px solid #007aff' : '2px solid transparent',
                borderRadius: '8px',
                padding: '4px',
                transition: 'all 0.2s',
                backgroundColor: screenContent === 'unicorn' ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
              }}
            />
          </div>
        </label>
        <label className="text-label">
          Screen Text:
          <input
            type="text"
            value={screenText}
            onChange={(e) => {
              const value = e.target.value
              if (value.length <= 50) {
                setScreenText(value)
                // Metin yazıldığında görseli kaldır ve metni göster
                if (value.length > 0) {
                  setScreenContent(null)
                }
              }
            }}
            maxLength={50}
            className="text-input"
            placeholder="Enter text"
          />
        </label>
        <label className="color-label">
          Screen Background Color:
          <div className="screen-color-controls">
            <div className="mode-radio-group">
              <label className="mode-radio-label">
                <input
                  type="radio"
                  name="screenBgMode"
                  value="white"
                  checked={screenBgMode === 'white'}
                  onChange={(e) => setScreenBgMode(e.target.value)}
                  className="mode-radio"
                />
                White
              </label>
              <label className="mode-radio-label">
                <input
                  type="radio"
                  name="screenBgMode"
                  value="black"
                  checked={screenBgMode === 'black'}
                  onChange={(e) => setScreenBgMode(e.target.value)}
                  className="mode-radio"
                />
                Black
              </label>
              <label className="mode-radio-label">
                <input
                  type="radio"
                  name="screenBgMode"
                  value="color"
                  checked={screenBgMode === 'color'}
                  onChange={(e) => setScreenBgMode(e.target.value)}
                  className="mode-radio"
                />
                Color
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={screenBgHue}
              onChange={(e) => setScreenBgHue(parseInt(e.target.value))}
              className="rainbow-slider"
              disabled={screenBgMode !== 'color'}
            />
          </div>
        </label>
      </div>
      )}
    </div>
  )
}

export default RetroDevice

