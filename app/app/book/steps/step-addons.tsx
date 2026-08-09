"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { AddonOption } from "../types"

export function StepAddons({
  addons, selectedIds, onChange,
}: {
  addons: AddonOption[]; selectedIds: string[]; onChange: (ids: string[]) => void
}) {
  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Add-ons</h2>
        <p className="text-sm text-muted-foreground">Optional — select any extras.</p>
      </div>

      {addons.length === 0 && (
        <p className="text-sm text-muted-foreground">No add-ons available.</p>
      )}

      <div className="space-y-3">
        {addons.map((a) => {
          const id = `addon-${a.id}`
          return (
            <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor={id} className="font-medium">{a.name}</Label>
                <p className="text-xs text-muted-foreground">
                  +{a.extraDurationMins} min · ${(a.priceCents / 100).toFixed(2)}
                </p>
              </div>
              <Switch
                id={id}
                checked={selectedIds.includes(a.id)}
                onCheckedChange={(v) => toggle(a.id, v)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
