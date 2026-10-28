import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { GlassButton } from "@/components/site/Glass";
import { loadDemoData } from "@/lib/demoSeed";

export default function LoadDemoDataButton({ onLoaded, size = "sm", label = "Load demo data" }) {
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const result = await loadDemoData();
      toast({
        title: "Demo workspace loaded",
        description: `${result.agents} agents and ${result.calls} calls are ready to explore.`,
      });
      if (onLoaded) await onLoaded();
    } catch (error) {
      toast({
        title: "Couldn't load demo data",
        description: error?.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassButton size={size} onClick={run} disabled={busy}>
      {busy ? "Loading demo…" : label}
    </GlassButton>
  );
}