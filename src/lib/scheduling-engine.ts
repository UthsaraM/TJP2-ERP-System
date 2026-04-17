// src/lib/scheduling-engine.ts
import { addMinutes, isAfter, isBefore } from "date-fns";

export type RouteType = "Reactive" | "Disperse" | "PSS" | "PD" | "Acid";
export type OrderStatus = "Pending" | "Scheduled" | "In Progress" | "Completed";

export interface Order {
  _id?: string;
  orderId: string;
  customerName: string;
  fabricType: string;
  fabricLength: number; // in meters
  route: RouteType;
  dueDate: string; // ISO timestamp
  status: OrderStatus;
  priority: number; // 1-10
  notes?: string;
}

export interface ScheduleBlock {
  _id?: string;
  orderId: string;
  stepName: string;
  machine: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: "Pending" | "In Progress" | "Completed";
  batchGroup?: string;
}

// 1. ROUTE_STEPS (New step sequences matching TexPrint plant processes)
export const ROUTE_STEPS: Record<RouteType, Array<{ stepName: string; machineGroup: string }>> = {
  PSS: [
    { stepName: "Printing", machineGroup: "print" },
    { stepName: "Baking", machineGroup: "cure" },
    { stepName: "Finishing", machineGroup: "dry" },
  ],
  PD: [
    { stepName: "Printing", machineGroup: "print" },
    { stepName: "Steaming", machineGroup: "steam" },
    { stepName: "Baking", machineGroup: "cure" },
    { stepName: "Washing", machineGroup: "wash" },
    { stepName: "Finishing", machineGroup: "dry" },
  ],
  Reactive: [
    { stepName: "Printing", machineGroup: "print" },
    { stepName: "Steaming", machineGroup: "steam" },
    { stepName: "Washing", machineGroup: "wash" },
    { stepName: "Finishing", machineGroup: "dry" },
  ],
  Acid: [
    { stepName: "Printing", machineGroup: "print" },
    { stepName: "Steaming", machineGroup: "steam" },
    { stepName: "Washing", machineGroup: "wash" },
    { stepName: "Finishing", machineGroup: "dry" },
  ],
  Disperse: [
    { stepName: "Printing", machineGroup: "print" },
    { stepName: "Curing", machineGroup: "cure" },
    { stepName: "Washing", machineGroup: "wash" },
    { stepName: "Finishing", machineGroup: "dry" },
  ],
};

// 2. MACHINE_GROUPS (Updated to match your real machines)
export const MACHINE_GROUPS: Record<string, string[]> = {
  "print": ["Print-01", "Print-02", "Print-03"],
  "steam": ["Steam-01"],
  "wash": ["Wash-01"],
  "dry": ["Dryer-01"],
  "cure": ["Baker-01"],
};

// 3. MACHINE_SPEEDS (m/min)
export const MACHINE_SPEEDS: Record<string, number> = {
  "Print-01": 30,
  "Print-02": 30,
  "Print-03": 30,
  "Steam-01": 20,
  "Wash-01": 40,
  "Dryer-01": 60,
  "Baker-01": 20,
};

// 4. ROUTE_WEIGHT (Efficiency factors for urgency)
export const ROUTE_WEIGHT: Record<RouteType, number> = {
  Reactive: 1.2,
  Disperse: 1.5,
  PSS: 1.1,
  PD: 0.8,
  Acid: 1.3,
};

// calcUrgency based on due date proximity and priority
export function calcUrgency(order: Order, now: Date): number {
  const due = new Date(order.dueDate);
  const msLeft = due.getTime() - now.getTime();
  const hoursLeft = msLeft / (1000 * 60 * 60);

  // Base urgency depends on hours left
  let urgency = 100 - hoursLeft; 
  if (urgency < 0) urgency = 0; // Plenty of time
  
  // Weight by priority and route complexity
  const score = (urgency * (order.priority / 5)) * ROUTE_WEIGHT[order.route];
  return score;
}

// calcShortJobScore prefers shorter run times
export function calcShortJobScore(length: number): number {
  return Math.max(0, 100 - (length / 100)); // Shorter jobs get higher score up to 100
}

/**
 * scheduleOrders -> The primary engine function.
 * Assigns steps to available machines, calculating time based on speed and length.
 * Respects machine availability.
 */
