import { useState } from 'react'
import './ChangePassword.css'

function ChangePassword({ userId, onPasswordChanged }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('新密码与确认密码不匹配')
      return
    }

    if (newPassword.length < 1) {
      setError('新密码不能为空')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '密码修改失败')
      }

      onPasswordChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="change-password-overlay">
      <div className="change-password-modal">
        <div className="modal-header">
          <h2>首次登录：修改密码</h2>
          <p>为了您的安全，请立即修改密码</p>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="current-password">当前密码</label>
            <input
              id="current-password"
              type="text"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="输入当前密码"
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-password">新密码</label>
            <input
              id="new-password"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="输入新密码"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">确认新密码</label>
            <input
              id="confirm-password"
              type="text"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="再次输入新密码"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? '修改中...' : '修改密码'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
