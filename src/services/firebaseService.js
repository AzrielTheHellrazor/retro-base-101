import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COLLECTION_NAME = 'users'

/**
 * Kullanıcı verilerini kaydet veya güncelle
 * @param {string} walletAddress - Kullanıcının wallet adresi
 * @param {object} data - Kaydedilecek veriler (nftImage, nftContract, nftTokenId, ledHue, totalPaid)
 * @returns {Promise<boolean>}
 */
export const saveUserData = async (walletAddress, data) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }

    const userRef = doc(db, COLLECTION_NAME, walletAddress.toLowerCase())

    const userData = {
      walletAddress: walletAddress.toLowerCase(),
      ...data,
      updatedAt: serverTimestamp(),
      createdAt: data.createdAt || serverTimestamp()
    }

    await setDoc(userRef, userData, { merge: true })
    return true
  } catch (error) {
    console.error('Error saving user data:', error)
    throw error
  }
}

/**
 * Kullanıcı verilerini getir
 * @param {string} walletAddress - Kullanıcının wallet adresi
 * @returns {Promise<object|null>}
 */
export const getUserData = async (walletAddress) => {
  try {
    if (!walletAddress) {
      return null
    }

    const userRef = doc(db, COLLECTION_NAME, walletAddress.toLowerCase())
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data()
      }
    }
    return null
  } catch (error) {
    console.error('Error getting user data:', error)
    throw error
  }
}

/**
 * Tüm kullanıcıları ödeme miktarına göre sıralı olarak getir
 * @param {number} limitCount - Maksimum kaç kullanıcı getirilecek (default: 100)
 * @returns {Promise<Array>}
 */
export const getLeaderboard = async (limitCount = 100) => {
  try {
    const usersRef = collection(db, COLLECTION_NAME)
    const q = query(
      usersRef,
      orderBy('totalPaid', 'desc'),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    )

    const querySnapshot = await getDocs(q)
    const users = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        id: doc.id,
        walletAddress: data.walletAddress,
        nftImage: data.nftImage || null,
        ledHue: data.ledHue || 30,
        totalPaid: parseFloat(data.totalPaid || 0),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
        createdAt: data.createdAt?.toMillis() || Date.now()
      })
    })

    return users
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    // Eğer totalPaid field'ı yoksa, boş array döndür
    if (error.code === 'failed-precondition') {
      console.warn('Leaderboard query requires index. Please create the index in Firebase Console.')
      return []
    }
    throw error
  }
}

/**
 * Kullanıcının ödeme miktarını artır
 * @param {string} walletAddress - Kullanıcının wallet adresi
 * @param {number} amount - Eklenecek ödeme miktarı (USDC cinsinden)
 * @param {string} transactionHash - Transaction hash (opsiyonel)
 * @returns {Promise<boolean>}
 */
export const addPayment = async (walletAddress, amount, transactionHash = null) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }

    const normalizedAddress = walletAddress.toLowerCase()
    const userRef = doc(db, COLLECTION_NAME, normalizedAddress)
    const amountNumber = parseFloat(amount)

    if (isNaN(amountNumber) || amountNumber <= 0) {
      throw new Error('Invalid payment amount')
    }

    // Kullanıcı verisi varsa güncelle, yoksa oluştur
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const currentData = userSnap.data()
      const currentTotal = parseFloat(currentData.totalPaid || 0)
      const newTotal = currentTotal + amountNumber

      const updateData = {
        walletAddress: normalizedAddress, // Rules için gerekli
        totalPaid: newTotal,
        lastPaymentAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      if (transactionHash) {
        updateData.lastTransactionHash = transactionHash
      }

      await updateDoc(userRef, updateData)
    } else {
      // Yeni kullanıcı oluştur
      const newUserData = {
        walletAddress: normalizedAddress,
        totalPaid: amountNumber,
        lastPaymentAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      if (transactionHash) {
        newUserData.lastTransactionHash = transactionHash
      }

      await setDoc(userRef, newUserData)
    }

    // Veriyi tekrar okuyarak doğrula
    const verifySnap = await getDoc(userRef)
    if (!verifySnap.exists()) {
      throw new Error('Payment save verification failed')
    }

    return true
  } catch (error) {
    console.error('Error adding payment:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      walletAddress: walletAddress?.toLowerCase(),
      amount: amount
    })
    
    // Daha anlaşılır hata mesajı
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore rules.')
    } else if (error.code === 'unavailable') {
      throw new Error('Firestore unavailable. Please check your connection.')
    }
    
    throw error
  }
}