export function scheduleOrders(orders: Order[], currentSchedules: ScheduleBlock[], now: Date): ScheduleBlock[] {
  // 1. Sort orders by urgency desc
  const sortedOrders = [...orders].sort((a, b) => calcUrgency(b, now) - calcUrgency(a, now));

  let newSchedules: ScheduleBlock[] = [];
  
  // Keep track of machine availability (when a machine becomes free)
  const machineAvailableAt: Record<string, Date> = {};

  // Initialize with existing schedules
  for (const group of Object.values(MACHINE_GROUPS)) {
    for (const machine of group) {
      machineAvailableAt[machine] = now;
    }
  }

  // Find the latest time each machine is booked from existing active schedules
  currentSchedules.forEach(s => {
    if (s.status !== "Completed") {
      const end = new Date(s.endTime);
      if (!machineAvailableAt[s.machine] || isAfter(end, machineAvailableAt[s.machine])) {
        machineAvailableAt[s.machine] = end;
      }
    }
  });

  // 2. Decompose orders into sequential steps
  for (const order of sortedOrders) {
    if (order.status === "Completed") continue;
    
    const steps = ROUTE_STEPS[order.route];
    let orderAvailableAt = now;

    // Check if order is already partially scheduled
    const existingOrderBlocks = currentSchedules.filter(s => s.orderId === order.orderId);
    let lastScheduledStepIdx = -1;
    
    if (existingOrderBlocks.length > 0) {
      // Find the last step that was scheduled
      const sortedBlocks = existingOrderBlocks.sort((a, b) => 
        new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
      );
      const lastBlock = sortedBlocks[sortedBlocks.length - 1];
      lastScheduledStepIdx = steps.findIndex(s => s.stepName === lastBlock.stepName);
      orderAvailableAt = new Date(lastBlock.endTime);
    }

    // Schedule remaining steps
    for (let i = lastScheduledStepIdx + 1; i < steps.length; i++) {
        const step = steps[i];
        const machineGroupName = step.machineGroup;
        const possibleMachines = MACHINE_GROUPS[machineGroupName];
        if (!possibleMachines || possibleMachines.length === 0) continue;

        // Find the earliest available machine for this step
        let selectedMachine = possibleMachines[0];
        let earliestStart = machineAvailableAt[selectedMachine];

        for (const machine of possibleMachines) {
            const availAt = machineAvailableAt[machine];
            if (isBefore(availAt, earliestStart)) {
                earliestStart = availAt;
                selectedMachine = machine;
            }
        }

        // Start time is the MAXIMUM of when order is released from prev step AND machine is free
        const startTime = isAfter(earliestStart, orderAvailableAt) ? earliestStart : orderAvailableAt;

        // Duration depends on fabric length and machine speed
        // Speed is meters / min
        const speed = MACHINE_SPEEDS[selectedMachine] || 30; // fallback speed
        const durationMinutes = Math.ceil(order.fabricLength / speed) + 15; // 15 mins setup time
        const endTime = addMinutes(startTime, durationMinutes);

        // Update tracking
        machineAvailableAt[selectedMachine] = endTime;
        orderAvailableAt = endTime; // Order moves to next step

        // Create the block
        newSchedules.push({
            orderId: order.orderId,
            stepName: step.stepName,
            machine: selectedMachine,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            status: "Pending" // brand new schedule
        });
    }
  }

  return newSchedules;
}

export function detectBottlenecks(currentSchedules: ScheduleBlock[]): { machine: string, loadHours: number }[] {
  // Basic implementation: aggregate total hours scheduled per machine
  const loads: Record<string, number> = {};
  currentSchedules.filter(s => s.status !== "Completed").forEach(s => {
      const ms = new Date(s.endTime).getTime() - new Date(s.startTime).getTime();
      const hrs = ms / (1000 * 60 * 60);
      loads[s.machine] = (loads[s.machine] || 0) + hrs;
  });

  return Object.entries(loads)
      .map(([machine, loadHours]) => ({ machine, loadHours }))
      .sort((a, b) => b.loadHours - a.loadHours);
}

export function calcMachineUtilization(machine: string, schedules: ScheduleBlock[], windowHours: number = 24): number {
    // Calculates percentage of time the machine is busy over the next 24 hours
    const now = new Date();
    const windowEnd = addMinutes(now, windowHours * 60);
    
    let busyMs = 0;
    const activeBlocks = schedules.filter(s => s.machine === machine && s.status !== "Completed");
    
    activeBlocks.forEach(b => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        
        let actualStart = start > now ? start : now;
        let actualEnd = end > windowEnd ? windowEnd : end;
        
        if (actualStart < actualEnd) {
            busyMs += (actualEnd.getTime() - actualStart.getTime());
        }
    });
    
    const possibleMs = windowHours * 60 * 60 * 1000;
    return Math.min(100, Math.round((busyMs / possibleMs) * 100));
}
