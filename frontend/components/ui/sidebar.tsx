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
  Menu,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Öğrenme Çıktıları", href: "/outcomes", icon: Target },
  { name: "Sınavlar", href: "/exams", icon: FileText },
  { name: "Öğrenciler", href: "/students", icon: Users },
  { name: "Raporlar", href: "/reports", icon: BarChart3 },
];

const courseNavigation = [
  { name: "Derslerim", href: "/dashboard/courses", icon: BookOpen },
  { name: "Yeni Ders Oluştur", href: "/dashboard/courses/create", icon: Plus, highlight: true },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <h1 className="text-xl font-bold">MÜDEK Admin</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Course Section Separator */}
            <div className="my-4 border-t border-border" />

            {/* Course Navigation */}
            {courseNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              const isHighlighted = item.highlight;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isHighlighted && "border-2 border-green-600",
                    isActive
                      ? isHighlighted
                        ? "bg-green-600 text-white font-bold"
                        : "bg-primary text-primary-foreground"
                      : isHighlighted
                      ? "bg-green-600/10 text-green-600 border-green-600 hover:bg-green-600/20 font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isHighlighted && "h-6 w-6")} />
                  <span className={cn(isHighlighted && "text-base font-semibold")}>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

