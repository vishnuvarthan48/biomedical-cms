"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Download, AlertTriangle } from "lucide-react"
import { inventoryItems } from "@/lib/mock-data"

const statusColors: Record<string, string> = {
  "In Stock": "bg-[#D1FAE5] text-[#059669]",
  "Low Stock": "bg-[#FEF3C7] text-[#D97706]",
  "Out of Stock": "bg-[#FEE2E2] text-[#DC2626]",
}

export function InventoryPage() {
  const lowStockCount = inventoryItems.filter(i => i.status !== "In Stock").length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Inventory</h1>
          <p className="text-base text-muted-foreground mt-1">Spare parts and consumables management</p>
        </div>
        <div className="flex gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FEF3C7] text-[#D97706] text-sm font-bold">
              <AlertTriangle className="w-4 h-4" /> {lowStockCount} items need attention
            </div>
          )}
          <Button className="text-white border-0 text-sm font-semibold px-5 py-2.5 h-auto" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}>
            <Plus className="w-5 h-5 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search inventory..." className="pl-11 h-11 bg-card border-border text-base" />
        </div>
        <Button variant="outline" className="h-11 text-sm font-semibold px-4"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
        <Button variant="outline" className="h-11 text-sm font-semibold px-4"><Download className="w-4 h-4 mr-2" /> Export</Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-muted/30">
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">ID</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Item Name</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Category</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Qty</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Min Qty</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Unit Cost</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map(item => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-[#00BCD4] text-sm">{item.id}</td>
                    <td className="py-4 px-5 text-foreground font-medium text-sm">{item.name}</td>
                    <td className="py-4 px-5 text-foreground text-sm">{item.category}</td>
                    <td className={`py-4 px-5 font-bold text-sm ${item.qty <= item.minQty ? "text-[#DC2626]" : "text-foreground"}`}>{item.qty}</td>
                    <td className="py-4 px-5 text-foreground text-sm">{item.minQty}</td>
                    <td className="py-4 px-5 text-foreground font-semibold text-sm">${item.unitCost.toLocaleString()}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusColors[item.status]}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
