/**
 * Transport shim shared by every service.
 *
 * Today it resolves against the local mock dataset. Swapping in a real backend
 * means replacing `request` with a fetch call — the service signatures and the
 * feature code above them stay exactly as they are.
 */

const BASE_LATENCY = 140

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

/** Simulates a network round-trip so loading states are real, not decorative. */
export async function request<T>(resolver: () => T, latency = BASE_LATENCY): Promise<T> {
  await delay(latency)
  return resolver()
}

export function notFound(entity: string, id: string): never {
  throw new ApiError(`${entity} "${id}" was not found`, 404)
}
