import { useState, useEffect } from 'react'
import './MemberInfo.css'

function MemberInfo({ member, token, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(member)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setFormData(member)
  }, [member])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/family/member/${member.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '更新失败')
      }

      setSuccess('信息更新成功')
      setIsEditing(false)
      onUpdate()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="member-info-container">
      <div className="member-info-header">
        <h2>{member.name}</h2>
        {!isEditing && (
          <button
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            编辑
          </button>
        )}
      </div>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="member-info-content">
        {isEditing ? (
          <form className="info-form">
            <div className="form-group">
              <label>姓名</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>出生日期</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>性别</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleInputChange}
              >
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div className="form-group">
              <label>手机号码</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>家庭住址</label>
              <input
                type="text"
                name="home_address"
                value={formData.home_address || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>新世界地址信息</label>
              <input
                type="text"
                name="new_world_address"
                value={formData.new_world_address || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="save-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false)
                  setFormData(member)
                }}
              >
                取消
              </button>
            </div>
          </form>
        ) : (
          <div className="info-view">
            <div className="info-item">
              <span className="label">姓名:</span>
              <span className="value">{member.name}</span>
            </div>
            <div className="info-item">
              <span className="label">出生日期:</span>
              <span className="value">{member.birth_date || '未设置'}</span>
            </div>
            <div className="info-item">
              <span className="label">性别:</span>
              <span className="value">{member.gender || '未设置'}</span>
            </div>
            <div className="info-item">
              <span className="label">手机号码:</span>
              <span className="value">{member.phone || '未设置'}</span>
            </div>
            <div className="info-item">
              <span className="label">家庭住址:</span>
              <span className="value">{member.home_address || '未设置'}</span>
            </div>
            <div className="info-item">
              <span className="label">新世界地址信息:</span>
              <span className="value">{member.new_world_address || '未设置'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MemberInfo
