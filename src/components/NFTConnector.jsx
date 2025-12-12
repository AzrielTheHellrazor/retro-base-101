import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { sdk } from '@farcaster/miniapp-sdk'
import './NFTConnector.css'

// Base Mainnet Chain ID
const BASE_CHAIN_ID = '0x2105' // 8453 in hex
const BASE_RPC_URL = 'https://mainnet.base.org'

// ERC721 ABI (sadece balanceOf ve tokenURI için)
const ERC721_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
]

function NFTConnector({ onNFTSelect, onWalletConnect, walletAddress: externalWalletAddress }) {
  const [walletAddress, setWalletAddress] = useState(externalWalletAddress || null)

  // External wallet address değiştiğinde güncelle
  useEffect(() => {
    if (externalWalletAddress) {
      setWalletAddress(externalWalletAddress)
    }
  }, [externalWalletAddress])
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const fileInputRef = React.useRef(null)

  // Wallet bağlantısı - Base wallet için
  const connectWallet = async () => {
    try {
      // Base Mini App SDK ile wallet bağlantısı
      let address = null
      let provider = null

      // Base App içinde çalışıyorsa SDK'yı kullan
      try {
        const context = await sdk.context
        if (context && context.user) {
          // Base App içinde, kullanıcı zaten bağlı
          // Base Account address'ini al
          if (context.user.custodyAddress) {
            address = context.user.custodyAddress
          }
        }
      } catch (sdkError) {
        console.log('SDK context not available, trying direct wallet connection')
      }

      // Eğer SDK'dan address alamadıysak, direkt wallet bağlantısı dene
      if (!address) {
        // Base wallet kontrolü
        if (window.base && window.base.ethereum) {
          provider = window.base.ethereum
        } else if (window.ethereum) {
          provider = window.ethereum
          // Base network'te değilse otomatik olarak Base ağına geçiş yapmayı dene
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          if (chainId !== BASE_CHAIN_ID) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: BASE_CHAIN_ID }],
              })
            } catch (switchError) {
              // Eğer ağ ekli değilse, eklemeyi dene
              if (switchError.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: BASE_CHAIN_ID,
                        rpcUrls: [BASE_RPC_URL],
                        chainName: 'Base Mainnet',
                        nativeCurrency: {
                          name: 'Ether',
                          symbol: 'ETH',
                          decimals: 18,
                        },
                        blockExplorerUrls: ['https://basescan.org'],
                      },
                    ],
                  })
                } catch (addError) {
                  setError('Base network could not be added to your wallet.')
                  return
                }
              } else {
                setError('Please approve switching to the Base network in your wallet.')
                return
              }
            }
          }
        } else {
          setError('Base wallet not found. Please use Base App or install Base wallet.')
          return
        }

        // Wallet bağlantısı
        const ethersProvider = new ethers.BrowserProvider(provider)
        const signer = await ethersProvider.getSigner()
        address = await signer.getAddress()
      }
      
      setWalletAddress(address)
      if (onWalletConnect) {
        onWalletConnect(address)
      }
      setError(null)
    } catch (err) {
      console.error('Wallet connection error:', err)
      if (err.code === 4001) {
        setError('Connection rejected. Please approve the connection request.')
      } else {
        setError(err.message || 'Failed to connect Base wallet')
      }
    }
  }

  // NFT'leri çek
  const fetchNFTs = async () => {
    if (!walletAddress) return

    setLoading(true)
    setError(null)

    try {
      // Base wallet provider'ı al
      let provider = null
      if (window.base && window.base.ethereum) {
        provider = window.base.ethereum
      } else if (window.ethereum) {
        provider = window.ethereum
      } else {
        setError('Base wallet not found')
        return
      }

      const ethersProvider = new ethers.BrowserProvider(provider)
      const nftList = []

      // Base'deki popüler NFT kontratları (örnek)
      // Gerçek uygulamada kullanıcının tüm NFT'lerini çekmek için bir indexer API kullanılmalı
      const contracts = [
        // Base'deki örnek kontratlar - gerçek uygulamada bir NFT indexer API kullanılmalı
      ]

      // Basit bir yaklaşım: Kullanıcının wallet'ındaki NFT'leri bulmak için
      // Base NFT API veya indexer kullanılmalı. Şimdilik placeholder
      
      // Base NFT API kullan - Alchemy veya alternatif
      const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY
      let response = null

      console.log('Alchemy API Key length:', alchemyKey ? alchemyKey.length : 0)
      console.log('Wallet address:', walletAddress)

      if (alchemyKey) {
        try {
          // Alchemy API v3 - Base Mainnet için
          // Base collectibles dahil tüm NFT'leri çek
          const apiUrl = `https://base-mainnet.g.alchemy.com/nft/v3/${alchemyKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true&pageSize=100`
          console.log('Fetching NFTs from Alchemy:', apiUrl.replace(alchemyKey, '***'))

          response = await fetch(apiUrl, {
            headers: {
              'Accept': 'application/json'
            }
          })

          console.log('Alchemy response status:', response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Alchemy API error:', response.status, errorText)
            // Hata olsa bile response'u null yapma, belki parse edebiliriz
            if (response.status === 429) {
              setError('Rate limit exceeded. Please try again later.')
            } else if (response.status === 401) {
              setError('Invalid Alchemy API key. Please check your .env file.')
            } else {
              setError(`API error: ${response.status}. Check console for details.`)
            }
          }
        } catch (fetchError) {
          console.error('Fetch error:', fetchError)
          setError(`Failed to fetch NFTs: ${fetchError.message}`)
          response = null
        }
      } else {
        console.warn('No Alchemy API key found')
        // API yoksa
        response = null
      }

      if (response && response.ok) {
        const data = await response.json()
        console.log('Alchemy API response:', JSON.stringify(data, null, 2))

        // Alchemy v3 response format: { ownedNfts: [...] }
        if (data.ownedNfts && Array.isArray(data.ownedNfts) && data.ownedNfts.length > 0) {
          console.log('Total NFTs found:', data.ownedNfts.length)

          // NFT'leri formatla
          const formattedNfts = data.ownedNfts.map((nft, idx) => {
            console.log(`NFT ${idx}:`, JSON.stringify(nft, null, 2))

            // Metadata'dan görsel URL'ini al
            let imageUrl = null
            if (nft.image?.cachedUrl) {
              imageUrl = nft.image.cachedUrl
            } else if (nft.image?.thumbnailUrl) {
              imageUrl = nft.image.thumbnailUrl
            } else if (nft.image?.pngUrl) {
              imageUrl = nft.image.pngUrl
            } else if (nft.media && nft.media.length > 0) {
              imageUrl = nft.media[0].gateway || nft.media[0].raw
            } else if (nft.metadata && nft.metadata.image) {
              imageUrl = nft.metadata.image
            } else if (nft.contract?.openSeaMetadata?.imageUrl) {
              // OpenSea collection image'ı kullan
              imageUrl = nft.contract.openSeaMetadata.imageUrl
            }

            // Başlık oluştur
            let title = nft.name || nft.title || nft.metadata?.name || nft.contract?.name
            if (nft.tokenId) {
              title = `${title || 'NFT'} #${nft.tokenId}`
            } else {
              title = title || 'NFT'
            }

            console.log(`NFT ${idx} image:`, imageUrl, 'title:', title)

            return {
              ...nft,
              image: imageUrl,
              title: title,
              tokenId: nft.tokenId,
              contract: nft.contract?.address
            }
          })

          console.log('Formatted NFTs:', formattedNfts)
          setNfts(formattedNfts)
          setError(null)
        } else {
          // NFT bulunamadı
          console.log('No NFTs found in response')
          setNfts([])
          setError('No NFTs found in your wallet. You can still use custom images by entering an image URL.')
        }
      } else {
        // API yoksa veya hata varsa
        console.log('No API response or error')
        setNfts([])
        if (!alchemyKey) {
          setError('NFT API not configured. You can still upload custom images.')
        } else {
          setError('Failed to fetch NFTs. You can still use custom images by entering an image URL.')
        }
      }
    } catch (err) {
      console.error('NFT fetch error:', err)
      setError('Failed to fetch NFTs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (walletAddress) {
      fetchNFTs()
    }
  }, [walletAddress])

  const handleNFTSelect = (nft) => {
    if (onNFTSelect) {
      // NFT görselini al - farklı formatları dene
      const imageUrl = nft.image?.cachedUrl ||
                      nft.image?.thumbnailUrl ||
                      nft.image?.pngUrl ||
                      nft.image ||
                      nft.media?.[0]?.gateway ||
                      nft.media?.[0]?.raw ||
                      nft.metadata?.image ||
                      nft.contract?.openSeaMetadata?.imageUrl ||
                      ''

      // NFT metadata - contract ve tokenId
      const nftData = {
        imageUrl: imageUrl,
        contract: nft.contract?.address || null,
        tokenId: nft.tokenId || null
      }

      console.log('Selected NFT:', nft)
      console.log('Selected NFT Data:', nftData)
      onNFTSelect(nftData)
    }
    setShowModal(false)
  }

  // Telefon galerisinden fotoğraf seç
  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageDataUrl = reader.result
        console.log('Photo selected from gallery')
        // Gallery photo için NFT data formatı
        handleNFTSelect({
          image: imageDataUrl,
          title: 'Gallery Photo',
          contract: { address: null },
          tokenId: null
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="nft-connector">
      <button
        onClick={() => {
          if (!walletAddress) {
            connectWallet()
          } else {
            setShowModal(true)
          }
        }}
        className="connect-button"
      >
        {walletAddress ? 'Select NFT' : 'Connect NFT'}
      </button>


      {error && <div className="error-message">{error}</div>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select NFT</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />

            {/* Upload photo button - always visible */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                margin: '0 20px 16px 20px',
                padding: '12px 24px',
                width: 'calc(100% - 40px)',
                backgroundColor: '#007aff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0051d5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007aff'}
            >
              📷 Upload Photo from Gallery
            </button>

            <div className="nft-grid">
              {loading ? (
                <div className="loading">Loading NFTs...</div>
              ) : nfts.length > 0 ? (
                nfts.map((nft, index) => {
                  const displayImage = nft.image?.cachedUrl ||
                                     nft.image?.thumbnailUrl ||
                                     nft.image?.pngUrl ||
                                     nft.image ||
                                     nft.media?.[0]?.gateway ||
                                     nft.media?.[0]?.raw ||
                                     nft.metadata?.image ||
                                     nft.contract?.openSeaMetadata?.imageUrl ||
                                     'https://via.placeholder.com/300?text=NFT'

                  return (
                    <div
                      key={index}
                      className="nft-item"
                      onClick={() => handleNFTSelect(nft)}
                    >
                      <img
                        src={displayImage}
                        alt={nft.title || 'NFT'}
                        onError={(e) => {
                          console.log('Image load error for:', displayImage)
                          e.target.src = 'https://via.placeholder.com/300?text=NFT'
                        }}
                      />
                      <div className="nft-title">
                        {nft.title || 'NFT'}
                      </div>
                    </div>
                  )
                })
              ) : nfts.length === 0 ? (
                <div className="no-nfts">
                  <p>No NFTs found in your wallet.</p>
                  <p style={{ fontSize: '12px', marginTop: '8px', color: 'rgba(0,0,0,0.5)' }}>
                    Use the button above to upload a photo from your gallery.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NFTConnector

