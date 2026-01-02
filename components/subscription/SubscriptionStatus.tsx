"use client";

import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Subscription } from "@/types";
import { formatDate } from "@/lib/utils/format";

interface SubscriptionStatusProps {
  subscription: Subscription | null;
  isLoading?: boolean;
}

export function SubscriptionStatus({
  subscription,
  isLoading,
}: SubscriptionStatusProps): ReactElement {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              No active subscription found
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Subscribe to a plan to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isExpired = new Date(subscription.endDate) < new Date();
  const endDate = new Date(subscription.endDate);
  const daysRemaining = Math.ceil(
    (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusConfig = {
    active: { label: "Active", variant: "default" as const },
    expired: { label: "Expired", variant: "destructive" as const },
    canceled: { label: "Canceled", variant: "secondary" as const },
    trialing: { label: "Trial", variant: "outline" as const },
  };

  const config = statusConfig[subscription.status] || {
    label: "Unknown",
    variant: "outline" as const,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Subscription</span>
          <Badge variant={config.variant}>{config.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isExpired && (
          <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <div>
              <p className="text-sm font-semibold text-destructive">
                Subscription Expired
              </p>
              <p className="mt-1 text-xs text-destructive/90">
                Your subscription ended on {formatDate(subscription.endDate)}.
                Renew or upgrade your plan to continue enjoying premium
                features.
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="text-lg font-semibold">
              {subscription.planName || "Unknown"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Storage Limit</p>
            <p className="text-lg font-semibold">
              {subscription.plan?.limitSize
                ? `${(
                    subscription.plan.limitSize /
                    (1024 * 1024 * 1024)
                  ).toFixed(0)} GB`
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Max File Size</p>
            <p className="text-lg font-semibold">
              {subscription.plan?.maxFileSize
                ? `${(subscription.plan.maxFileSize / (1024 * 1024)).toFixed(
                    0
                  )} MB`
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-lg font-semibold">
              {subscription.plan?.monthlyPrice
                ? `$${subscription.plan.monthlyPrice.toFixed(2)}/month`
                : "Free"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Started</p>
            <p className="text-lg font-semibold">
              {formatDate(subscription.startDate)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Expires</p>
            <p
              className={`text-lg font-semibold ${
                isExpired ? "text-destructive" : ""
              }`}
            >
              {formatDate(subscription.endDate)}
            </p>
            {!isExpired && subscription.status === "active" && (
              <p className="mt-1 text-xs text-muted-foreground">
                {daysRemaining} days remaining
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Auto-Renewal</p>
              <p className="font-medium">
                {subscription.autoRenew ? "Enabled" : "Disabled"}
              </p>
            </div>
            {subscription.plan?.description && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium text-sm">
                  {subscription.plan.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
