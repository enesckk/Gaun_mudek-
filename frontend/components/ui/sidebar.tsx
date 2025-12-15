"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  FileText,
  Users,
  BarChart3,
  GraduationCap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/SidebarProvider";

const navigation = [
  { name: "Kontrol Paneli", href: "/", icon: LayoutDashboard },
  { name: "Derslerim", href: "/dashboard/courses", icon: BookOpen },
  { name: "Öğrenme Çıktıları", href: "/outcomes", icon: Target },
  { name: "Program Çıktıları", href: "/dashboard/program-outcomes", icon: GraduationCap },
  { name: "Sınavlar", href: "/exams", icon: FileText },
  { name: "Öğrenciler", href: "/students", icon: Users },
  { name: "Raporlar", href: "/reports", icon: BarChart3 },
  { name: "Ayarlar", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const { isOpen, setIsOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-card border-r border-border transition-transform duration-300 ease-in-out",
          "w-[280px] sm:w-64 lg:w-64 lg:translate-x-0", // Mobilde 280px, tablet+ 256px
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center h-14 lg:h-16 px-4 lg:px-6 border-b border-border flex-shrink-0">
            <h1 className="text-lg lg:text-xl font-bold text-foreground truncate">MÜDEK Yönetici</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-4 py-4 lg:py-6 space-y-1 lg:space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-sm font-medium transition-colors",
                    "min-h-[44px] lg:min-h-0", // Touch target için minimum yükseklik
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

