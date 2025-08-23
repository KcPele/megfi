import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus } from "lucide-react";

export function AssetActions() {
  const actions = [
    {
      label: "Repay",
      path: "/repay",
      icon: RefreshCw,
      color: "bg-accent-yellow hover:bg-accent-yellow/90",
      textColor: "text-black",
      description: "Clear debt",
    },
    {
      label: "Borrow",
      path: "/borrow-stable",
      icon: Plus,
      color: "bg-accent-teal hover:bg-accent-teal/90",
      textColor: "text-black",
      description: "Get liquidity",
    },
    {
      label: "Supply",
      path: "/supply",
      icon: ArrowUpRight,
      color: "bg-accent-mint hover:bg-accent-mint/90",
      textColor: "text-black",
      description: "Earn interest",
    },
    {
      label: "Withdraw",
      path: "/withdraw",
      icon: ArrowDownLeft,
      color: "bg-accent-pink hover:bg-accent-pink/90",
      textColor: "text-black",
      description: "Remove funds",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              to={action.path}
              className={`group relative overflow-hidden ${action.color} ${action.textColor} rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/20" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-white/10" />
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
                <p className="text-xs opacity-80">{action.description}</p>
              </div>

              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 bg-white/10"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
