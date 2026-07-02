import Hero from "@/components/sections/hero";
import Problem from "@/components/sections/problem";
import Pipeline from "@/components/sections/pipeline";
import MetadataExtraction from "@/components/sections/metadata-extraction";
import FeatureShowcase from "@/components/sections/feature-showcase";
import EntityGraphExplained from "@/components/sections/entity-graph-explained";
import AIActions from "@/components/sections/ai-actions";
import RealExample from "@/components/sections/real-example";
import Comparison from "@/components/sections/comparison";
import Privacy from "@/components/sections/privacy";
import FinalCTA from "@/components/sections/final-cta";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <Problem />
      <Pipeline />
      <MetadataExtraction />
      <FeatureShowcase />
      <EntityGraphExplained />
      <AIActions />
      <RealExample />
      <Comparison />
      <Privacy />
      <FinalCTA />
    </main>
  );
}
