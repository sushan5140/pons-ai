import Hero from "@/components/sections/hero";
import DashboardZoom from "@/components/sections/dashboard-zoom";
import ModulesSplit from "@/components/sections/modules-split";
import FeatureWindows from "@/components/sections/feature-windows";
import AIConversation from "@/components/sections/ai-conversation";
import DashboardShowcase from "@/components/sections/dashboard-showcase";
import Pricing from "@/components/sections/pricing";
import FinalCTA from "@/components/sections/final-cta";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <DashboardZoom />
      <ModulesSplit />
      <FeatureWindows />
      <AIConversation />
      <DashboardShowcase />
      <Pricing />
      <FinalCTA />
    </main>
  );
}
