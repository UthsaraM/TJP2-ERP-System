import { useQuery, useMutation } from "../providers/mock-convex";
import { Order, ScheduleBlock, scheduleOrders, MACHINE_GROUPS } from "../lib/scheduling-engine";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Play } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function Schedule() {
  const orders = useQuery("orders:listOrders") as Order[] | undefined;
  const schedules = useQuery("schedules:listSchedules") as ScheduleBlock[] | undefined;
  
  const addSchedules = useMutation("schedules:addSchedules");
  const clearPending = useMutation("schedules:clearPendingSchedules");
  const [isComputing, setIsComputing] = useState(false);

  if (!orders || !schedules) return <div className="text-zinc-500 font-mono text-sm animate-pulse">LOADING_SCHEDULE...</div>;

  const runIntelligence = async () => {
    setIsComputing(true);
    // Erase all currently pending schedules to reschedule from scratch
    await clearPending({});
    
    // Calculate new schedules
    const activeBlocks = schedules.filter(s => s.status !== "Pending");
    const newBlocks = scheduleOrders(orders, activeBlocks, new Date());
    
    if (newBlocks.length > 0) {
      await addSchedules({ schedules: newBlocks });
    }
    
    setTimeout(() => setIsComputing(false), 800); // UI visual feedback
  };

  // Group schedules by Machine for visual rendering
  const blocksByMachine: Record<string, ScheduleBlock[]> = {};
  Object.keys(MACHINE_GROUPS).forEach(step => {
      MACHINE_GROUPS[step].forEach(machine => {
          blocksByMachine[machine] = [];
      });
  });

  schedules.forEach(s => {
      if (!blocksByMachine[s.machine]) blocksByMachine[s.machine] = [];
      blocksByMachine[s.machine].push(s);
  });

  return (
    <div className="space-y-6 max-w-7xl flex flex-col h-full mx-auto pb-8">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-[14px] font-bold text-zinc-100 tracking-wide uppercase">Smart Scheduler</h1>
          <p className="text-zinc-500 mt-1">AI-assisted machine allocation and bottleneck avoidance.</p>
        </div>
        
        <Button 
          onClick={runIntelligence} 
          disabled={isComputing}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-all whitespace-nowrap"
        >
          <BrainCircuit className={`w-4 h-4 mr-2 ${isComputing ? 'animate-spin' : ''}`} /> 
          {isComputing ? 'Computing...' : 'Run Engine'}
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-md relative p-4">
         {/* Simple Timeline View */}
         <div className="min-w-[1000px] pb-4 border rounded-[4px] border-zinc-800 relative bg-[repeating-linear-gradient(90deg,transparent,transparent_99px,#2d333d_100px)] py-2">
            {Object.entries(blocksByMachine).map(([machine, blocks]) => {
                if (blocks.length === 0) return null;
                
                return (
                    <div key={machine} className="flex items-center h-[32px] mb-1 pl-[110px] relative">
                        <div className="absolute left-[8px] font-mono text-[10px] text-zinc-500">
                            {machine}
                        </div>
                        <div className="flex gap-1 h-[24px]">
                            {blocks.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(b => {
                                return (
                                    <div key={b._id || b.orderId + b.stepName} className={`h-full rounded-[3px] flex items-center px-2 text-[10px] text-white opacity-80 min-w-[100px] truncate
                                        ${b.status === 'Completed' ? 'bg-zinc-800 text-zinc-400' : 
                                          b.status === 'In Progress' ? 'bg-[#2f81f7]' : 
                                          'bg-[#238636]'}`}>
                                        {b.orderId} ({b.stepName.substr(0,4)})
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
         </div>
         {schedules.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                 No schedules available. Run engine to calculate.
             </div>
         )}
      </div>
    </div>
  );
}
