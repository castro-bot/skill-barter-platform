// frontend/src/api/ratings.ts
import client from "./client"

export interface Rating {
  id: string
  score: number
  comment?: string | null
  tags: string[]
  createdAt: string
  tradeId: string
  rater?: {
    id?: string
    name?: string
  }
}

export interface RatingSummary {
  average: number
  count: number
}

export interface RatingMeta {
  tagsByScore: Record<number, string[]>
  maxTags: number
  maxCommentLength: number
}

export interface CreateRatingDto {
  tradeId: string
  score: number
  comment?: string
  tags?: string[]
}

export const ratingsApi = {
  create: async (payload: CreateRatingDto): Promise<Rating> => {
    const { data } = await client.post<Rating>("/ratings", payload)
    return data
  },

  getUserSummary: async (userId: string): Promise<RatingSummary> => {
    const { data } = await client.get<RatingSummary>(`/users/${userId}/rating-summary`)
    return data
  },

  getUserRatings: async (userId: string, limit = 5, offset = 0): Promise<Rating[]> => {
    const params = new URLSearchParams()
    params.set("limit", String(limit))
    params.set("offset", String(offset))
    const { data } = await client.get<{ ratings: Rating[] }>(`/users/${userId}/ratings?${params.toString()}`)
    return data.ratings
  },

  getMeta: async (): Promise<RatingMeta> => {
    const { data } = await client.get<RatingMeta>("/ratings/meta")
    return data
  }
}
