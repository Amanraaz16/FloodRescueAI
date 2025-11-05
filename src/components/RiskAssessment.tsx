import { AlertTriangle, CheckCircle, XCircle, Droplets, CloudRain, Shield, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type RiskLevel = "low" | "medium" | "high";

interface RiskAssessmentProps {
  riskLevel: RiskLevel;
  location: string;
}

const riskConfig = {
  low: {
    icon: CheckCircle,
    label: "Low Flood Risk",
    bgClass: "bg-gradient-safe",
    textClass: "text-white",
    borderClass: "border-secondary",
    description: "Your area shows minimal flood risk based on current weather patterns and geographical data.",
    actionItems: [
      "Stay informed through weather updates",
      "Keep emergency contacts handy",
      "Review your emergency supplies periodically"
    ],
    riskPercentage: "15%",
  },
  medium: {
    icon: AlertTriangle,
    label: "Medium Flood Risk",
    bgClass: "bg-gradient-warning",
    textClass: "text-warning-foreground",
    borderClass: "border-warning",
    description: "Moderate flood risk detected. Weather conditions and geographical factors suggest caution.",
    actionItems: [
      "Prepare emergency supplies immediately",
      "Monitor local weather advisories closely",
      "Plan evacuation routes with family",
      "Keep important documents in waterproof bags"
    ],
    riskPercentage: "55%",
  },
  high: {
    icon: XCircle,
    label: "High Flood Risk",
    bgClass: "bg-gradient-danger",
    textClass: "text-white",
    borderClass: "border-destructive",
    description: "Severe flood risk detected! Critical weather and water level conditions require immediate action.",
    actionItems: [
      "Follow evacuation orders immediately",
      "Move to higher ground now",
      "Contact emergency services: 100, 108",
      "Avoid walking/driving through flood water",
      "Stay connected with local authorities"
    ],
    riskPercentage: "85%",
  },
};

export const RiskAssessment = ({ riskLevel, location }: RiskAssessmentProps) => {
  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  return (
    <Card className={cn(
      "p-8 shadow-alert border-4 relative overflow-hidden",
      config.bgClass,
      config.borderClass
    )}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
        <Droplets className="w-full h-full" />
      </div>
      
      <div className="relative space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-4 rounded-2xl bg-white/20 backdrop-blur-sm",
              riskLevel === "high" && "animate-pulse"
            )}>
              <Icon className={cn("w-12 h-12", config.textClass)} />
            </div>
            <div>
              <h2 className={cn("text-3xl font-bold mb-1", config.textClass)}>
                {config.label}
              </h2>
              <p className={cn("text-base opacity-90 flex items-center gap-2", config.textClass)}>
                <Shield className="w-4 h-4" />
                {location}
              </p>
            </div>
          </div>
          
          {/* Risk Percentage Badge */}
          <div className={cn(
            "px-6 py-3 rounded-full font-bold text-2xl bg-white/20 backdrop-blur-sm border-2",
            config.textClass,
            config.borderClass
          )}>
            {config.riskPercentage}
          </div>
        </div>

        {/* Description */}
        <div className={cn(
          "p-4 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/20"
        )}>
          <p className={cn("text-base leading-relaxed", config.textClass)}>
            {config.description}
          </p>
        </div>

        {/* Action Items Grid */}
        <div className="space-y-3">
          <div className={cn("flex items-center gap-2 font-semibold", config.textClass)}>
            <Info className="w-5 h-5" />
            <h3 className="text-lg">Recommended Actions:</h3>
          </div>
          <div className="grid gap-2">
            {config.actionItems.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20",
                  config.textClass
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-white/20 font-bold text-sm mt-0.5"
                )}>
                  {index + 1}
                </div>
                <p className="flex-1">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Indicator */}
        <div className={cn(
          "flex items-center justify-center gap-2 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20",
          config.textClass
        )}>
          <CloudRain className="w-5 h-5" />
          <span className="text-sm font-medium">
            Based on real-time weather analysis and geographical assessment
          </span>
        </div>
      </div>
    </Card>
  );
};
