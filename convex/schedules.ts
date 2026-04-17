import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listSchedules = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("schedules").collect();
  },
});

export const addSchedules = mutation({
  args: {
    schedules: v.array(v.object({
        orderId: v.string(),
        stepName: v.string(),
        machine: v.string(),
        startTime: v.string(),
        endTime: v.string(),
        status: v.string(),
        batchGroup: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    for (const s of args.schedules) {
      await ctx.db.insert("schedules", s);
    }
  },
});

export const updateScheduleStatus = mutation({
    args: {
        id: v.id("schedules"),
        status: v.string()
    },
    handler: async (ctx, { id, status }) => {
        await ctx.db.patch(id, { status });
    }
});

// Used to wipe current unstarted schedules and replace them when re-running intelligence
export const clearPendingSchedules = mutation({
    args: {},
    handler: async (ctx) => {
        const pending = await ctx.db.query("schedules").filter(q => q.eq(q.field("status"), "Pending")).collect();
        for (const p of pending) {
            await ctx.db.delete(p._id);
        }
    }
});
