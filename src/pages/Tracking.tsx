import { useQuery, useMutation } from "../providers/mock-convex";
import { ScheduleBlock, Order } from "../lib/scheduling-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PlayCircle } from "lucide-react";

export default function Tracking() {
  const schedules = useQuery("schedules:listSchedules") as ScheduleBlock[] | undefined;
  const updateStatus = useMutation("schedules:updateScheduleStatus");

  if (!schedules) return <div className="text-zinc-500 font-mono text-sm animate-pulse">LOADING_TRACKING...</div>;

  const handleStart = async (id: string, currentStatus: string) => {
      if (currentStatus === "Pending") {
          await updateStatus({ id, status: "In Progress" });
      }
  };

  const handleComplete = async (id: string, currentStatus: string) => {
      if (currentStatus === "In Progress") {
          await updateStatus({ id, status: "Completed" });
          
          // Note: In a full implementation, completing the final step of an order 
          // would also trigger an order status update via a trigger or Convex function.
      }
  };

  const activeSchedules = schedules.filter(s => s.status !== "Completed").sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-[14px] font-bold text-zinc-100 tracking-wide uppercase">Job Tracking</h1>
        <p className="text-zinc-500 mt-1">Real-time floor execution and machine status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeSchedules.map(block => (
              <Card key={block._id} className="bg-zinc-900 border-zinc-800 p-4">
                  <div className="pb-2 flex flex-row items-center justify-between border-b border-zinc-800 mb-3">
                     <h3 className="font-mono text-[12px] text-zinc-300 font-bold">{block.orderId}</h3>
                     <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${block.status === 'In Progress' ? 'bg-[#2f81f7] text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                         {block.status}
                     </span>
                  </div>
                  <div>
                      <div className="space-y-3">
                          <div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Machine</div>
                              <div className="font-medium text-zinc-200 text-[12px]">{block.machine}</div>
                          </div>
                          <div>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Process Step</div>
                              <div className="font-medium text-zinc-200 text-[12px]">{block.stepName}</div>
                          </div>

                          <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
                              {block.status === 'Pending' ? (
                                  <Button className="w-full bg-[#1f6feb] hover:bg-[#2f81f7] h-7 text-[11px] rounded-[4px]" size="sm" onClick={() => block._id && handleStart(block._id, block.status)}>
                                      <PlayCircle className="w-3.5 h-3.5 mr-1.5" /> Start
                                  </Button>
                              ) : (
                                  <Button className="w-full bg-[#238636] hover:bg-[#2ea043] h-7 text-[11px] rounded-[4px]" size="sm" onClick={() => block._id && handleComplete(block._id, block.status)}>
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Complete
                                  </Button>
                              )}
                          </div>
                      </div>
                  </div>
              </Card>
          ))}
          {activeSchedules.length === 0 && (
              <div className="col-span-full border border-dashed border-zinc-800 rounded-lg p-12 flex items-center justify-center text-zinc-500">
                  No active jobs on the floor currently.
              </div>
          )}
      </div>
      
    </div>
  );
}
