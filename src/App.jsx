import React, { useState, useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import RetroDevice from './components/RetroDevice'
import Leaderboard from './components/Leaderboard'
import NFTConnector from './components/NFTConnector'
import PaymentButton from './components/PaymentButton'
import { 
  saveUserData, 
  getUserData, 
  updateUserDisplay 
} from './services/firebaseService'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home') // 'home' veya 'leaderboard'
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [walletAddress, setWalletAddress] = useState(null)
  const [ledHue, setLedHue] = useState(30)
  const [refreshKey, setRefreshKey] = useState(0)
  const [userProfile, setUserProfile] = useState(null) // { username, avatar, custodyAddress }

  // Base Mini App SDK - ready() çağrısı ve kullanıcı bilgilerini al
  useEffect(() => {
    const initSDK = async () => {
      try {
        await sdk.actions.ready()
        
        // Kullanıcı bilgilerini al
        try {
          const context = await sdk.context
          console.log('SDK context:', context)
          if (context && context.user) {
            console.log('User data:', context.user)
            const avatarUrl = context.user.pfp?.url || 
                            context.user.avatar || 
                            context.user.profileImage || 
                            null
            console.log('Avatar URL:', avatarUrl)
            setUserProfile({
              username: context.user.username || 'User',
              avatar: avatarUrl,
              custodyAddress: context.user.custodyAddress
            })
            // Wallet address'i de set et
            if (context.user.custodyAddress) {
              setWalletAddress(context.user.custodyAddress)
            }
          }
        } catch (contextError) {
          console.log('SDK context not available:', contextError)
        }
      } catch (error) {
        console.error('Failed to initialize Mini App SDK:', error)
      }
    }
    initSDK()
  }, [])

  // Kullanıcı verilerini yükle
  useEffect(() => {
    const loadUserData = async () => {
      if (walletAddress) {
        try {
          const userData = await getUserData(walletAddress)
          if (userData) {
            // NFT verilerini yükle - hem URL hem de contract/tokenId
            if (userData.nftImage) {
              setSelectedNFT({
                imageUrl: userData.nftImage,
                contract: userData.nftContract || null,
                tokenId: userData.nftTokenId || null
              })
            }
            if (userData.ledHue !== undefined) setLedHue(userData.ledHue)
          }
        } catch (error) {
          console.error('Error loading user data:', error)
        }
      }
    }
    loadUserData()
  }, [walletAddress])

  // NFT veya LED rengi değiştiğinde kaydet
  const handleSaveUserData = async (nftData, hue) => {
    if (walletAddress) {
      try {
        const updateData = {
          ledHue: hue !== undefined ? hue : ledHue
        }

        // NFT data varsa kaydet (imageUrl, contract, tokenId)
        if (nftData) {
          updateData.nftImage = nftData.imageUrl || nftData
          updateData.nftContract = nftData.contract || null
          updateData.nftTokenId = nftData.tokenId || null
        } else if (selectedNFT) {
          // Eğer nftData yoksa ama selectedNFT varsa onu kullan
          updateData.nftImage = selectedNFT.imageUrl || selectedNFT
          updateData.nftContract = selectedNFT.contract || null
          updateData.nftTokenId = selectedNFT.tokenId || null
        }

        await updateUserDisplay(walletAddress, updateData)
      } catch (error) {
        console.error('Error saving user data:', error)
      }
    }
  }

  const handlePaymentSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="App">
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '40px',
        padding: '20px'
      }}>
        <button
          onClick={() => setCurrentPage('home')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '500',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: currentPage === 'home' ? '#007aff' : 'rgba(0, 0, 0, 0.05)',
            color: currentPage === 'home' ? '#ffffff' : 'rgba(0, 0, 0, 0.8)',
            transition: 'all 0.2s'
          }}
        >
          My Digital NFT Displayer
        </button>
        <button
          onClick={() => setCurrentPage('leaderboard')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '500',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: currentPage === 'leaderboard' ? '#007aff' : 'rgba(0, 0, 0, 0.05)',
            color: currentPage === 'leaderboard' ? '#ffffff' : 'rgba(0, 0, 0, 0.8)',
            transition: 'all 0.2s'
          }}
        >
          Retro NFT Leaderboard
        </button>
      </nav>

      {/* Page Content */}
      {currentPage === 'home' ? (
        <div>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '40px',
            fontSize: '32px',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.8)',
            letterSpacing: '-0.5px'
          }}>
            My Digital NFT Displayer
          </h1>
          <RetroDevice
            nftImage={selectedNFT?.imageUrl || selectedNFT}
            ledHue={ledHue}
            onLedHueChange={(hue) => {
              setLedHue(hue)
              handleSaveUserData(selectedNFT, hue)
            }}
            userProfile={userProfile}
            nftConnector={
              <NFTConnector
                onNFTSelect={(nftData) => {
                  setSelectedNFT(nftData)
                  handleSaveUserData(nftData, ledHue)
                }}
                onWalletConnect={setWalletAddress}
                walletAddress={walletAddress}
              />
            }
            paymentButton={
              walletAddress ? (
                <PaymentButton 
                  walletAddress={walletAddress}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              ) : null
            }
          />
        </div>
      ) : (
        <Leaderboard key={refreshKey} />
      )}
    </div>
  )
}

export default App

