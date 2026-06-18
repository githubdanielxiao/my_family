import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '登录失败')
        return
      }

      onLogin(data.user, data.token)
    } catch (err) {
      setError('网络错误: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>家族关系管理系统</h1>
          <p>Family Tree Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="phone">手机号码</label>
            <input
              id="phone"
              type="tel"
              placeholder="输入您的手机号码"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="text"
              placeholder="输入密码（明文）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-footer">
          <p>首次登录将自动创建账户</p>
          <p className="security-note">⚠️ 为家族内部使用，仅用于演示</p>
        </div>
      </div>
    </div>
  )
}

export default Login
