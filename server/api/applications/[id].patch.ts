import { updateApplicationStatusSchema } from '#shared/schemas'
import { useApplicationService } from '../../services/application.service'

/**
 * PATCH /api/applications/:id — move an application through the pipeline.
 *
 * Employers only: the service re-checks that the caller can manage the company
 * the application belongs to, so a status change is never a public write.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing application id' })

  const parsed = updateApplicationStatusSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid application status',
      data: parsed.error.flatten()
    })
  }

  return useApplicationService(event).updateStatus(event, id, parsed.data.status)
})
