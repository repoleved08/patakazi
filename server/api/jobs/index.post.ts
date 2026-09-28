import { createJobSchema } from '#shared/schemas'
import { requireAdmin } from '../../services/authorization.service'
import { useJobService } from '../../services/job.service'

/**
 * POST /api/jobs — create a listing.
 *
 * Admin only. Patakazi is a hand-curated aggregator rather than a self-serve
 * board: employers do not get accounts, and every listing is entered by us, so
 * the write path is closed to anyone else.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const parsed = createJobSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'The listing could not be saved',
      data: parsed.error.flatten()
    })
  }

  const job = await useJobService(event).create(event, parsed.data)
  setResponseStatus(event, 201)
  return job
})
