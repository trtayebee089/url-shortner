import { callBackend, relay } from '../../utils/backend'

export default defineEventHandler(async (event): Promise<unknown> => relay(event, await callBackend(event, 'auth/me')))
