import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Smartphone, 
  Key,
  Database,
  AlertCircle,
  Check,
  X
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/providers/auth-provider";
import { useActors } from "@/hooks/useActors";

function formatDate(ms: number) {
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "—";
  }
}

export function Settings() {
  const { identity, isAuthenticated } = useAuth();
  const principalText = identity?.getPrincipal().toText() ?? "Not signed in";
  const { mainCanister } = useActors();

  const [btcAddress, setBtcAddress] = useState<string>("");
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [activityStats, setActivityStats] = useState({
    total: 0,
    last: "—",
    ageDays: "—",
  });
  const [portfolio, setPortfolio] = useState<{ ckbtc: bigint; ckusdc: bigint; total_usd_e8s: bigint } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!identity) return;
      try {
        setLoadingAddr(true);
        // BTC deposit address (per principal)
        const addr = await (mainCanister as any).getBtcAddress([identity.getPrincipal()], []);
        setBtcAddress(addr || "");
      } catch (e) {
        setBtcAddress("");
      } finally {
        setLoadingAddr(false);
      }

      try {
        // Activity for stats
        const acts = await (mainCanister as any).getActivity(identity.getPrincipal());
        const total = Array.isArray(acts) ? acts.length : 0;
        let last = "—";
        let ageDays = "—";
        if (total > 0) {
          // activities are prepended newest-first in backend
          const newest = acts[0];
          const oldest = acts[acts.length - 1];
          const newestMs = Number(newest.time) / 1_000_000;
          const oldestMs = Number(oldest.time) / 1_000_000;
          last = formatDate(newestMs);
          const days = Math.max(0, Math.floor((Date.now() - oldestMs) / (1000 * 60 * 60 * 24)));
          ageDays = `${days} day${days === 1 ? "" : "s"}`;
        }
        setActivityStats({ total, last, ageDays });
      } catch {
        setActivityStats({ total: 0, last: "—", ageDays: "—" });
      }

      try {
        const p = await (mainCanister as any).getPortfolio(identity.getPrincipal());
        setPortfolio(p);
      } catch {}
    };
    load();
  }, [identity, mainCanister]);

  const usdFormatted = useMemo(() => {
    if (!portfolio) return "—";
    return `$${(Number(portfolio.total_usd_e8s) / 1e8).toFixed(2)}`;
  }, [portfolio]);
  const [notifications, setNotifications] = useState({
    deposits: true,
    borrows: true,
    repayments: true,
    priceAlerts: false,
    marketUpdates: true,
    security: true
  });

  const [privacy, setPrivacy] = useState({
    showBalance: true,
    showTransactions: true,
    analyticsData: false,
    marketingEmails: false
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="heading-xl text-text-primary mb-2">Settings</h1>
        <p className="body-regular text-text-secondary">
          Manage your account preferences and application settings
        </p>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="card-container">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-accent-mint" />
                <h2 className="heading-medium text-text-primary">Account Information</h2>
              </div>

              <div className="space-y-6">
                {/* Internet Identity / Principal */}
                <div>
                  <Label className="body-small text-text-secondary mb-2 block">
                    Principal (Internet Identity)
                  </Label>
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                    <div>
                      <p className="body-regular text-text-primary font-mono">
                        {principalText}
                      </p>
                      <p className="body-tiny text-text-muted">
                        {isAuthenticated ? "Connected via Internet Identity" : "Not signed in"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAuthenticated ? (
                        <>
                          <Check className="w-4 h-4 text-semantic-positive" />
                          <span className="body-tiny text-semantic-positive">Verified</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-semantic-negative" />
                          <span className="body-tiny text-semantic-negative">Disconnected</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* BTC Deposit Address */}
                <div>
                  <Label className="body-small text-text-secondary mb-2 block">
                    BTC Deposit Address
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input value={loadingAddr ? "Loading..." : btcAddress || "—"} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => btcAddress && navigator.clipboard.writeText(btcAddress)}
                      disabled={!btcAddress}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card-mini">
                    <p className="body-tiny text-text-muted mb-1">Account Age</p>
                    <p className="body-regular font-semibold text-text-primary">{activityStats.ageDays}</p>
                  </div>
                  <div className="card-mini">
                    <p className="body-tiny text-text-muted mb-1">Total Transactions</p>
                    <p className="body-regular font-semibold text-text-primary">{activityStats.total}</p>
                  </div>
                  <div className="card-mini">
                    <p className="body-tiny text-text-muted mb-1">Last Activity</p>
                    <p className="body-regular font-semibold text-text-primary">{activityStats.last}</p>
                  </div>
                </div>

                {/* Portfolio Snapshot */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card-mini">
                    <p className="body-tiny text-text-muted mb-1">ckBTC</p>
                    <p className="body-regular font-semibold text-text-primary">
                      {portfolio ? (Number(portfolio.ckbtc) / 1e8).toFixed(8) : "—"}
                    </p>
                  </div>
                  <div className="card-mini">
                    <p className="body-tiny text-text-muted mb-1">ckUSDC</p>
                    <p className="body-regular font-semibold text-text-primary">
                      {portfolio ? (Number(portfolio.ckusdc) / 1e6).toFixed(2) : "—"}
                    </p>
                  </div>
                  <div className="card-mini">
                    <p className="body-tiny text-text-muted mb-1">Total (USD)</p>
                    <p className="body-regular font-semibold text-text-primary">{usdFormatted}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="card-container">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-accent-mint" />
                <h2 className="heading-medium text-text-primary">Security Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Authentication */}
                <div>
                  <h3 className="heading-small text-text-primary mb-4">Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-accent-mint" />
                        <div>
                          <p className="body-regular text-text-primary">Internet Identity</p>
                          <p className="body-tiny text-text-muted">Secure biometric authentication</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-semantic-positive" />
                        <span className="body-tiny text-semantic-positive">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Controls */}
                <div>
                  <h3 className="heading-small text-text-primary mb-4">Privacy Controls</h3>
                  <div className="space-y-4">
                    {Object.entries(privacy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label className="body-regular text-text-primary capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <p className="body-tiny text-text-muted">
                            {key === 'showBalance' && 'Display account balance in interface'}
                            {key === 'showTransactions' && 'Show transaction history'}
                            {key === 'analyticsData' && 'Share anonymous usage data'}
                            {key === 'marketingEmails' && 'Receive promotional emails'}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            setPrivacy(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Alerts */}
                <div className="card-mini border-l-4 border-l-semantic-warning">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-semantic-warning mt-0.5" />
                    <div>
                      <p className="body-regular text-text-primary mb-1">Security Recommendation</p>
                      <p className="body-small text-text-secondary">
                        Consider enabling all privacy controls for maximum security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="card-container">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-accent-mint" />
                <h2 className="heading-medium text-text-primary">Notification Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Transaction Notifications */}
                <div>
                  <h3 className="heading-small text-text-primary mb-4">Transaction Notifications</h3>
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label className="body-regular text-text-primary capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <p className="body-tiny text-text-muted">
                            {key === 'deposits' && 'Get notified when deposits are confirmed'}
                            {key === 'borrows' && 'Notifications for new loan positions'}
                            {key === 'repayments' && 'Alerts for loan repayments and interest'}
                            {key === 'priceAlerts' && 'Price movement notifications'}
                            {key === 'marketUpdates' && 'Market news and protocol updates'}
                            {key === 'security' && 'Security-related alerts and warnings'}
                          </p>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) =>
                            setNotifications(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="card-container">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 text-accent-mint" />
                <h2 className="heading-medium text-text-primary">Application Preferences</h2>
              </div>

              <div className="space-y-6">
                {/* Theme Settings */}
                <div>
                  <h3 className="heading-small text-text-primary mb-4">Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="body-regular text-text-primary">Dark Theme</Label>
                        <p className="body-tiny text-text-muted">Use dark interface theme</p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                  </div>
                </div>

                {/* Language & Region */}
                <div>
                  <h3 className="heading-small text-text-primary mb-4">Language & Region</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="body-small text-text-secondary mb-2 block">Language</Label>
                      <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                        <Globe className="w-4 h-4 text-accent-mint" />
                        <span className="body-regular text-text-primary">English (US)</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="body-small text-text-secondary mb-2 block">Currency Display</Label>
                      <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                        <Database className="w-4 h-4 text-accent-mint" />
                        <span className="body-regular text-text-primary">USD ($)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div>
                  <h3 className="heading-small text-text-primary mb-4">Advanced</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="body-regular text-text-primary">Developer Mode</Label>
                        <p className="body-tiny text-text-muted">Enable advanced debugging features</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="body-regular text-text-primary">Auto-refresh Data</Label>
                        <p className="body-tiny text-text-muted">Automatically refresh market data every 30 seconds</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reset Settings */}
            <Card className="card-container border-destructive/20">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h3 className="heading-small text-text-primary">Reset Settings</h3>
              </div>
              <p className="body-small text-text-secondary mb-4">
                Reset all settings to default values. This action cannot be undone.
              </p>
              <Button variant="destructive" size="sm">
                Reset All Settings
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
