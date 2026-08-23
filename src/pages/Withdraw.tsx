import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign, Radio, AlertCircle, Trophy, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ImportantPaymentNotice from "@/components/ImportantPaymentNotice";
import CountdownTimer from "@/components/CountdownTimer";

const Withdraw = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalTier, setWithdrawalTier] = useState<"light" | "standard">("light");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);
  const [pendingWithdrawalId, setPendingWithdrawalId] = useState<string | null>(null);
  const [activeWithdrawal, setActiveWithdrawal] = useState<any | null>(null);
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
  });
  const [walletSaved, setWalletSaved] = useState(false);
  const [walletLoaded, setWalletLoaded] = useState(false);

  const nigerianBanks = [
    "Access Bank", "Citibank", "Ecobank", "FCMB", "Fidelity Bank",
    "First Bank", "GTBank", "Heritage Bank", "Keystone Bank", "Kuda Bank",
    "Opay", "Palmpay", "Polaris Bank", "Providus Bank", "Stanbic IBTC",
    "Standard Chartered", "Sterling Bank", "SunTrust Bank", "UBA", "Union Bank",
    "Unity Bank", "Wema Bank", "Zenith Bank", "Moniepoint MFB", "VFD MFB"
  ].sort();

  // Tier-specific settings
  const tiers = {
    light: { minAmount: 150000, requiredReferrals: 5, name: "Light (Quick)" },
    standard: { minAmount: 150000, requiredReferrals: 0, name: "Standard (Premium)" }
  };

  // Task earnings requirement (must earn ₦75,000 via tasks to withdraw)
  const TASK_EARNINGS_REQUIRED = 75000;
  const taskProgress = Number(profile?.task_progress ?? 0);
  const taskCompleted = profile?.task_completed ?? taskProgress >= TASK_EARNINGS_REQUIRED;
  const taskPct = Math.max(0, Math.min(100, Math.round((taskProgress / TASK_EARNINGS_REQUIRED) * 100)));
  const taskRemaining = Math.max(0, TASK_EARNINGS_REQUIRED - taskProgress);
  const isTaskEligible = taskProgress >= TASK_EARNINGS_REQUIRED;

  const handleStartCountdown = async (withdrawalId?: string) => {
    const id = withdrawalId || pendingWithdrawalId;
    if (!id) return toast.error('No withdrawal selected');
    // Block if task earnings not yet reached
    if (!isTaskEligible) {
      toast.error(`You need to earn ₦${TASK_EARNINGS_REQUIRED.toLocaleString()} through tasks to withdraw. You have ₦${taskProgress.toLocaleString()} — ₦${taskRemaining.toLocaleString()} more to go.`);
      return;
    }
    setSubmitting(true);
    try {
      // call start-withdrawal endpoint
      const r = await fetch('/api/start-withdrawal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ withdrawal_id: id }) });
      const j = await r.json();
      if (!j.success) throw new Error(j.error || 'Failed to start countdown');
      toast.success('24-hour countdown started');
      // reload profile and active withdrawal
      await loadProfile();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start countdown');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const savedWallet = localStorage.getItem("walletDetails");
    if (savedWallet) {
      try {
        const parsed = JSON.parse(savedWallet);
        const hasSavedWallet =
          Boolean(parsed.accountName) &&
          Boolean(parsed.accountNumber) &&
          Boolean(parsed.bankName);

        if (hasSavedWallet) {
          setWalletSaved(true);
          setWithdrawData((prev) => ({
            ...prev,
            accountName: parsed.accountName,
            accountNumber: parsed.accountNumber,
            bankName: parsed.bankName,
          }));
        } else {
          setWalletSaved(false);
        }
      } catch (error) {
        console.warn("Failed to load saved wallet details", error);
        setWalletSaved(false);
      }
    } else {
      setWalletSaved(false);
    }

    setWalletLoaded(true);
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      // load active withdrawal (processing_24h or awaiting_admin_approval)
      const { data: wdata } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['processing_24h','awaiting_admin_approval'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (wdata) setActiveWithdrawal(wdata);
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletSaved) {
      toast.error("Please set your withdrawal account first.");
      return;
    }

    const tier = tiers[withdrawalTier];
    const amount = Math.floor(Number(withdrawData.amount));
    
    // Validate whole numbers only (Naira)
    if (!Number.isInteger(Number(withdrawData.amount)) || withdrawData.amount.includes('.')) {
      toast.error("Please enter whole numbers only (no decimals). Amount must be in Naira (₦).");
      return;
    }

    if (amount < 1) {
      toast.error("Amount must be at least ₦1");
      return;
    }
    
    if (amount < tier.minAmount) {
      toast.error(`Minimum withdrawal for ${tier.name} is ₦${tier.minAmount.toLocaleString()}`);
      return;
    }

    if (amount > profile.balance) {
      toast.error("Insufficient balance");
      return;
    }

    // Check referral requirement
    if (profile.total_referrals < tier.requiredReferrals) {
      toast.error(`You need at least ${tier.requiredReferrals} referrals for ${tier.name}`);
      return;
    }

    // Check task earnings requirement - must have earned ₦75,000 via tasks
    if (taskProgress < TASK_EARNINGS_REQUIRED) {
      toast.error(`You need to earn ₦${TASK_EARNINGS_REQUIRED.toLocaleString()} through tasks to withdraw. You have ₦${taskProgress.toLocaleString()} — ₦${taskRemaining.toLocaleString()} more to go. Complete tasks to unlock withdrawals.`);
      return;
    }

    // If Standard tier, show upgrade modal instead of processing
    if (withdrawalTier === "standard") {
      setShowUpgradeModal(true);
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // create withdrawal draft
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: session?.user.id,
          amount,
          account_name: withdrawData.accountName,
          account_number: withdrawData.accountNumber,
          bank_name: withdrawData.bankName,
          type: withdrawalTier,
          status: 'pending_requirements',
        })
        .select()
        .maybeSingle();

      if (withdrawalError) throw withdrawalError;

      // Store withdrawal ID — user can start 24h countdown when ready
      setPendingWithdrawalId(withdrawal.id);
      toast.success('Draft withdrawal created. Click "Request Withdrawal" to start 24-hour processing once ready.');
    } catch (error: any) {
      toast.error("Failed to submit withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentNoticeConfirm = () => {
    // Navigate to withdrawal activation page with the withdrawal ID
    setShowPaymentNotice(false);
    navigate("/withdrawal-activation", { state: { withdrawalId: pendingWithdrawalId } });
    setPendingWithdrawalId(null);
  };

  // Auto-dismiss upgrade modal after 6 seconds when opened
  useEffect(() => {
    if (!showUpgradeModal) return;
    const t = setTimeout(() => setShowUpgradeModal(false), 6000);
    return () => clearTimeout(t);
  }, [showUpgradeModal]);

  return (
    <div className="min-h-screen liquid-bg pb-20">
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {!loading && profile && (
        <>
      {/* PAYMENT NOTICE MODAL - Light Withdrawal */}
      {showPaymentNotice && (
        <ImportantPaymentNotice
          onConfirm={handlePaymentNoticeConfirm}
          onClose={() => setShowPaymentNotice(false)}
        />
      )}

      {/* UPGRADE MODAL - Standard Withdrawal Upgrade Prompt */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-full flex items-center justify-center">
                <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm text-gray-800 dark:text-white">
                    Upgrade Required
                  </h4>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
                  >
                    ×
                  </button>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  Upgrade your account to access standard withdrawals without referral requirements
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      navigate("/upgrade");
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs py-1.5 h-8"
                  >
                    Upgrade
                  </Button>
                  
                  <Button
                    onClick={() => setShowUpgradeModal(false)}
                    variant="outline"
                    className="flex-1 text-gray-600 dark:text-gray-400 text-xs py-1.5 h-8 border-gray-300 dark:border-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-primary-foreground hover:bg-background/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Withdraw Funds</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 p-6">
          <div className="flex items-center justify-between mb-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-primary">₦{Number(profile.balance).toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-secondary" />
          </div>

          {/* Task Earnings Requirement - Must earn ₦75,000 via tasks to withdraw */}
          <div className={`mb-6 rounded-xl border p-4 ${isTaskEligible ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30' : 'bg-muted/50 border-border/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isTaskEligible ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary'}`}>
                  {isTaskEligible ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">Task Earnings Requirement</p>
                  <p className="text-xs text-muted-foreground mt-1">Earn through tasks to unlock withdrawals</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isTaskEligible ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                {taskPct}%
              </span>
            </div>

            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-sm font-extrabold ${isTaskEligible ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>₦{taskProgress.toLocaleString()}</span>
              <span className="text-xs font-semibold text-muted-foreground">/ ₦{TASK_EARNINGS_REQUIRED.toLocaleString()}</span>
            </div>

            <div className="h-3 bg-background/60 rounded-full overflow-hidden border border-border/30">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${taskPct}%`,
                  transition: 'width 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                  background: isTaskEligible
                    ? 'linear-gradient(90deg, #12b886, #16a34a)'
                    : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                  boxShadow: isTaskEligible
                    ? '0 0 10px rgba(18,184,134,0.5)'
                    : '0 0 10px rgba(124,58,237,0.4)',
                }}
              />
            </div>

            <div className="flex justify-between items-center mt-2">
              <p className={`text-xs font-medium ${isTaskEligible ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                {isTaskEligible
                  ? '✅ Eligible to withdraw — requirement met!'
                  : `₦${taskRemaining.toLocaleString()} more to unlock withdrawals`}
              </p>
              {isTaskEligible && <span className="text-xs text-green-600 dark:text-green-400 font-bold">✓ Unlocked</span>}
            </div>

            {!isTaskEligible && (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/tasks")}
                className="w-full mt-3 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground text-sm h-9"
              >
                Complete Tasks to Earn ₦{taskRemaining.toLocaleString()} More
              </Button>
            )}
          </div>

          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <Label className="text-base font-semibold mb-3 block">Choose Withdrawal Type</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWithdrawalTier("light")}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  withdrawalTier === "light"
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card/50 hover:border-primary/50"
                }`}
              >
                <p className="font-semibold text-sm">⚡ Light</p>
                <p className="text-xs text-muted-foreground">₦150,000+ • 5 referrals</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWithdrawalTier("standard");
                  setShowUpgradeModal(true);
                }}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  withdrawalTier === "standard"
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card/50 hover:border-primary/50"
                }`}
              >
                <p className="font-semibold text-sm">💯 Standard</p>
                <p className="text-xs text-muted-foreground">₦150,000+ • No referrals</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (₦) (Min: ₦{tiers[withdrawalTier].minAmount.toLocaleString()})
              </Label>
              <Input
                id="amount"
                type="number"
                required
                step="1"
                min={tiers[withdrawalTier].minAmount}
                max={Math.floor(profile.balance)}
                value={withdrawData.amount}
                onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                placeholder="Enter amount (whole numbers only)"
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">Enter whole numbers only. No decimals allowed.</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Withdrawal Destination</p>
              {walletSaved ? (
                <>
                  <div className="rounded-3xl border border-border/50 bg-muted/50 p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Account / Wallet Name</p>
                      <p className="text-lg font-semibold">{withdrawData.accountName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Account / Wallet Number</p>
                      <p className="text-lg font-semibold font-mono">{withdrawData.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bank / Wallet Provider</p>
                      <p className="text-lg font-semibold">{withdrawData.bankName}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wallet details can only be changed on the Wallet page.
                  </p>
                </>
              ) : (
                <>
                  <div className="rounded-3xl border border-border/50 bg-muted/50 p-4">
                    <p className="text-lg font-semibold text-muted-foreground">Account not set</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => navigate("/wallet")}
                    className="w-full"
                    variant="outline"
                  >
                    Set Withdrawal Account
                  </Button>
                </>
              )}
            </div>

            {!isTaskEligible && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs leading-relaxed">
                  Withdrawals are locked until you earn <span className="font-bold">₦{TASK_EARNINGS_REQUIRED.toLocaleString()}</span> through tasks. You have <span className="font-bold">₦{taskProgress.toLocaleString()}</span> — earn <span className="font-bold">₦{taskRemaining.toLocaleString()}</span> more to unlock.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className={`w-full ${!isTaskEligible ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary'}`}
              disabled={submitting || !walletSaved || !isTaskEligible}
            >
              {!isTaskEligible
                ? `Locked — Earn ₦${taskRemaining.toLocaleString()} More via Tasks`
                : submitting ? "Submitting..." : "Submit Withdrawal"}
            </Button>

            {/* If draft exists, allow starting countdown when requirements are met */}
            {pendingWithdrawalId && !activeWithdrawal && (
              <Button
                type="button"
                className={`w-full mt-2 ${!isTaskEligible ? 'bg-muted text-muted-foreground' : ''}`}
                onClick={() => handleStartCountdown(pendingWithdrawalId)}
                disabled={submitting || !isTaskEligible}
              >
                {!isTaskEligible
                  ? `Locked — Need ₦${taskRemaining.toLocaleString()} More Task Earnings`
                  : submitting ? 'Starting...' : 'Request Withdrawal (Start 24h Countdown)'}
              </Button>
            )}
          </form>
        </Card>
      </div>

      <FloatingActionButton />
        </>
      )}
    </div>
  );
};

export default Withdraw;
