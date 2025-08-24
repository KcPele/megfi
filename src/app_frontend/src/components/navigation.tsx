"use client";

import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Wallet,
  TrendingUp,
  User,
  LayoutDashboard,
  ArrowUpRight,
  CreditCard,
  ChartBar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Navigation() {
  const location = useLocation();
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navItems = [
    { path: "/home", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/asset", icon: ChartBar, label: "Assets" },
    { path: "/deposit-btc", icon: ArrowUpRight, label: "Deposit" },
    { path: "borrow", icon: CreditCard, label: "Borrow" },
    { path: "/account", icon: User, label: "Account" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-white/[0.08]">
      <div className="flex justify-around items-center h-20">
        {navItems.map((navItem) => {
          const active = isActive(navItem.path);
          const Icon = navItem.icon;

          return (
            <Link
              key={navItem.path}
              to={navItem.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-all group",
                "hover:scale-105 active:scale-95"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all",
                  active ? "bg-accent-mint/20" : "group-hover:bg-white/[0.05]"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    active
                      ? "text-accent-mint"
                      : "text-text-muted group-hover:text-text-secondary"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  active
                    ? "text-accent-mint"
                    : "text-text-muted group-hover:text-text-secondary"
                )}
              >
                {navItem.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
