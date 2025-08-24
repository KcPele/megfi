import { cn } from "../lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Bitcoin,
  DollarSign,
  TrendingUp,
  Zap,
  Globe,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

export const Gate = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { isAuthenticated, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 md:w-72 h-72 bg-accent-mint/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-teal/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[600px] h-[600px] bg-accent-yellow/5 rounded-full blur-3xl" />
        </div>

        {/* Main Content */}
        <div className="container mx-auto relative z-10 min-h-screen flex flex-col lg:flex-row">
          {/* Left Section - Info */}
          <div className="order-2 md:order-1 flex-1 flex items-center justify-center p-8 lg:p-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              {/* Logo */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent-mint rounded-xl flex items-center justify-center">
                    <Bitcoin className="w-6 h-6 text-black" />
                  </div>
                  <h1 className="text-3xl font-bold">MegFi</h1>
                </div>
                <p className="text-xl text-text-secondary">
                  The Future of Cross-Chain DeFi on Internet Computer
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 bg-accent-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bitcoin className="w-5 h-5 text-accent-yellow" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      Native Bitcoin Integration
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Bridge your BTC directly to Internet Computer with Chain
                      Key Bitcoin (ckBTC)
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 bg-accent-teal/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-accent-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instant USDC Loans</h3>
                    <p className="text-sm text-text-secondary">
                      Borrow stablecoins against your BTC collateral with
                      competitive rates
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 bg-accent-mint/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-accent-mint" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      Secure & Decentralized
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Built on Internet Computer with advanced cryptography and
                      smart contracts
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 bg-accent-pink/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-accent-pink" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Earn Yield</h3>
                    <p className="text-sm text-text-secondary">
                      Supply assets to earn competitive APY while maintaining
                      full control
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-4 p-6 bg-bg-secondary/50 rounded-2xl backdrop-blur-sm border border-white/5"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent-mint">$200</p>
                  <p className="text-xs text-text-secondary">Total Locked</p>
                </div>
                <div className="text-center border-x border-white/5">
                  <p className="text-2xl font-bold text-accent-yellow">4.5%</p>
                  <p className="text-xs text-text-secondary">Avg APY</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent-teal">15</p>
                  <p className="text-xs text-text-secondary">Active Users</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Section - Login */}
          <div className="order-1 md:order-2 flex-1 flex items-center justify-center p-8 lg:p-16">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-md"
            >
              <div className="bg-bg-secondary/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="w-20 h-20 bg-gradient-to-br from-accent-mint to-accent-teal rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Lock className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to Megfi</h2>
                  <p className="text-text-secondary">
                    Connect your Internet Identity to get started
                  </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 bg-accent-mint/20 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent-mint" />
                    </div>
                    <span className="text-text-secondary">
                      No seed phrases or private keys
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 bg-accent-mint/20 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent-mint" />
                    </div>
                    <span className="text-text-secondary">
                      Secure biometric authentication
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 bg-accent-mint/20 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent-mint" />
                    </div>
                    <span className="text-text-secondary">
                      Cross-device synchronization
                    </span>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-accent-mint to-accent-teal hover:from-accent-mint/90 hover:to-accent-teal/90 text-black font-semibold rounded-xl transition-all duration-300 group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Globe className="w-5 h-5" />
                      <span>Login with Internet Identity</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>

                {/* Security Note */}
                <div className="mt-6 p-4 bg-bg-tertiary/50 rounded-xl border border-white/5">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-accent-yellow flex-shrink-0" />
                    <div className="text-xs text-text-secondary">
                      <p className="font-semibold text-text-primary mb-1">
                        Bank-grade Security
                      </p>
                      <p>
                        Internet Identity uses WebAuthn for secure
                        authentication without passwords. Your identity is
                        cryptographically secured on the Internet Computer
                        blockchain.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Links */}
                <div className="mt-6 text-center text-sm text-text-secondary">
                  <p>
                    New to Internet Identity?{" "}
                    <a
                      href="https://identity.ic0.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-mint hover:underline"
                    >
                      Create one here
                    </a>
                  </p>
                </div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-8 flex items-center justify-center gap-2 text-sm text-text-secondary"
              >
                <Sparkles className="w-4 h-4 text-accent-yellow" />
                <span>Powered by Internet Computer Protocol</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return <div className={cn("", className)}>{children}</div>;
};
