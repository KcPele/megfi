"use client";

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bitcoin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Info,
  Shield,
  BarChart3,
  Clock,
  Wallet,
} from "lucide-react";
import { AssetBalance } from "@/components/asset-balance";
import { AssetActions } from "@/components/asset-actions";
import { TransactionHistory } from "@/components/transaction-history";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useActors } from "@/hooks/useActors";

export function Asset() {
  const { symbol } = useParams<{ symbol: string }>();
  const { mainCanister } = useActors();
  const [dynPrice, setDynPrice] = useState<number | null>(null);
  const [liqThreshold, setLiqThreshold] = useState<number | null>(null);
  const [maxLtv, setMaxLtv] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const [prices, cfg] = await Promise.all([
          (mainCanister as any).getPrices(),
          (mainCanister as any).getProtocolConfig(),
        ]);
        const p = symbol === 'USDC'
          ? Number(prices.usdc_usd_e6s) / 1e6
          : Number(prices.btc_usd_e8s) / 1e8;
        setDynPrice(p);
        setLiqThreshold(Number(cfg.liquidationLTVBps) / 100);
        setMaxLtv(Number(cfg.maxLTVBps) / 100);
      } catch (e) {
        console.error('Failed to load asset details', e);
      }
    };
    run();
  }, [mainCanister, symbol]);

  // Mock data based on symbol
  const assetData = {
    ckBTC: {
      name: "Chain Key Bitcoin",
      icon: Bitcoin,
      colorClass: "text-accent-yellow",
      bgColorClass: "bg-accent-yellow",
      price: 37500,
      apy: 2.5,
      borrowApy: 5.2,
      balance: 0.0008,
      value: 30.0,
      change24h: 12.5,
      totalSupply: 2400000,
      totalBorrowed: 1200000,
      utilizationRate: 50,
      reserveFactor: 10,
      liquidationThreshold: 75,
      liquidationPenalty: 5,
    },
    USDC: {
      name: "USD Coin",
      icon: DollarSign,
      colorClass: "text-accent-teal",
      bgColorClass: "bg-accent-teal",
      price: 1.0,
      apy: 4.5,
      borrowApy: 7.8,
      balance: 21.0,
      value: 21.0,
      change24h: 0.0,
      totalSupply: 5000000,
      totalBorrowed: 3500000,
      utilizationRate: 70,
      reserveFactor: 10,
      liquidationThreshold: 85,
      liquidationPenalty: 5,
    },
  };

  const asset = assetData[symbol as keyof typeof assetData] || assetData.ckBTC;
  const isPositiveChange = asset.change24h > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary"
    >
      <div className="container mx-auto px-4 ">
        {/* Back Button */}
        <Button
          variant="ghost"
          asChild
          className="mb-6 hover:bg-accent-mint/10"
        >
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Asset Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 mb-8"
        >
          <div
            className={`w-16 h-16 ${asset.bgColorClass}/10 rounded-2xl flex items-center justify-center`}
          >
            <asset.icon className={`w-8 h-8 ${asset.colorClass}`} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{asset.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-lg text-muted-foreground">{symbol}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">${(dynPrice ?? asset.price).toLocaleString()}</span>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    isPositiveChange
                      ? "text-accent-mint"
                      : asset.change24h < 0
                      ? "text-accent-pink"
                      : "text-muted-foreground"
                  }`}
                >
                  {isPositiveChange ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : asset.change24h < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : null}
                  <span>{Math.abs(asset.change24h)}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Asset Balance */}
        <AssetBalance symbol={symbol!} />

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <AssetActions />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Market Overview */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-accent-mint/10 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent-mint" />
                  Market Overview
                </CardTitle>
                <CardDescription>
                  Current market statistics for {symbol}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">
                          Supply APY
                        </span>
                        <span className="text-sm font-medium text-accent-mint">—</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">
                          Borrow APY
                        </span>
                        <span className="text-sm font-medium text-accent-pink">—</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-bg-secondary/50">
                      <span className="text-sm text-muted-foreground">
                        Total Supply
                      </span>
                      <span className="text-sm font-medium">—</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-bg-secondary/50">
                      <span className="text-sm text-muted-foreground">
                        Total Borrowed
                      </span>
                      <span className="text-sm font-medium">—</span>
                    </div>
                  </div>
                </div>

                {/* Utilization Rate */}
                <div className="mt-6 p-4 rounded-lg bg-bg-secondary/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Utilization Rate</span>
                    <span className="text-sm font-medium">—</span>
                  </div>
                  <Progress value={0} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2">—</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Parameters */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-accent-yellow/10 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent-yellow" />
                  Risk Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Reserve Factor
                    </span>
                  </div>
                  <span className="text-sm font-medium">—</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Liquidation Threshold
                    </span>
                  </div>
                  <span className="text-sm font-medium">{liqThreshold !== null ? `${liqThreshold.toFixed(0)}%` : '—'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Max LTV
                    </span>
                  </div>
                  <span className="text-sm font-medium">{maxLtv !== null ? `${maxLtv.toFixed(0)}%` : '—'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Liquidation Penalty
                    </span>
                  </div>
                  <span className="text-sm font-medium text-accent-pink">—</span>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20">
                  <p className="text-xs text-accent-yellow">
                    Assets can be liquidated when health factor drops below 1.0
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-accent-teal/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-teal" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your transaction history for {symbol}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionHistory />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
