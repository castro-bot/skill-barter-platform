// frontend/src/api/services.ts
import client from "./client"

// Modelo según tu contrato/API
export interface ServiceListing {
  id: string
  title: string
  description: string
  category: string
  owner: {
    id: string
    name: string
    ratingAverage?: number
    ratingCount?: number
  }
  createdAt: string
}

export interface CreateServiceDTO {
  title: string
  description: string
  category: string
}

export interface UpdateServiceDTO {
  title?: string
  description?: string
  category?: string
}

export const servicesApi = {
  // 1) Marketplace (otros servicios)
  getAll: async (query?: string, category?: string) => {
    const params = new URLSearchParams()
    if (query) params.append("q", query)
    if (category) params.append("category", category)

    const qs = params.toString()
    const url = qs ? `/services?${qs}` : "/services"

    const { data } = await client.get<ServiceListing[]>(url)
    return data
  },

  // 2) Detalle
  getById: async (id: string) => {
    const { data } = await client.get<ServiceListing>(`/services/${id}`)
    return data
  },

  // 3) Crear
  create: async (serviceData: CreateServiceDTO) => {
    const { data } = await client.post<ServiceListing>("/services", serviceData)
    return data
  },

  // 4) Mis servicios (Sprint 4)
  getMine: async () => {
    const { data } = await client.get<ServiceListing[]>("/services/mine")
    return data
  },

  // 5) Editar (owner-only)
  update: async (id: string, payload: UpdateServiceDTO) => {
    const { data } = await client.put<ServiceListing>(`/services/${id}`, payload)
    return data
  },

  // 6) Eliminar (owner-only)
  remove: async (id: string) => {
    await client.delete(`/services/${id}`)
  }
}
