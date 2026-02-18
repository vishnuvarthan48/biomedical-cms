"use client";

import { ShieldX, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function AccessDeniedPage({
  onGoBack,
  onSwitchOrg,
}: {
  onGoBack: () => void;
  onSwitchOrg?: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.1)" }}
        >
          <ShieldX className="w-10 h-10 text-[#EF4444]" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">
          Access Denied
        </h2>
        <p className="text-base text-muted-foreground mb-6">
          You do not have the required permissions to access this page. This may
          be due to your current role or organization context.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className="text-sm font-semibold h-10 px-4"
            onClick={onGoBack}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Go Back
          </Button>
          {onSwitchOrg && (
            <Button
              className="text-white border-0 text-sm font-semibold h-10 px-5"
              style={{
                background: "linear-gradient(135deg, #00BCD4, #00838F)",
              }}
              onClick={onSwitchOrg}
            >
              <Building2 className="w-4 h-4 mr-1.5" /> Switch Organization
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          If you believe this is an error, contact your administrator.
        </p>
      </div>
    </div>
  );
}
