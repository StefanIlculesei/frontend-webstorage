"use client";

import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getAllPlans,
  getCurrentSubscription,
  upgradeSubscription,
  downgradeSubscription,
  createSubscription,
} from "@/lib/api/plans";
import { PlanComparison } from "@/components/subscription/PlanComparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Subscription } from "@/types";
import { toast } from "sonner";
import { AlertTriangle, Loader2, CreditCard } from "lucide-react";

export default function PlansPage(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams?.get("action") || "choose"; // 'choose', 'upgrade', 'downgrade'

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null);

  // Fetch all plans
  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ["plans", "all"],
    queryFn: getAllPlans,
    retry: 1,
  });

  // Fetch current subscription - not required for "choose" action (initial signup)
  const {
    data: currentSubscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: getCurrentSubscription,
    retry: 1,
    enabled: action !== "choose", // Don't fetch subscription for initial plan selection
  });

  // Check if error is actionable for choose action
  const isNoSubscriptionError =
    subscriptionError instanceof Error &&
    subscriptionError.message.includes("NO_ACTIVE_SUBSCRIPTION");

  const handleSelectPlan = useCallback(
    (planId: number) => {
      // For "choose" action, no current subscription is needed
      if (action !== "choose" && !currentSubscription) {
        toast.error("Unable to determine current subscription");
        return;
      }

      // If we have a current subscription, check if same plan
      if (currentSubscription && currentSubscription.planId === planId) {
        toast.info("You are already on this plan");
        return;
      }

      const currentPlan = currentSubscription
        ? plans?.find((p) => p.id === currentSubscription.planId)
        : undefined;
      const selectedPlan = plans?.find((p) => p.id === planId);

      // Validate plan selection matches action (only if we have a current plan)
      if (
        action === "upgrade" &&
        currentPlan &&
        selectedPlan &&
        selectedPlan.monthlyPrice <= currentPlan.monthlyPrice
      ) {
        toast.error("Can only upgrade to a plan with higher price");
        return;
      }

      if (
        action === "downgrade" &&
        currentPlan &&
        selectedPlan &&
        selectedPlan.monthlyPrice >= currentPlan.monthlyPrice
      ) {
        toast.error("Can only downgrade to a plan with lower price");
        return;
      }

      // Show payment dialog instead of processing immediately
      setPendingPlanId(planId);
      setShowPaymentDialog(true);
    },
    [action, currentSubscription, plans]
  );

  const handleConfirmPayment = useCallback(async () => {
    // For "choose" action, we don't need a current subscription
    if (action !== "choose" && !currentSubscription) {
      return;
    }

    if (pendingPlanId === null) {
      return;
    }

    setIsProcessingPayment(true);

    // Simulate payment processing for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsProcessingPayment(false);
    setShowPaymentDialog(false);

    setIsProcessing(true);
    try {
      if (action === "choose" && !currentSubscription) {
        // Initial plan selection (no current subscription)
        await createSubscription({ planId: pendingPlanId });
        toast.success("Plan selected successfully!");
      } else if (action === "upgrade") {
        await upgradeSubscription(pendingPlanId);
        toast.success("Plan upgraded successfully!");
      } else if (action === "downgrade") {
        await downgradeSubscription(pendingPlanId);
        toast.success("Plan downgraded successfully!");
      } else if (action === "choose" && currentSubscription) {
        // Fallback: if we somehow have current subscription in choose mode
        const currentPlan = plans?.find(
          (p) => p.id === currentSubscription.planId
        );
        const selectedPlan = plans?.find((p) => p.id === pendingPlanId);

        if (currentPlan && selectedPlan) {
          if (selectedPlan.monthlyPrice > currentPlan.monthlyPrice) {
            await upgradeSubscription(pendingPlanId);
            toast.success("Plan upgraded successfully!");
          } else if (selectedPlan.monthlyPrice < currentPlan.monthlyPrice) {
            await downgradeSubscription(pendingPlanId);
            toast.success("Plan downgraded successfully!");
          } else {
            toast.info("Selected plan has same price");
          }
        }
      }

      // Redirect back to subscription page
      setTimeout(() => router.push("/dashboard/subscription"), 1500);
    } catch (error) {
      let errorMessage = "Failed to change plan";

      // Handle actionable errors from backend
      if (error instanceof Error) {
        const errorText = error.message;
        if (errorText.includes("SUBSCRIPTION_EXPIRED")) {
          errorMessage =
            "Your subscription has expired. Please renew your current plan before upgrading.";
        } else {
          errorMessage = errorText;
        }
      }

      toast.error(errorMessage);
      console.error("Plan change error:", error);
    } finally {
      setIsProcessing(false);
      setPendingPlanId(null);
    }
  }, [action, currentSubscription, plans, router, pendingPlanId]);

  // Filter plans based on action
  const getFilteredPlans = () => {
    if (!plans) return [];

    // For "choose" action or no current subscription, show all plans
    if (action === "choose" || !currentSubscription) {
      return plans;
    }

    const currentPlan = plans.find((p) => p.id === currentSubscription.planId);
    if (!currentPlan) return plans;

    if (action === "upgrade") {
      // Show only plans more expensive than current
      return plans.filter((p) => p.monthlyPrice > currentPlan.monthlyPrice);
    } else if (action === "downgrade") {
      // Show only plans cheaper than current
      return plans.filter((p) => p.monthlyPrice < currentPlan.monthlyPrice);
    }

    // Show all plans for "choose" action
    return plans;
  };

  const filteredPlans = getFilteredPlans();

  // Only consider loading/error if needed for the current action
  const isLoading =
    action === "choose" ? plansLoading : plansLoading || subscriptionLoading;
  const hasError =
    action === "choose" ? plansError : plansError || subscriptionError;

  const actionTitle = {
    upgrade: "Upgrade Your Plan",
    downgrade: "Downgrade Your Plan",
    choose: "Choose Your Plan",
  }[action];

  const actionDescription = {
    upgrade: "Select a plan with more features and storage",
    downgrade: "Select a plan with fewer features and lower cost",
    choose: "Select the plan that best fits your needs",
  }[action];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{actionTitle}</h1>
        <p className="text-sm text-muted-foreground">{actionDescription}</p>
      </div>

      {/* Error State */}
      {hasError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">
                  Unable to Load Plans
                </h3>
                <p className="mt-1 text-sm text-destructive/80">
                  Please check your connection and try again.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading plans...</span>
            </div>
          </CardContent>
        </Card>
      ) : plans && plans.length > 0 ? (
        <>
          {filteredPlans.length > 0 ? (
            <>
              {/* Plan Comparison */}
              <PlanComparison
                plans={filteredPlans}
                currentSubscription={currentSubscription}
                onSelectPlan={handleSelectPlan}
                buttonLabel={
                  action === "upgrade"
                    ? "Upgrade"
                    : action === "downgrade"
                    ? "Downgrade"
                    : "Choose"
                }
                buttonVariant={action === "upgrade" ? "default" : "outline"}
              />
            </>
          ) : (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-semibold text-amber-900">
                    {action === "upgrade"
                      ? "No Plans Available to Upgrade"
                      : action === "downgrade"
                      ? "No Plans Available to Downgrade"
                      : "No Plans Available"}
                  </p>
                  <p className="mt-2 text-sm text-amber-800">
                    {action === "upgrade"
                      ? "You are already on the highest tier plan."
                      : action === "downgrade"
                      ? "You are already on the lowest tier plan."
                      : "Please try again later."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Info */}
          {currentSubscription && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Current plan:{" "}
                  <strong>{currentSubscription.plan?.name}</strong>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Changes take effect immediately. Your billing will be adjusted
                  accordingly.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Back Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/subscription")}
            >
              Back to Subscription
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground">
              No plans available
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-blue-100 p-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">
              Confirm Payment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Pay with your credit card to upgrade your plan
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex gap-3">
            <AlertDialogCancel
              disabled={isProcessingPayment}
              className="flex-1"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPayment}
              disabled={isProcessingPayment}
              className="flex-1"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
