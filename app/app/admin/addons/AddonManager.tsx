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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddonFormSchema, type AddonFormValues } from "@/lib/validations/admin"
import { createAddon, updateAddon, deleteAddon } from "./actions"

type Addon = {
  id: string; name: string; priceCents: number; extraDurationMins: number
  isActive: boolean; sortOrder: number
}

function AddonDialog({ addon, open, onClose }: { addon?: Addon; open: boolean; onClose: () => void }) {
  const [isPending, start] = useTransition()
  const form = useForm<AddonFormValues>({
    resolver: zodResolver(AddonFormSchema),
    defaultValues: addon
      ? { name: addon.name, priceAmount: addon.priceCents / 100, extraDurationMins: addon.extraDurationMins, isActive: addon.isActive, sortOrder: addon.sortOrder }
      : { name: "", priceAmount: 0, extraDurationMins: 10, isActive: true, sortOrder: 0 },
  })

  const onSubmit = form.handleSubmit((data) => {
    start(async () => {
      const result = addon ? await updateAddon(addon.id, data) : await createAddon(data)
      if (result.error) toast.error(result.error)
      else { toast.success(addon ? "Addon updated" : "Addon created"); onClose() }
    })
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{addon ? "Edit addon" : "New addon"}</DialogTitle></DialogHeader>
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
              <Label>Extra duration (min)</Label>
              <Input type="number" min="1" {...form.register("extraDurationMins", { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Sort order</Label>
              <Input type="number" min="0" {...form.register("sortOrder", { valueAsNumber: true })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} />
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

export function AddonManager({ addons }: { addons: Addon[] }) {
  const [dialog, setDialog] = useState<{ open: boolean; addon?: Addon }>({ open: false })
  const [isPending, start] = useTransition()

  function handleDelete(id: string) {
    if (!confirm("Delete this addon?")) return
    start(async () => {
      const result = await deleteAddon(id)
      if (result.error) toast.error(result.error)
      else toast.success("Addon deleted")
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Addons</h1>
        <Button onClick={() => setDialog({ open: true })}>
          <Plus className="mr-2 h-4 w-4" /> New addon
        </Button>
      </div>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Price</TableHead>
              <TableHead>Extra duration</TableHead><TableHead>Status</TableHead>
              <TableHead>Order</TableHead><TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No addons yet.</TableCell></TableRow>
            )}
            {addons.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>${(a.priceCents / 100).toFixed(2)}</TableCell>
                <TableCell>+{a.extraDurationMins} min</TableCell>
                <TableCell><Badge variant={a.isActive ? "default" : "secondary"}>{a.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell>{a.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setDialog({ open: true, addon: a })}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(a.id)} disabled={isPending}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AddonDialog addon={dialog.addon} open={dialog.open} onClose={() => setDialog({ open: false })} />
    </>
  )
}
