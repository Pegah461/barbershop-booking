"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatInTimeZone } from "date-fns-tz"
import { toast } from "sonner"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { markCompleted, markNoShow, markCancelled } from "./actions"
import { SHOP_TZ } from "@/lib/availability"

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING:   "outline",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
  NO_SHOW:   "secondary",
}

type Booking = {
  id: string; reference: string; customerName: string; customerEmail: string
  serviceName: string; status: string; startsAt: Date; durationMins: number; totalCents: number
}

function StatusActions({ id, status }: { id: string; status: string }) {
  const [isPending, start] = useTransition()
  const terminal = ["COMPLETED", "NO_SHOW", "CANCELLED"].includes(status)
  if (terminal) return null

  async function run(fn: (id: string) => Promise<{ error?: string }>, label: string) {
    start(async () => {
      const r = await fn(id)
      if (r.error) toast.error(r.error)
      else toast.success(label)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" disabled={isPending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => run(markCompleted, "Marked as completed")}>Mark completed</DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(markNoShow,    "Marked as no-show")}>Mark no-show</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => run(markCancelled, "Cancelled")}>Cancel booking</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppointmentsTable({
  bookings, from, to, status, sort,
}: {
  bookings: Booking[]; from: string; to: string; status: string; sort: string
}) {
  const router = useRouter()
  const sp     = useSearchParams()

  function update(key: string, value: string) {
    const params = new URLSearchParams(sp.toString())
    params.set(key, value)
    router.push(`/admin/appointments?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <Input type="date" value={from} onChange={(e) => update("from", e.target.value)} className="w-36" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <Input type="date" value={to} onChange={(e) => update("to", e.target.value)} className="w-36" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <select
            value={status}
            onChange={(e) => update("status", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All</option>
            {["PENDING","CONFIRMED","COMPLETED","CANCELLED","NO_SHOW"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => update("sort", sort === "asc" ? "desc" : "asc")}
          className="gap-1"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sort === "asc" ? "Newest first" : "Oldest first"}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead><TableHead>Customer</TableHead>
              <TableHead>Service</TableHead><TableHead>Start time</TableHead>
              <TableHead>Duration</TableHead><TableHead>Total</TableHead>
              <TableHead>Status</TableHead><TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No appointments found.</TableCell></TableRow>
            )}
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">
                  <Link href={`/admin/appointments/${b.id}`} className="hover:underline text-primary">{b.reference}</Link>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{b.customerName}</div>
                  <div className="text-xs text-muted-foreground">{b.customerEmail}</div>
                </TableCell>
                <TableCell className="text-sm">{b.serviceName}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatInTimeZone(b.startsAt, SHOP_TZ, "MMM d, h:mm a")}
                </TableCell>
                <TableCell className="text-sm">{b.durationMins} min</TableCell>
                <TableCell className="text-sm">${(b.totalCents / 100).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_COLORS[b.status] ?? "outline"}>{b.status}</Badge>
                </TableCell>
                <TableCell>
                  <StatusActions id={b.id} status={b.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
