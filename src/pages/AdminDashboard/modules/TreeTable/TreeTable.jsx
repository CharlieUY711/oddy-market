import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import styles from './TreeTable.module.css';

/**
 * Componente de Tabla en Árbol reutilizable
 * Soporta jerarquías: Departamento → Categoría → SubCategoría → Artículo
 */
export const TreeTable = ({ data, columns, onRowClick, onEdit, onDelete }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node, level = 0, parentPath = '') => {
    const nodeId = parentPath ? `${parentPath}.${node.id}` : node.id;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = node.children && node.children.length > 0;
    const isLeaf = !hasChildren;

    return (
      <React.Fragment key={nodeId}>
        <tr 
          className={`${styles.row} ${styles[`level${level}`]} ${isLeaf ? styles.leaf : styles.branch}`}
          onClick={() => isLeaf && onRowClick && onRowClick(node)}
        >
          {columns.map((column, colIndex) => (
            <td key={colIndex} className={styles.cell}>
              {colIndex === 0 && (
                <div 
                  className={styles.cellContent}
                  style={{ paddingLeft: `${level * 24}px` }}
                >
                  {hasChildren && (
                    <button
                      className={styles.expandButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode(nodeId);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                  )}
                  {!hasChildren && <span className={styles.leafIcon}>└</span>}
                  <span className={styles.nodeIcon}>{node.icon || (hasChildren ? '📁' : '📄')}</span>
                  <span className={styles.nodeLabel}>
                    {column.render ? column.render(node) : node[column.field]}
                  </span>
                </div>
              )}
              {colIndex > 0 && (
                <div className={styles.cellContent}>
                  {column.render ? column.render(node) : node[column.field]}
                </div>
              )}
            </td>
          ))}
          {(onEdit || onDelete) && (
            <td className={styles.actionsCell}>
              <div className={styles.actions}>
                {onEdit && isLeaf && (
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(node);
                    }}
                  >
                    ✏️
                  </button>
                )}
                {onDelete && (
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(node);
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </td>
          )}
        </tr>
        {hasChildren && isExpanded && node.children.map(child => 
          renderNode(child, level + 1, nodeId)
        )}
      </React.Fragment>
    );
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className={styles.header}>
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className={styles.header}>Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map(node => renderNode(node))}
        </tbody>
      </table>
    </div>
  );
};