/**
 * Kullanıcının NFT görselini güncelle
 * @param {string} walletAddress - Kullanıcının wallet adresi
 * @param {string} nftImage - NFT görsel URL'i
 * @returns {Promise<boolean>}
 */
export const updateNFTImage = async (walletAddress, nftImage) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }

    const userRef = doc(db, COLLECTION_NAME, walletAddress.toLowerCase())
    await updateDoc(userRef, {
      nftImage: nftImage || null,
      updatedAt: serverTimestamp()
    })

    return true
  } catch (error) {
    console.error('Error updating NFT image:', error)
    throw error
  }
}

/**
 * Kullanıcının LED rengini güncelle
 * @param {string} walletAddress - Kullanıcının wallet adresi
 * @param {number} ledHue - LED hue değeri (0-360)
 * @returns {Promise<boolean>}
 */
export const updateLEDHue = async (walletAddress, ledHue) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }

    const userRef = doc(db, COLLECTION_NAME, walletAddress.toLowerCase())
    await updateDoc(userRef, {
      ledHue: ledHue || 30,
      updatedAt: serverTimestamp()
    })

    return true
  } catch (error) {
    console.error('Error updating LED hue:', error)
    throw error
  }
}

/**
 * Kullanıcının hem NFT hem LED rengini güncelle
 * @param {string} walletAddress - Kullanıcının wallet adresi
 * @param {object} data - { nftImage, ledHue }
 * @returns {Promise<boolean>}
 */
export const updateUserDisplay = async (walletAddress, data) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required')
    }

    const userRef = doc(db, COLLECTION_NAME, walletAddress.toLowerCase())
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    })

    return true
  } catch (error) {
    console.error('Error updating user display:', error)
    throw error
  }
}

/**
 * Yeni mood pack oluştur
 * @param {string} creatorWallet - Creator'ın wallet adresi
 * @param {object} packData - { name, description, price, images }
 * @returns {Promise<string>} - Oluşturulan pack'in ID'si
 */
export const createMoodPack = async (creatorWallet, packData) => {
  try {
    if (!creatorWallet) {
      throw new Error('Creator wallet address is required')
    }

    const packsRef = collection(db, 'moodPacks')
    const newPackRef = doc(packsRef)

    const packDocument = {
      id: newPackRef.id,
      creatorWallet: creatorWallet.toLowerCase(),
      name: packData.name,
      description: packData.description,
      price: parseFloat(packData.price),
      images: packData.images || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    }

    await setDoc(newPackRef, packDocument)
    return newPackRef.id
  } catch (error) {
    console.error('Error creating mood pack:', error)
    throw error
  }
}

/**
 * Creator'ın oluşturduğu tüm packleri getir
 * @param {string} creatorWallet - Creator'ın wallet adresi
 * @returns {Promise<Array>}
 */
export const getCreatorPacks = async (creatorWallet) => {
  try {
    if (!creatorWallet) {
      return []
    }

    const packsRef = collection(db, 'moodPacks')
    const q = query(
      packsRef,
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const packs = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Sadece bu creator'a ait packleri filtrele
      if (data.creatorWallet === creatorWallet.toLowerCase()) {
        packs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now()
        })
      }
    })

    return packs
  } catch (error) {
    console.error('Error getting creator packs:', error)
    return []
  }
}

/**
 * Tüm aktif mood packleri getir (Marketplace için)
 * @param {number} limitCount - Maksimum kaç pack getirilecek
 * @returns {Promise<Array>}
 */
export const getAllMoodPacks = async (limitCount = 100) => {
  try {
    const packsRef = collection(db, 'moodPacks')
    const q = query(
      packsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const querySnapshot = await getDocs(q)
    const packs = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.isActive) {
        packs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now()
        })
      }
    })

    return packs
  } catch (error) {
    console.error('Error getting mood packs:', error)
    return []
  }
}

