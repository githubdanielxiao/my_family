import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [showChangePassword, setShowChangePassword] = useState(false)

  useEffect(() => {
    // 从localStorage检查是否已登录
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsLoggedIn(true)
      setShowChangePassword(!userData.passwordChanged)
    }
  }, [])

  const handleLogin = (userData, authToken) => {
    setToken(authToken)
    setUser(userData)
    setIsLoggedIn(true)
    setShowChangePassword(!userData.passwordChanged)
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const handlePasswordChanged = () => {
    setShowChangePassword(false)
    const updatedUser = { ...user, passwordChanged: true }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Dashboard 
      user={user} 
      token={token}
      showChangePassword={showChangePassword}
      onPasswordChanged={handlePasswordChanged}
      onLogout={handleLogout}
    />
  )
}

export default App
