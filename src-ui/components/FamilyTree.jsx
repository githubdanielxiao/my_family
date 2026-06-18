import './FamilyTree.css'

function FamilyTree({ data, selectedId, onSelectMember }) {
  const renderNode = (node) => {
    return (
      <div key={node.id} className="tree-node">
        <div
          className={`node-item ${selectedId === node.id ? 'selected' : ''}`}
          onClick={() => onSelectMember(node)}
        >
          <span className="node-name">{node.name}</span>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="node-children">
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="family-tree">
      {data && data.length > 0 ? (
        data.map(root => renderNode(root))
      ) : (
        <div className="no-data">暂无家族成员数据</div>
      )}
    </div>
  )
}

export default FamilyTree
