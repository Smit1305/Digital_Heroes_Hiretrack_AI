// Manual mock for next/headers used in unit/integration tests
export const headers = () => new Map()
export const cookies = () => ({
  get: () => undefined,
  set: () => {},
  delete: () => {},
  getAll: () => [],
})
