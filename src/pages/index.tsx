import { useState } from "react";
import { Droplets, Shield, AlertCircle } from "lucide-react";
import { LocationInput } from "@/components/LocationInput";
import { HouseholdInput } from "@/components/HouseholdInput";
import { RiskAssessment, RiskLevel } from "@/components/RiskAssessment";
import { EvacuationMap } from "@/components/EvacuationMap";
import { NutritionGuidance } from "@/components/NutritionGuidance";
import { EmergencyContacts } from "@/components/EmergencyContacts";
import { WeatherWidget } from "@/components/WeatherWidget";
import { CalmChatbot } from "@/components/CalmChatbot";
import { FloodDataCharts } from "@/components/FloodDataCharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImage from "@/assets/hero-flood-rescue.jpg";

interface HouseholdData {
  totalMembers: number;
  infants: number;
  children: number;
  adults: number;
  elderly: number;
}

const Index = () => {
  const [location, setLocation] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [householdData, setHouseholdData] = useState<HouseholdData>({
    totalMembers: 1,
    infants: 0,
    children: 0,
    adults: 1,
    elderly: 0,
  });

  const handleLocationSubmit = async (loc: string) => {
    setLocation(loc);
    setIsAssessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('assess-flood-risk', {
        body: { location: loc }
      });

      if (error) throw error;

      if (data?.riskLevel) {
        setRiskLevel(data.riskLevel as RiskLevel);
        setLocationCoordinates(data.coordinates);
        if (data.reasoning) {
          toast.info("Risk Assessment", {
            description: data.reasoning,
          });
        }
      } else {
        throw new Error("Invalid response from risk assessment");
      }
    } catch (error) {
      console.error("Error assessing flood risk:", error);
      toast.error("Unable to assess flood risk. Please try again.");
      setRiskLevel("medium"); // Fallback
    } finally {
      setIsAssessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative h-[500px] sm:h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Flood rescue response team helping people during emergency"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/70 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className="animate-fade-in space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Droplets className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground" aria-hidden="true" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground">FloodRescueAI</h1>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/95 max-w-3xl mx-auto leading-relaxed px-4">
              AI-powered flood prediction, evacuation guidance, and emergency nutrition support for communities across India
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center justify-center mt-6 px-4">
              <div className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 transition-all hover:scale-105 hover:bg-white/30">
                <p className="text-sm sm:text-base text-primary-foreground font-semibold">Real-time Analysis</p>
              </div>
              <div className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 transition-all hover:scale-105 hover:bg-white/30">
                <p className="text-sm sm:text-base text-primary-foreground font-semibold">Personalized Guidance</p>
              </div>
              <div className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 transition-all hover:scale-105 hover:bg-white/30">
                <p className="text-sm sm:text-base text-primary-foreground font-semibold">Emergency Support</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!riskLevel ? (
          /* Initial Input Section */
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-gradient-water p-8 rounded-2xl shadow-elevation border-2 border-primary/30 transition-all hover:scale-[1.01]">
              <WeatherWidget />
            </div>
            
            <div className="text-center mb-8 px-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-water bg-clip-text text-transparent">
                  Get Your Flood Risk Assessment
                </h2>
              </div>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Enter your location to receive personalized flood risk analysis and emergency guidance
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-stretch">
              <div className="transform transition-all hover:scale-[1.01] h-full">
                <LocationInput onLocationSubmit={handleLocationSubmit} />
              </div>
              <div className="transform transition-all hover:scale-[1.01] h-full">
                <HouseholdInput onUpdate={setHouseholdData} />
              </div>
            </div>

            {isAssessing && (
              <div className="text-center py-12 px-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border-2 border-primary/20" role="status" aria-live="polite">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" aria-hidden="true"></div>
                <p className="mt-4 text-base sm:text-lg font-semibold text-primary">Analyzing flood risk with AI...</p>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">Processing weather data and geographical patterns</p>
              </div>
            )}

            {/* How It Works Section */}
            <div className="mt-8 p-6 sm:p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-2xl border-2 border-primary/20 shadow-elevation transition-all hover:scale-[1.01]">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 bg-primary rounded-xl">
                  <AlertCircle className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="font-bold text-xl sm:text-2xl text-foreground">How FloodRescueAI Works:</h2>
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex gap-3 items-start p-3 sm:p-4 bg-background/50 rounded-xl border border-primary/10 transition-all hover:scale-[1.02] hover:border-primary/30 hover:bg-background/70">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0" aria-hidden="true">1</div>
                      <p className="text-sm sm:text-base text-foreground">Enter your location or use GPS for instant detection</p>
                    </div>
                    <div className="flex gap-3 items-start p-3 sm:p-4 bg-background/50 rounded-xl border border-primary/10 transition-all hover:scale-[1.02] hover:border-primary/30 hover:bg-background/70">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0" aria-hidden="true">2</div>
                      <p className="text-sm sm:text-base text-foreground">Provide household information for personalized guidance</p>
                    </div>
                    <div className="flex gap-3 items-start p-3 sm:p-4 bg-background/50 rounded-xl border border-primary/10 transition-all hover:scale-[1.02] hover:border-primary/30 hover:bg-background/70">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0" aria-hidden="true">3</div>
                      <p className="text-sm sm:text-base text-foreground">Receive AI-powered flood risk assessment in real-time</p>
                    </div>
                    <div className="flex gap-3 items-start p-3 sm:p-4 bg-background/50 rounded-xl border border-primary/10 transition-all hover:scale-[1.02] hover:border-primary/30 hover:bg-background/70">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0" aria-hidden="true">4</div>
                      <p className="text-sm sm:text-base text-foreground">Get evacuation routes and nutrition recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Details Section */}
            <div className="mt-6 p-6 sm:p-8 bg-gradient-to-br from-secondary/5 via-primary/5 to-accent/5 rounded-2xl border-2 border-secondary/30 shadow-elevation transition-all hover:scale-[1.01]">
              <h2 className="font-bold text-xl sm:text-2xl text-foreground mb-4 text-center">Powered by Advanced AI & GIS Technology</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-background/60 rounded-xl border border-secondary/20 transition-all hover:border-secondary/40">
                  <h3 className="font-bold text-base sm:text-lg text-secondary mb-2">Machine Learning Models</h3>
                  <ul className="text-xs sm:text-sm text-foreground space-y-1">
                    <li>• Random Forest for risk classification</li>
                    <li>• CNN for satellite imagery analysis</li>
                    <li>• LSTM for time-series prediction</li>
                  </ul>
                </div>
                <div className="p-4 bg-background/60 rounded-xl border border-primary/20 transition-all hover:border-primary/40">
                  <h3 className="font-bold text-base sm:text-lg text-primary mb-2">Real-time Data Integration</h3>
                  <ul className="text-xs sm:text-sm text-foreground space-y-1">
                    <li>• Live weather API integration</li>
                    <li>• Geographical Information Systems</li>
                    <li>• Terrain and elevation mapping</li>
                  </ul>
                </div>
                <div className="p-4 bg-background/60 rounded-xl border border-accent/20 transition-all hover:border-accent/40">
                  <h3 className="font-bold text-base sm:text-lg text-accent mb-2">Emergency Response</h3>
                  <ul className="text-xs sm:text-sm text-foreground space-y-1">
                    <li>• Smart evacuation route planning</li>
                    <li>• Personalized nutrition guidance</li>
                    <li>• AI-powered support chatbot</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4 italic">
                This is a prototype demonstration using simulated data and real-time weather information
              </p>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative">
            {/* Back Button */}
            <button
              onClick={() => {
                setRiskLevel(null);
                setLocation("");
                setLocationCoordinates(null);
              }}
              className="fixed top-4 left-4 sm:top-6 sm:left-6 z-40 p-2 sm:p-3 bg-gradient-water text-white rounded-full shadow-alert hover:scale-105 transition-all border-2 border-white/20"
              aria-label="Return to home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6" aria-hidden="true">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>

            <div className="text-center mb-8 p-4 sm:p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border-2 border-primary/20 transition-all hover:scale-[1.01]">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-water bg-clip-text text-transparent">
                Your Emergency Response Plan
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground px-4">
                Personalized assessment based on your location and household information
              </p>
            </div>

            <RiskAssessment riskLevel={riskLevel} location={location} />

            {/* Data Visualization Section */}
            <div className="p-6 sm:p-8 bg-gradient-to-br from-background to-muted/10 rounded-2xl border-2 border-primary/20 shadow-elevation">
              <FloodDataCharts />
            </div>

            {locationCoordinates && (
              <EvacuationMap 
                searchedLocation={locationCoordinates}
              />
            )}

            <NutritionGuidance
              infants={householdData.infants}
              children={householdData.children}
              adults={householdData.adults}
              elderly={householdData.elderly}
              totalMembers={householdData.totalMembers}
            />

            <EmergencyContacts />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 bg-gradient-to-b from-background to-muted/20" role="contentinfo">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-3">
            <p className="text-sm sm:text-base font-semibold text-foreground">FloodRescueAI - AI-powered emergency response system for India</p>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl mx-auto">
              Always follow official guidance from NDRF, State Disaster Management, and local authorities. This is a demonstration prototype.
            </p>
            <div className="pt-4 border-t border-border/50 mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Created by <span className="font-bold text-primary text-sm sm:text-base">Aman Raj</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Powered by Random Forest, CNN, LSTM models and GIS technology
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <CalmChatbot />
    </div>
  );
};

export default Index;
