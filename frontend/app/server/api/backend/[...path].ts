import { callBackend, relay } from '../../utils/backend'

export default defineEventHandler(async (event): Promise<unknown> => {
  const path = getRouterParam(event, 'path') || ''
  if (!isAllowedBackendPath(path)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  const method = event.method
  const body = ['GET', 'HEAD'].includes(method) ? undefined : await readBody(event)
  const response = await callBackend(event, path, { method, query: getQuery(event), body })
  return relay(event, response)
})
