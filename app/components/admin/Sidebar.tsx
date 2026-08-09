"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Calendar, Clock, Ban, Scissors, Plus, Settings, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin",              label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/schedule",     label: "Schedule",     icon: Clock },
  { href: "/admin/closures",     label: "Closures",     icon: Ban },
  { href: "/admin/services",     label: "Services",     icon: Scissors },
  { href: "/admin/addons",       label: "Addons",       icon: Plus },
  { href: "/admin/settings",     label: "Settings",     icon: Settings },
]

export function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-bold tracking-tight text-sm">Barbershop Admin</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-2 pt-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? path === "/admin" : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="ml-auto h-3 w-3" />}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
