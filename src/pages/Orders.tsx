import { useState } from "react";
import { useQuery, useMutation } from "../providers/mock-convex";
import { Order, RouteType } from "../lib/scheduling-engine";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Orders() {
  const orders = useQuery("orders:listOrders") as Order[] | undefined;
  const addOrder = useMutation("orders:addOrder");
  const [open, setOpen] = useState(false);
  
  // New order state
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerName: "",
    fabricType: "",
    fabricLength: 1000,
    route: "Reactive",
    dueDate: format(new Date(Date.now() + 86400000*7), "yyyy-MM-dd"),
    priority: 5,
    status: "Pending"
  });

  if (!orders) return <div className="text-zinc-500 font-mono text-sm animate-pulse">LOADING_ORDERS...</div>;

  const handleCreate = async () => {
    await addOrder({
      orderId: `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      ...newOrder,
      dueDate: new Date(newOrder.dueDate || "").toISOString(),
    });
    setOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[14px] font-bold text-zinc-100 tracking-wide uppercase">Order Management</h1>
          <p className="text-zinc-500 mt-1">Manage production requirements and incoming jobs.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-[6px] h-8 text-[12px]" />}>
             <Plus className="w-4 h-4 mr-2"/> New Order
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle>Create Production Order</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-zinc-400">Customer</Label>
                <Input className="col-span-3 bg-zinc-950 border-zinc-800" value={newOrder.customerName} onChange={e => setNewOrder({...newOrder, customerName: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-zinc-400">Fabric</Label>
                <Input className="col-span-3 bg-zinc-950 border-zinc-800" value={newOrder.fabricType} onChange={e => setNewOrder({...newOrder, fabricType: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-zinc-400">Length (m)</Label>
                <Input type="number" className="col-span-3 bg-zinc-950 border-zinc-800" value={newOrder.fabricLength} onChange={e => setNewOrder({...newOrder, fabricLength: parseInt(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-zinc-400">Route</Label>
                <Select value={newOrder.route} onValueChange={(v: RouteType) => setNewOrder({...newOrder, route: v})}>
                  <SelectTrigger className="col-span-3 bg-zinc-950 border-zinc-800">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="Reactive">Reactive</SelectItem>
                    <SelectItem value="Disperse">Disperse</SelectItem>
                    <SelectItem value="PSS">PSS</SelectItem>
                    <SelectItem value="PD">PD</SelectItem>
                    <SelectItem value="Acid">Acid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-zinc-400">Due Date</Label>
                <Input type="date" className="col-span-3 bg-zinc-950 border-zinc-800" value={newOrder.dueDate} onChange={e => setNewOrder({...newOrder, dueDate: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white">Cancel</Button>
              <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700 text-white">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-[6px] border border-zinc-800 bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-[#1c2128]">
            <TableRow className="border-b border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-500 font-sans font-semibold text-[11px] uppercase tracking-wider py-3">ORDER_ID</TableHead>
              <TableHead className="text-zinc-500 font-sans font-semibold text-[11px] uppercase tracking-wider py-3">CUSTOMER</TableHead>
              <TableHead className="text-zinc-500 font-sans font-semibold text-[11px] uppercase tracking-wider py-3">ROUTE</TableHead>
              <TableHead className="text-zinc-500 font-sans font-semibold text-[11px] uppercase tracking-wider py-3">LENGTH(M)</TableHead>
              <TableHead className="text-zinc-500 font-sans font-semibold text-[11px] uppercase tracking-wider py-3">DUE</TableHead>
              <TableHead className="text-zinc-500 font-sans font-semibold text-[11px] uppercase tracking-wider py-3">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id || order.orderId} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-mono text-zinc-100 py-3 text-[12px]">{order.orderId}</TableCell>
                <TableCell className="text-zinc-100 font-mono text-[12px] py-3">{order.customerName}</TableCell>
                <TableCell className="py-3">
                  <Badge variant="outline" className={`border text-[10px] uppercase font-semibold
                      ${order.route === 'Reactive' ? 'bg-[#23863633] text-[#3fb950] border-[#3fb9504d]' : 
                        order.route === 'Acid' ? 'bg-[#8b4eff33] text-[#a371f7] border-[#a371f74d]' : 
                        order.route === 'Disperse' ? 'bg-[#d2992233] text-[#d29922] border-[#d299224d]' :
                        'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                    {order.route}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-zinc-100 py-3 text-[12px]">{order.fabricLength.toLocaleString()}</TableCell>
                <TableCell className="font-mono text-zinc-100 py-3 text-[12px]">{format(new Date(order.dueDate), "dd MMM, HH:mm")}</TableCell>
                <TableCell className="py-3 font-mono text-[12px]">
                  <span className={`${
                    order.status === 'Completed' ? 'text-green-500' : 
                    order.status === 'In Progress' ? 'text-orange-500' :
                    order.status === 'Scheduled' ? 'text-purple-400' :
                    'text-zinc-500'
                  }`}>
                    {order.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-zinc-500">No orders found.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
