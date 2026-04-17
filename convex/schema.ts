import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  orders: defineTable({
    orderId: v.string(),
    customerName: v.string(),
    fabricType: v.string(),
    fabricLength: v.number(),
    route: v.string(), // "Reactive", "Disperse", etc.
    dueDate: v.string(),
    status: v.string(),
    priority: v.number(),
    notes: v.optional(v.string()),
  }).index("by_orderId", ["orderId"])
    .index("by_status", ["status"]),

  schedules: defineTable({
    orderId: v.string(),
    stepName: v.string(),
    machine: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    status: v.string(),
    batchGroup: v.optional(v.string()),
  }).index("by_machine", ["machine"])
    .index("by_orderId", ["orderId"]),
});
