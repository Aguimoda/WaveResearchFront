// Librerías externas
import { createContext, useState, useEffect } from 'react';

// Configuración
import { appConfig } from '../config';

// Servicios
import { supabaseService } from '../services/supabaseService';
import { n8nService } from '../services/n8nService';

export const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [grants, setGrants] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false); // Nuevo estado para alternar entre tablas

  // Cargar datos iniciales
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Inicializar configuración primero
      if (!appConfig.initialized) {
        console.log('Inicializando configuración de la aplicación...');
        await appConfig.initialize();
      }

      // Inicializar servicio de Supabase después de la configuración
      console.log('Inicializando servicio de Supabase...');
      supabaseService.initialize();

      // Cargar grants
      await loadGrants(isTestMode);

      // Cargar workflows de n8n
      await loadWorkflows();
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  // Cargar grants desde Supabase
  const loadGrants = async (useTestTable = false) => {
    try {
      console.log(
        `Cargando grants desde tabla ${useTestTable ? 'test' : 'normal'}...`
      );
      const response = await supabaseService.getGrants({}, useTestTable);

      if (response.success) {
        console.log(
          'Grants cargados exitosamente:',
          response.data?.length || 0,
          'registros'
        );
        setGrants(response.data || []);
      } else {
        console.error('Error al cargar grants:', response.error);
        setError(response.error);
        setGrants([]);
      }
    } catch (error) {
      console.error('Error cargando grants:', error);
      setError('Error al cargar las subvenciones');
      setGrants([]);
    }
  };

  // Cargar workflows desde n8n
  const loadWorkflows = async () => {
    try {
      console.log('Cargando workflows desde n8n...');
      const response = await n8nService.getWorkflows();

      if (response.success) {
        console.log(
          'Workflows cargados exitosamente:',
          response.data?.length || 0,
          'workflows'
        );
        setWorkflows(response.data || []);
      } else {
        console.error('Error al cargar workflows:', response.error);
        // No establecer error aquí ya que n8n puede no estar disponible
        setWorkflows([]);
      }
    } catch (error) {
      console.error('Error cargando workflows:', error);
      // No establecer error aquí ya que n8n puede no estar disponible
      setWorkflows([]);
    }
  };

  // Crear nueva subvención
  const createGrant = async grantData => {
    try {
      setLoading(true);
      const response = await supabaseService.createGrant(grantData);

      if (response.success) {
        await loadGrants(isTestMode); // Recargar datos
        return { success: true, data: response.data };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error creando grant:', error);
      setError('Error al crear la subvención');
      return { success: false, error: 'Error al crear la subvención' };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar subvención
  const updateGrant = async (id, grantData) => {
    try {
      setLoading(true);
      const response = await supabaseService.updateGrant(id, grantData);

      if (response.success) {
        await loadGrants(isTestMode); // Recargar datos
        return { success: true, data: response.data };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error actualizando grant:', error);
      setError('Error al actualizar la subvención');
      return { success: false, error: 'Error al actualizar la subvención' };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar subvención
  const deleteGrant = async id => {
    try {
      setLoading(true);
      const response = await supabaseService.deleteGrant(id);

      if (response.success) {
        await loadGrants(isTestMode); // Recargar datos
        return { success: true };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error eliminando grant:', error);
      setError('Error al eliminar la subvención');
      return { success: false, error: 'Error al eliminar la subvención' };
    } finally {
      setLoading(false);
    }
  };

  // Refrescar todos los datos
  const refreshData = async () => {
    await loadInitialData();
  };

  // Función para alternar entre tabla normal y de prueba
  const toggleTableMode = async () => {
    const newTestMode = !isTestMode;
    console.log(`Cambiando a modo ${newTestMode ? 'test' : 'normal'}`);
    setIsTestMode(newTestMode);
    await loadGrants(newTestMode);
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadInitialData();
  }, []);

  // Recargar grants cuando cambie el modo de tabla
  useEffect(() => {
    if (grants.length > 0) {
      // Solo recargar si ya hay datos cargados
      loadGrants(isTestMode);
    }
  }, [isTestMode]);

  const value = {
    grants,
    workflows,
    loading,
    error,
    isTestMode,
    loadInitialData,
    loadGrants,
    loadWorkflows,
    createGrant,
    updateGrant,
    deleteGrant,
    refreshData,
    toggleTableMode, // Añadir la función al contexto
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataProvider;
