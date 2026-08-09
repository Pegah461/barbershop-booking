"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ServiceFormSchema, type ServiceFormValues } from "@/lib/validations/admin"
import { createService, updateService, deleteService } from "./actions"

type Service = {
  id: string; name: string; priceCents: number; durationMins: number
  isActive: boolean; sortOrder: number
}

function ServiceDialog({
  service, open, onClose,
}: {
  service?: Service; open: boolean; onClose: () => void
}) {
  const [isPending, start] = useTransition()
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: service
      ? { name: service.name, priceAmount: service.priceCents / 100, durationMins: service.durationMins, isActive: service.isActive, sortOrder: service.sortOrder }
      : { name: "", priceAmount: 0, durationMins: 30, isActive: true, sortOrder: 0 },
  })

  const onSubmit = form.handleSubmit((data) => {
    start(async () => {
      const result = service
        ? await updateService(service.id, data)
        : await createService(data)
      if (result.error) toast.error(result.error)
      else { toast.success(service ? "Service updated" : "Service created"); onClose() }
    })
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "New service"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input {...form.register("name")} />
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Price (FJD)</Label>
              <Input type="number" step="0.01" min="0" {...form.register("priceAmount", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label>Duration (min)</Label>
              <Input type="number" min="1" {...form.register("durationMins", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Sort order</Label>
              <Input type="number" min="0" {...form.register("sortOrder", { valueAsNumber: true })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={form.watch("isActive")}
                onCheckedChange={(v) => form.setValue("isActive", v)}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ServiceManager({ services }: { services: Service[] }) {
  const [dialog, setDialog] = useState<{ open: boolean; service?: Service }>({ open: false })
  const [isPending, start] = useTransition()

  function handleDelete(id: string) {
    if (!confirm("Delete this service? Existing bookings are unaffected.")) return
    start(async () => {
      const result = await deleteService(id)
      if (result.error) toast.error(result.error)
      else toast.success("Service deleted")
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button onClick={() => setDialog({ open: true })}>
          <Plus className="mr-2 h-4 w-4" /> New service
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No services yet.
                </TableCell>
              </TableRow>
            )}
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>${(s.priceCents / 100).toFixed(2)}</TableCell>
                <TableCell>{s.durationMins} min</TableCell>
                <TableCell>
                  <Badge variant={s.isActive ? "default" : "secondary"}>
                    {s.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{s.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setDialog({ open: true, service: s })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)} disabled={isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ServiceDialog
        service={dialog.service}
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
      />
    </>
  )
}
