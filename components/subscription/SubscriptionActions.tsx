"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  cancelSubscription,
  renewSubscription,
  upgradeSubscription,
  downgradeSubscription,
} from "@/lib/api/plans";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface SubscriptionActionsProps {
  subscription: Subscription | null;
  onSubscriptionUpdated?: () => void;
}

export function SubscriptionActions({
  subscription,
  onSubscriptionUpdated,
}: SubscriptionActionsProps): ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);

  const isExpired = subscription
    ? new Date(subscription.endDate) < new Date()
    : false;
  const isCanceled = subscription?.status === "canceled";

  const handleUpgrade = () => {
    router.push("/dashboard/plans?action=upgrade");
  };

  const handleDowngrade = () => {
    router.push("/dashboard/plans?action=downgrade");
  };

  const handleRenew = async () => {
    setIsLoading(true);
    try {
      await renewSubscription();
      toast.success("Subscription renewed successfully!");
      setShowRenewDialog(false);
      onSubscriptionUpdated?.();
    } catch (error) {
      toast.error("Failed to renew subscription. Please try again.");
      console.error("Renew error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription();
      toast.success("Subscription canceled successfully");
      setShowCancelDialog(false);
      onSubscriptionUpdated?.();
    } catch (error) {
      toast.error("Failed to cancel subscription. Please try again.");
      console.error("Cancel error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push("/dashboard/plans")}
            className="w-full"
          >
            Choose a Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isExpired && subscription.status === "expired" && (
            <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-600" />
              <p className="text-yellow-800">
                Your subscription has expired. Renew now to restore access.
              </p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {isExpired ? (
              <>
                <Button
                  onClick={() => setShowRenewDialog(true)}
                  className="w-full"
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Renewing...
                    </>
                  ) : (
                    "Renew Subscription"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  size="sm"
                  className="w-full"
                >
                  Choose Different Plan
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleUpgrade}
                  disabled={isLoading || isCanceled}
                  size="sm"
                  className="w-full"
                >
                  Upgrade Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDowngrade}
                  disabled={isLoading || isCanceled}
                  size="sm"
                  className="w-full"
                >
                  Downgrade Plan
                </Button>
              </>
            )}
          </div>

          <Button
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
            disabled={isLoading || isCanceled}
            className="w-full"
            size="sm"
          >
            Cancel Subscription
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately end your subscription. You'll lose access to
              premium features after today. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <strong>Warning:</strong> Upload functionality will be disabled
            immediately.
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel disabled={isLoading}>
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Renew Confirmation Dialog */}
      <AlertDialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renew Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Renew your {subscription?.plan?.name} plan to continue using
              premium features. Your subscription will be extended for another
              billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {subscription?.plan && (
            <div className="rounded-lg border bg-muted/50 p-3 text-sm">
              <div className="flex justify-between">
                <span>Plan: {subscription.plan.name}</span>
                <span className="font-semibold">
                  ${subscription.plan.monthlyPrice.toFixed(2)}/month
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRenew} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renewing...
                </>
              ) : (
                "Confirm Renewal"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
