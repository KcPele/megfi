import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Info } from "lucide-react";

interface AssetBalanceProps {
  symbol: string;
}

export function AssetBalance({ symbol }: AssetBalanceProps) {
  // Mock data - in real app, this would come from props or API
  const balance = 8098.74;
  const usdValue = 324589.32;
  const change24h = 2.45;
  const isPositive = change24h > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8 mt-6"
    >
      {/* Main Balance */}
      <div className="mb-6">
        <h2 className="text-4xl font-bold mb-2">
          {balance.toLocaleString()} {symbol}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <p className="text-xl text-muted-foreground">
            ${usdValue.toLocaleString()}
          </p>
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? "text-accent-mint" : "text-accent-pink"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(change24h)}%</span>
          </div>
        </div>
      </div>

      {/* Available Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="inline-flex items-center gap-3 bg-bg-secondary/50 backdrop-blur-sm border border-accent-mint/10 rounded-xl px-6 py-4"
      >
        <div className="text-left">
          <p className="text-sm text-muted-foreground mb-1">
            Available Balance
          </p>
          <p className="text-2xl font-semibold">{balance.toLocaleString()}</p>
        </div>
        <div className="h-12 w-px bg-accent-mint/20" />
        <div className="text-left">
          <p className="text-sm text-muted-foreground mb-1">Locked</p>
          <p className="text-2xl font-semibold">0.00</p>
        </div>
        <div className="relative group">
          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-bg-tertiary rounded-lg text-xs sm:whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Locked balance includes staked and collateralized assets
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
