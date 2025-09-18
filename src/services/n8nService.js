import { appConfig } from '../config/index.js';
import { ErrorHandler, ERROR_TYPES } from '../utils/ErrorHandler.js';

/**
 * Servicio para interactuar con n8n
 * Maneja la ejecución de workflows y comunicación con la API
 */
class N8nService {
  constructor() {
    this.config = null;
  }

  /**
   * Inicializa el servicio con la configuración actual
   */
  initialize() {
    if (!appConfig.initialized) {
      throw new Error(
        'AppConfig debe ser inicializado antes de usar N8nService'
      );
    }
    this.config = appConfig.n8nConfig;
  }

  /**
   * Ejecuta un workflow mediante webhook
   */
  async triggerWorkflow(searchParams) {
    if (!this.config) {
      this.initialize();
    }

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerms: searchParams.terms || [],
          dateRange: searchParams.dateRange || {},
          categories: searchParams.categories || [],
          minAmount: searchParams.minAmount || 0,
          maxAmount: searchParams.maxAmount || 1000000,
          sources: searchParams.sources || ['BOE', 'EUROPA', 'CDTI'],
          geographic_scope: searchParams.geographic_scope || 'NACIONAL',
          environment: appConfig.environment,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      ErrorHandler.logInfo('Workflow ejecutado exitosamente:', result);
      return ErrorHandler.createSuccessResponse(result);
    } catch (error) {
      ErrorHandler.logError('Error ejecutando workflow:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error ejecutando workflow',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Obtiene la lista de workflows disponibles
   */
  async getWorkflows() {
    if (!this.config.apiKey) {
      throw new Error('API Key de n8n no configurada');
    }

    try {
      const response = await fetch(`${this.config.baseUrl}api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.config.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const workflows = await response.json();
      ErrorHandler.logInfo('Workflows obtenidos:', workflows.data?.length || 0);
      return ErrorHandler.createSuccessResponse(workflows.data || []);
    } catch (error) {
      ErrorHandler.logError('Error obteniendo workflows:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error obteniendo workflows',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Obtiene el estado de un workflow específico
   */
  async getWorkflowStatus(workflowId) {
    if (!this.config.apiKey) {
      throw new Error('API Key de n8n no configurada');
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}api/v1/workflows/${workflowId}`,
        {
          headers: {
            'X-N8N-API-KEY': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const workflow = await response.json();
      return ErrorHandler.createSuccessResponse(workflow);
    } catch (error) {
      ErrorHandler.logError('Error obteniendo estado del workflow:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error obteniendo estado del workflow',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Obtiene las ejecuciones de un workflow
   */
  async getWorkflowExecutions(workflowId, limit = 10) {
    if (!this.config.apiKey) {
      throw new Error('API Key de n8n no configurada');
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}api/v1/executions?workflowId=${workflowId}&limit=${limit}`,
        {
          headers: {
            'X-N8N-API-KEY': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const executions = await response.json();
      return ErrorHandler.createSuccessResponse(executions.data || []);
    } catch (error) {
      ErrorHandler.logError('Error obteniendo ejecuciones:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error obteniendo ejecuciones',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Activa o desactiva un workflow
   */
  async toggleWorkflow(workflowId, active) {
    if (!this.config.apiKey) {
      throw new Error('API Key de n8n no configurada');
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}api/v1/workflows/${workflowId}/activate`,
        {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': this.config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ active }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      ErrorHandler.logInfo(
        `Workflow ${active ? 'activado' : 'desactivado'}:`,
        result
      );
      return ErrorHandler.createSuccessResponse(result);
    } catch (error) {
      ErrorHandler.logError('Error cambiando estado del workflow:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error cambiando estado del workflow',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Ejecuta un workflow específico por ID
   */
  async executeWorkflow(workflowId, inputData = {}) {
    if (!this.config.apiKey) {
      throw new Error('API Key de n8n no configurada');
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}api/v1/workflows/${workflowId}/execute`,
        {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': this.config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...inputData,
            environment: appConfig.environment,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      ErrorHandler.logInfo('Workflow ejecutado por ID:', result);
      return ErrorHandler.createSuccessResponse(result);
    } catch (error) {
      ErrorHandler.logError('Error ejecutando workflow por ID:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error ejecutando workflow por ID',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Crea un nuevo proyecto de investigación y lo ejecuta
   */
  async createAndExecuteResearch(researchConfig) {
    try {
      // Preparar datos para el workflow
      const workflowData = {
        name: researchConfig.name,
        description: researchConfig.description,
        searchTerms: researchConfig.searchTerms || [],
        targetSectors: researchConfig.targetSectors || [],
        geographicScope: researchConfig.geographicScope || 'NACIONAL',
        amountRange: researchConfig.amountRange || { min: 0, max: 1000000 },
        deadlineRange: researchConfig.deadlineRange || {},
        sources: researchConfig.sources || ['BOE', 'EUROPA', 'CDTI'],
        environment: appConfig.environment,
      };

      // Ejecutar workflow
      const result = await this.triggerWorkflow(workflowData);

      if (result.success) {
        return ErrorHandler.createSuccessResponse({
          executionId: result.data.executionId,
          message: 'Investigación iniciada exitosamente',
          data: result.data,
        });
      } else {
        return result; // Ya viene formateado por triggerWorkflow
      }
    } catch (error) {
      ErrorHandler.logError('Error creando y ejecutando investigación:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error al iniciar la investigación',
        ERROR_TYPES.BUSINESS_LOGIC,
        error
      );
    }
  }

  /**
   * Prueba la conectividad con n8n
   */
  async testConnection() {
    try {
      ErrorHandler.logInfo('Probando conexión con n8n...');

      // Intentar obtener workflows si hay API key
      if (this.config.apiKey) {
        const result = await this.getWorkflows();
        if (result.success) {
          ErrorHandler.logInfo('✅ Conexión con n8n API exitosa');
          return ErrorHandler.createSuccessResponse({
            connected: true,
            method: 'API',
          });
        } else {
          return result; // Ya viene formateado
        }
      } else {
        // Solo probar webhook si no hay API key
        await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            test: true,
            timestamp: new Date().toISOString(),
          }),
        });

        ErrorHandler.logInfo('✅ Webhook de n8n accesible');
        return ErrorHandler.createSuccessResponse({
          connected: true,
          method: 'Webhook',
        });
      }
    } catch (error) {
      ErrorHandler.logError('❌ Error probando n8n:', error);
      return ErrorHandler.createErrorResponse(
        error.message || 'Error probando conexión con n8n',
        ERROR_TYPES.NETWORK,
        error
      );
    }
  }

  /**
   * Obtiene información de configuración actual
   */
  getConfigInfo() {
    return {
      baseUrl: this.config?.baseUrl,
      webhookUrl: this.config?.webhookUrl,
      hasApiKey: !!this.config?.apiKey,
      environment: appConfig.environment,
    };
  }
}

// Instancia global del servicio
export const n8nService = new N8nService();
