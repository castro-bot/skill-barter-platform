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
  // Nota: A veces se filtra en el frontend o hay un endpoint específico. 
  // Por ahora usaremos el general y filtraremos en el componente si es necesario,
  // o si tu backend tiene endpoint de "/my-services", lo usamos.
};