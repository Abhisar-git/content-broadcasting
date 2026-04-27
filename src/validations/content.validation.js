const { z } = require("zod");

const listContentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  subject: z.string().trim().optional(),
  status: z.string().trim().optional(),
  teacherId: z.coerce.number().int().positive().optional()
});

const contentIdParamSchema = z.object({
  contentId: z.coerce.number().int().positive()
});

const rejectContentSchema = z.object({
  reason: z.string().trim().min(3).max(500)
});

const liveQuerySchema = z.object({
  subject: z.string().trim().optional()
});

const liveParamSchema = z.object({
  teacherPublicId: z.string().trim().min(1)
});

module.exports = {
  listContentQuerySchema,
  contentIdParamSchema,
  rejectContentSchema,
  liveQuerySchema,
  liveParamSchema
};
