// frontend/src/api/trades.ts
import client from "./client";

export interface CreateTradeDto {
  proposerServiceId: string;
  receiverServiceId: string;
  note?: string;
}

export interface Trade {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
  note?: string;
  createdAt: string;

  // Nota: en GET /trades tu backend devuelve solo { name } (sin id),
  // por eso dejamos id como opcional para evitar inconsistencias.
  proposer?: {
    id?: string;
    name?: string;
  };

  receiver?: {
    id?: string;
    name?: string;
  };

  // Nota: en GET /trades tu backend devuelve solo { title } (sin id)
  proposerService?: {
    id?: string;
    title?: string;
  };

  receiverService?: {
    id?: string;
    title?: string;
  };
}

export interface TradesResponse {
  incoming: Trade[];
  outgoing: Trade[];
}

export const tradesApi = {
  // 1) Crear
  create: async (data: CreateTradeDto): Promise<Trade> => {
    const { data: responseData } = await client.post<Trade>("/trades", data);
    return responseData;
  },

  // 2) Obtener todos mis trueques
  getAll: async (): Promise<TradesResponse> => {
    const { data } = await client.get<TradesResponse>("/trades");
    return data;
  },

  // 3) Responder (Aceptar o Rechazar)
  respond: async (tradeId: string, action: "accept" | "reject"): Promise<Trade> => {
    const { data } = await client.put<Trade>(`/trades/${tradeId}/respond`, { action });
    return data;
  },

  // 4) Completar trueque (Sprint 3)
  complete: async (tradeId: string): Promise<Trade> => {
    const { data } = await client.put<Trade>(`/trades/${tradeId}/complete`);
    return data;
  }
};