"use client";

import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSubscription, getAllPlans } from "@/lib/api/plans";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { SubscriptionActions } from "@/components/subscription/SubscriptionActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plan, Subscription } from "@/types";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionPage(): ReactElement {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch current subscription
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ["subscription", "current", refreshKey],
    queryFn: getCurrentSubscription,
    retry: 1,
  });

  // Fetch all plans for comparison
  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ["plans", "all"],
    queryFn: getAllPlans,
    retry: 1,
  });

  const handleSubscriptionUpdated = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    refetchSubscription();
  }, [refetchSubscription]);

  const handleRefresh = async () => {
    await refetchSubscription();
    toast.success("Subscription updated");
  };

  // Check if error is "no subscription" (actionable error)
  const isNoSubscriptionError =
    subscriptionError instanceof Error &&
    subscriptionError.message.includes("NO_ACTIVE_SUBSCRIPTION");

  if (subscriptionError && !isNoSubscriptionError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Subscription Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription plan and billing
          </p>
        </div>

        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-destructive">
                Unable to Load Subscription
              </h3>
              <p className="mt-1 text-sm text-destructive/80">
                {subscriptionError instanceof Error
                  ? subscriptionError.message
                  : "An error occurred while loading your subscription"}
              </p>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscription Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your subscription plan and billing
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={subscriptionLoading}
        >
          <RefreshCw
            className={`h-4 w-4 ${subscriptionLoading ? "animate-spin" : ""}`}
          />
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {/* No Subscription - Show onboarding */}
      {!subscription &&
      !subscriptionLoading &&
      (isNoSubscriptionError || !subscription) ? (
        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  Get Started with WebStorage
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose a subscription plan to start storing your files
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Plans Grid for New Users */}
          {plansLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                  <span>Loading plans...</span>
                </div>
              </CardContent>
            </Card>
          ) : plans && plans.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Choose Your Plan</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                  <Card key={plan.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {plan.description || "Premium features"}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <div className="mb-6">
                        <div className="text-3xl font-bold">
                          ${plan.monthlyPrice}
                          <span className="text-lg font-normal text-muted-foreground">
                            /month
                          </span>
                        </div>
                      </div>

                      <div className="mb-6 space-y-2 flex-1 text-sm">
                        <div>
                          ✓ {(plan.limitSize / (1024 * 1024 * 1024)).toFixed(0)}{" "}
                          GB Storage
                        </div>
                        <div>
                          ✓ {(plan.maxFileSize / (1024 * 1024)).toFixed(0)} MB
                          Max File Size
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          // Navigate to plans page with action
                          window.location.href =
                            "/dashboard/plans?action=choose";
                        }}
                        className="w-full"
                      >
                        Select Plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-muted-foreground">
                  No plans available at the moment
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // Existing subscription view
        <>
          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Status and Actions */}
            <div className="space-y-6 lg:col-span-2">
              <SubscriptionStatus
                subscription={subscription || null}
                isLoading={subscriptionLoading}
              />
              <SubscriptionActions
                subscription={subscription || null}
                onSubscriptionUpdated={handleSubscriptionUpdated}
              />
            </div>

            {/* Right Column - Plan Comparison Preview */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Plans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plansLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-12 animate-pulse rounded bg-muted"
                        />
                      ))}
                    </div>
                  ) : plansError ? (
                    <p className="text-xs text-muted-foreground">
                      Unable to load plans
                    </p>
                  ) : plans && plans.length > 0 ? (
                    <div className="space-y-2">
                      {plans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`rounded-lg border p-3 text-sm transition-colors ${
                            subscription?.planId === plan.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{plan.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(
                                  plan.limitSize /
                                  (1024 * 1024 * 1024)
                                ).toFixed(0)}{" "}
                                GB storage
                              </p>
                            </div>
                            {subscription?.planId === plan.id && (
                              <span className="text-xs font-semibold text-primary">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-xs font-semibold">
                            ${plan.monthlyPrice}{" "}
                            <span className="font-normal text-muted-foreground">
                              /month
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No plans available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Billing Info Card */}
              {subscription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Billing Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Billing Cycle
                      </p>
                      <p className="font-medium">Monthly</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Next Billing Date
                      </p>
                      <p className="font-medium">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2 text-xs text-blue-900">
                      💳 Billing handled securely by our payment provider
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-medium">Can I change my plan anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes take effect immediately.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">
                  What happens when my subscription expires?
                </h4>
                <p className="text-sm text-muted-foreground">
                  You'll lose access to premium features. You can renew your
                  subscription anytime to restore access.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Is there a refund policy?</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 7-day money-back guarantee. Contact support within
                  7 days of your purchase for a refund.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">How can I contact support?</h4>
                <p className="text-sm text-muted-foreground">
                  Email us at support@webstorage.com or use the chat feature on
                  our website.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
