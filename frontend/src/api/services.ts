// frontend/src/api/services.ts
import client from './client';

// Definimos la forma de los datos según tu PDF (Página 6)
export interface ServiceListing {
  id: string;
  title: string;
  description: string;
  category: string;
  owner: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface CreateServiceDTO {
  title: string;
  description: string;
  category: string;
}

export const servicesApi = {
  // 1. Obtener todos los servicios (Marketplace)
  getAll: async (query?: string, category?: string) => {
    // Si hay filtros, los añadimos a la URL
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);

    const { data } = await client.get<ServiceListing[]>(`/services?${params.toString()}`);
    return data;
  },

  // 2. Obtener un servicio por ID (Detalle)
  getById: async (id: string) => {
    const { data } = await client.get<ServiceListing>(`/services/${id}`);
    return data;
  },

  // 3. Crear un servicio nuevo (Lo que necesitamos arreglar ahora)
  create: async (serviceData: CreateServiceDTO) => {
    const { data } = await client.post<ServiceListing>('/services', serviceData);
    return data;
  },

  // 4. Mis servicios (Para el Dashboard)
  getMyServices: async () => {
    // Asumimos que el backend tiene este endpoint. 
    // Si falla con 404, avísame y probamos con '/services?owner=me'
    const { data } = await client.get<ServiceListing[]>('/services/my-services');
    return data;
  }
};