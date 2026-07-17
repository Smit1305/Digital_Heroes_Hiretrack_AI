// Manual mock for next-auth used in unit/integration tests
// Prevents loading Next.js server internals (next/server, etc.)

export const auth = async () => null
export const signIn = async () => {}
export const signOut = async () => {}
export const handlers = { GET: () => {}, POST: () => {} }

export default function NextAuth(_config: unknown) {
  return { auth, signIn, signOut, handlers }
}
