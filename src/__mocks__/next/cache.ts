// Manual mock for next/cache used in unit/integration tests
export const revalidatePath = () => {}
export const revalidateTag = () => {}
export const unstable_cache = <T extends (...args: unknown[]) => unknown>(fn: T) => fn
