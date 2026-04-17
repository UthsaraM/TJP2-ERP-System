import { useQuery } from "../providers/mock-convex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { detectBottlenecks, calcMachineUtilization, ScheduleBlock, Order } from "../lib/scheduling-engine";
import { Activity, Clock, Layers, Zap } from "lucide-react";

export default function Dashboard() {
  const orders = useQuery("orders:listOrders") as Order[] | undefined;
  const schedules = useQuery("schedules:listSchedules") as ScheduleBlock[] | undefined;

  if (!orders || !schedules) return <div className="text-zinc-500 font-mono text-sm animate-pulse">LOADING_DATA...</div>;

  const pendingOrders = orders.filter(o => o.status === "Pending" || o.status === "Scheduled").length;
  const activeJobs = schedules.filter(s => s.status === "In Progress").length;
  
  const bottlenecks = detectBottlenecks(schedules).slice(0, 3);
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[14px] font-bold text-zinc-100 tracking-wide uppercase">Plant Overview</h1>
          <p className="text-zinc-500 mt-1">Real-time status of textile production floor.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Pending Orders</h3>
            <Layers className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">{pendingOrders}</div>
          </div>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Active Machines</h3>
            <Activity className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">{activeJobs}</div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">OEE Score</h3>
            <Zap className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">76%</div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Shift Performance</h3>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-green-500">+12%</div>
            <p className="text-[11px] text-zinc-500 mt-1">vs yesterday</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="pb-4 border-b border-zinc-800 mb-4">
            <h3 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">Detected Bottlenecks</h3>
          </div>
          <div>
            <div className="space-y-4">
              {bottlenecks.length === 0 ? <p className="text-sm text-zinc-500">No current bottlenecks detected.</p> :
                bottlenecks.map(b => (
                  <div key={b.machine} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-mono text-sm text-zinc-200">{b.machine}</span>
                    </div>
                    <span className="text-sm text-zinc-500">{b.loadHours.toFixed(1)} hrs queue</span>
                  </div>
                ))
              }
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <div className="pb-4 border-b border-zinc-800 mb-4">
            <h3 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">Machine Utilization (Next 24h)</h3>
          </div>
          <div>
             <div className="space-y-4">
                {["Print-Alpha", "Stenter-1", "Wash-A"].map(m => {
                   const util = calcMachineUtilization(m, schedules, 24);
                   return (
                     <div key={m} className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-400">
                           <span className="font-mono">{m}</span>
                           <span>{util}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                           <div className={`h-full ${util > 80 ? 'bg-red-500' : util > 50 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${util}%` }} />
                        </div>
                     </div>
                   )
                })}
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
