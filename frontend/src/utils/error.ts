import type { AxiosError } from "axios"

type ApiErrorBody = {
  message?: string
  error?: string
}

export const getApiErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === "object" && "isAxiosError" in err) {
    const axiosErr = err as AxiosError<ApiErrorBody>
    const data = axiosErr.response?.data
    if (data?.message) return data.message
    if (data?.error) return data.error
  }

  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message
  }

  return fallback
}
