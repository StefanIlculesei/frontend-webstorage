"use client";

import type { ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plan, Subscription } from "@/types";
import { Check } from "lucide-react";

interface PlanComparisonProps {
  plans: Plan[];
  currentSubscription?: Subscription | null;
  onSelectPlan?: (planId: number) => void;
  buttonLabel?: string;
  buttonVariant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
}

export function PlanComparison({
  plans,
  currentSubscription,
  onSelectPlan,
  buttonLabel = "Choose Plan",
  buttonVariant = "outline",
}: PlanComparisonProps): ReactElement {
  const sortedPlans = [...plans].sort(
    (a, b) => a.monthlyPrice - b.monthlyPrice
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedPlans.map((plan) => {
          const isCurrentPlan = currentSubscription?.planId === plan.id;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col ${
                isCurrentPlan ? "border-primary ring-2 ring-primary/10" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.description || "No description available"}
                    </p>
                  </div>
                  {isCurrentPlan && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Current
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <div className="mb-6 space-y-2">
                  <div className="text-3xl font-bold">
                    ${plan.monthlyPrice}
                    <span className="text-lg font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                </div>

                <div className="mb-6 space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>
                      {(plan.limitSize / (1024 * 1024 * 1024)).toFixed(0)} GB
                      Storage
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>
                      {(plan.maxFileSize / (1024 * 1024)).toFixed(0)} MB Max
                      File Size
                    </span>
                  </div>
                  {plan.description &&
                    plan.description.split(",").map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature.trim()}</span>
                      </div>
                    ))}
                </div>

                <Button
                  onClick={() => onSelectPlan?.(plan.id)}
                  disabled={isCurrentPlan}
                  variant={isCurrentPlan ? "ghost" : buttonVariant}
                  className="w-full"
                >
                  {isCurrentPlan ? "Current Plan" : buttonLabel}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
