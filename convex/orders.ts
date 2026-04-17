import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const addOrder = mutation({
  args: {
    orderId: v.string(),
    customerName: v.string(),
    fabricType: v.string(),
    fabricLength: v.number(),
    route: v.string(),
    dueDate: v.string(),
    status: v.string(),
    priority: v.number(),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      ...args,
    });
  },
});
