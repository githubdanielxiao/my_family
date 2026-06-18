import { useState, useEffect } from 'react'
import FamilyTree from '../components/FamilyTree'
import MemberInfo from '../components/MemberInfo'
import ChangePassword from '../components/ChangePassword'
import './Dashboard.css'

function Dashboard({ user, token, showChangePassword, onPasswordChanged, onLogout }) {
  const [selectedMember, setSelectedMember] = useState(null)
  const [treeData, setTreeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFamilyTree()
  }, [token])

  const fetchFamilyTree = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/family/tree', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('获取家族树失败')
      }

      const data = await response.json()
      setTreeData(data.tree)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      {showChangePassword && (
        <ChangePassword
          userId={user.id}
          onPasswordChanged={onPasswordChanged}
        />
      )}

      <header className="dashboard-header">
        <div className="header-left">
          <h1>🏠 家族关系管理</h1>
        </div>
        <div className="header-right">
          <span className="user-info">
            用户: {user.phone}
          </span>
          <button onClick={onLogout} className="logout-button">
            登出
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="sidebar">
          <h2>家族树</h2>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <FamilyTree
              data={treeData}
              selectedId={selectedMember?.id}
              onSelectMember={setSelectedMember}
            />
          )}
        </div>

        <div className="main-content">
          {selectedMember ? (
            <MemberInfo
              member={selectedMember}
              token={token}
              onUpdate={() => fetchFamilyTree()}
            />
          ) : (
            <div className="empty-state">
              <p>请从左侧选择一个家族成员以查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
