import React, { createContext, useContext, useState, useEffect } from "react";
import { Order, ScheduleBlock, RouteType } from "../lib/scheduling-engine";

// Simple Local Storage based mock for Convex since we are in a preview environment without a Convex URL
// We maintain the same API structure as Convex to allow easy swap.

type Store = {
    orders: Order[];
    schedules: ScheduleBlock[];
}

const defaultData: Store = {
    orders: [
        { orderId: "ORD-001", customerName: "Acme Textiles", fabricType: "Cotton 100%", fabricLength: 2500, route: "Reactive", dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), status: "Scheduled", priority: 8 },
        { orderId: "ORD-002", customerName: "Global Fabrics", fabricType: "Polyester", fabricLength: 5000, route: "Disperse", dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: "Pending", priority: 5 },
        { orderId: "ORD-003", customerName: "Luxury Silk", fabricType: "Silk Blend", fabricLength: 1200, route: "Acid", dueDate: new Date(Date.now() + 86400000 * 1).toISOString(), status: "Pending", priority: 9 }
    ],
    schedules: []
};

let store: Store = { ...defaultData };
let listeners: Function[] = [];

const notify = () => listeners.forEach(l => l());

export const useQuery = (queryName: string, args?: any) => {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const update = () => {
            if (queryName === "orders:listOrders") {
                setData([...store.orders].reverse());
            } else if (queryName === "schedules:listSchedules") {
                setData([...store.schedules]);
            }
        };
        update();
        listeners.push(update);
        return () => { listeners = listeners.filter(l => l !== update); };
    }, [queryName, JSON.stringify(args)]);

    return data;
};

export const useMutation = (mutationName: string) => {
    return async (args: any) => {
        if (mutationName === "orders:addOrder") {
            store.orders.push({ ...args, _id: "ord_" + Math.random().toString(36).substr(2, 9) });
        } else if (mutationName === "schedules:addSchedules") {
            args.schedules.forEach((s: any) => store.schedules.push({ ...s, _id: "sch_" + Math.random().toString(36).substr(2, 9) }));
        } else if (mutationName === "schedules:updateScheduleStatus") {
            const index = store.schedules.findIndex(s => s._id === args.id);
            if (index > -1) store.schedules[index].status = args.status;
        } else if (mutationName === "schedules:clearPendingSchedules") {
            store.schedules = store.schedules.filter(s => s.status !== "Pending");
        }
        notify();
    };
};
