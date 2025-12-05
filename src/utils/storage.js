// LocalStorage-based data storage
// In production, this should be replaced with a backend API

const STORAGE_KEY = 'retro-nft-leaderboard'

export const saveUserData = (walletAddress, data) => {
  try {
    const allData = getAllUserData()
    allData[walletAddress.toLowerCase()] = {
      ...data,
      walletAddress: walletAddress.toLowerCase(),
      updatedAt: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData))
    return true
  } catch (error) {
    console.error('Error saving user data:', error)
    return false
  }
}

export const getUserData = (walletAddress) => {
  try {
    const allData = getAllUserData()
    return allData[walletAddress.toLowerCase()] || null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

export const getAllUserData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Error getting all user data:', error)
    return {}
  }
}

export const getLeaderboard = () => {
  try {
    const allData = getAllUserData()
    const users = Object.values(allData)
    
    // Sort by totalPaid (descending), then by updatedAt (descending)
    return users.sort((a, b) => {
      const aPaid = parseFloat(a.totalPaid || 0)
      const bPaid = parseFloat(b.totalPaid || 0)
      if (bPaid !== aPaid) {
        return bPaid - aPaid
      }
      return (b.updatedAt || 0) - (a.updatedAt || 0)
    })
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return []
  }
}

export const addPayment = (walletAddress, amount) => {
  try {
    const userData = getUserData(walletAddress)
    if (!userData) {
      return false
    }
    
    const currentTotal = parseFloat(userData.totalPaid || 0)
    const newTotal = currentTotal + parseFloat(amount)
    
    return saveUserData(walletAddress, {
      ...userData,
      totalPaid: newTotal.toString(),
      lastPaymentAt: Date.now()
    })
  } catch (error) {
    console.error('Error adding payment:', error)
    return false
  }
}

