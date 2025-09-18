import { useState } from 'react';
import { useData } from '../hooks/useData';

const DebugTestPanel = () => {
  const { grants, loading, error, isTestMode, toggleTableMode, refreshData } =
    useData();

  const [isExpanded, setIsExpanded] = useState(true);

  const currentTable = isTestMode
    ? import.meta.env.VITE_SUPABASE_TABLE_GRANTS_TEST
    : import.meta.env.VITE_SUPABASE_TABLE_GRANTS_PRODUCTION;

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'white',
        border: '2px solid #007acc',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: isExpanded ? '500px' : '320px',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header con controles */}
      <div
        style={{
          background: 'linear-gradient(135deg, #007acc, #0056b3)',
          color: 'white',
          padding: '12px 15px',
          borderRadius: '6px 6px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
          🛠️ Debug + Test Panel
          <span style={{ fontSize: '11px', opacity: 0.8, marginLeft: '8px' }}>
            ({currentTable})
          </span>
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleTableMode}
            disabled={loading}
            style={{
              background: isTestMode
                ? 'rgba(255,165,0,0.3)'
                : 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {isTestMode ? '🧪 Test' : '📊 Normal'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {isExpanded ? '📉 Contraer' : '📈 Expandir'}
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ padding: '15px' }}>
        {/* Controles de tabla */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={toggleTableMode}
            disabled={loading}
            style={{
              background: isTestMode ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {isTestMode ? '🧪 Modo Test' : '📊 Modo Normal'}
          </button>

          <button
            onClick={refreshData}
            disabled={loading}
            style={{
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '🔄' : '🔄 Refrescar'}
          </button>
        </div>

        {/* Estado de conexión */}
        <div
          style={{
            background: error ? '#f8d7da' : loading ? '#fff3cd' : '#d4edda',
            border: `1px solid ${error ? '#f5c6cb' : loading ? '#ffeaa7' : '#c3e6cb'}`,
            color: error ? '#721c24' : loading ? '#856404' : '#155724',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '12px',
          }}
        >
          <strong>Estado:</strong>{' '}
          {loading
            ? '🔄 Cargando...'
            : error
              ? `❌ ${error}`
              : `✅ ${grants.length} registros cargados`}
        </div>

        {/* Información de tabla actual */}
        <div
          style={{
            background: '#e9ecef',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            marginBottom: '12px',
            color: '#495057',
          }}
        >
          <strong>Tabla actual:</strong> {currentTable}
        </div>

        {/* Datos expandidos */}
        {isExpanded && grants && (
          <div style={{ fontSize: '11px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <strong>Datos ({grants.length} registros):</strong>
              <span style={{ color: '#6c757d' }}>JSON</span>
            </div>
            <pre
              style={{
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '300px',
                fontSize: '10px',
                border: '1px solid #dee2e6',
                margin: 0,
              }}
            >
              {JSON.stringify(grants, null, 2)}
            </pre>
          </div>
        )}

        {/* Resumen compacto cuando no está expandido */}
        {!isExpanded && grants && (
          <div
            style={{
              fontSize: '11px',
              color: '#6c757d',
              textAlign: 'center',
              padding: '8px',
              background: '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            📊 {grants.length} registros disponibles
            <br />
            <span style={{ fontSize: '10px' }}>Expandir para ver detalles</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugTestPanel;
