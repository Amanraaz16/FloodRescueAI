import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface LocationInputProps {
  onLocationSubmit: (location: string) => void;
}

export const LocationInput = ({ onLocationSubmit }: LocationInputProps) => {
  const [location, setLocation] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocation(locationString);
          setIsGettingLocation(false);
          onLocationSubmit(locationString);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsGettingLocation(false);
        }
      );
    } else {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onLocationSubmit(location);
    }
  };

  return (
    <Card className="p-6 shadow-elevation h-full bg-gradient-to-br from-background to-muted/20">
      <form onSubmit={handleSubmit} className="space-y-5 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Location Information</h3>
        </div>
        
        <div className="space-y-2 flex-1">
          <label htmlFor="location" className="text-sm font-semibold">
            Enter Your Location
          </label>
          <div className="flex gap-2">
            <Input
              id="location"
              type="text"
              placeholder="e.g., Mumbai, Kerala, or GPS coordinates..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 text-lg"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              title="Use current location"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Use GPS for instant location or enter your city/area name
          </p>
        </div>
        
        <Button type="submit" className="w-full mt-auto" disabled={!location.trim()}>
          Assess Flood Risk
        </Button>
      </form>
    </Card>
  );
};
