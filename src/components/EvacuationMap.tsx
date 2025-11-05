import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Shelter {
  id: number;
  name: string;
  address: string;
  type: string;
  capacity: number;
  facilities: string[];
  coordinates: [number, number];
  distance: number;
  phone: string;
}

interface EvacuationMapProps {
  searchedLocation: {
    lat: number;
    lon: number;
    name: string;
  };
}

export const EvacuationMap = ({ searchedLocation }: EvacuationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      try {
        // Get Mapbox token
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
        
        if (tokenError) throw tokenError;
        
        mapboxgl.accessToken = tokenData.token;

        // Use searched location instead of GPS
        const latitude = searchedLocation.lat;
        const longitude = searchedLocation.lon;
        setUserLocation([longitude, latitude]);

        // Fetch shelters
        try {
          const { data, error } = await supabase.functions.invoke('get-shelters', {
            body: { lat: latitude, lon: longitude }
          });

          if (error) throw error;
          setShelters(data);

          // Initialize map
          map.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [longitude, latitude],
            zoom: 12,
          });

          // Add navigation controls
          map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

          // Add searched location marker
          new mapboxgl.Marker({ color: "#0284c7" })
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${searchedLocation.name}</h3><p>Searched Location</p>`))
            .addTo(map.current);

          // Add shelter markers
          data.forEach((shelter: Shelter) => {
            const el = document.createElement("div");
            el.className = "shelter-marker";
            el.style.backgroundColor = "#16a34a";
            el.style.width = "30px";
            el.style.height = "30px";
            el.style.borderRadius = "50%";
            el.style.border = "3px solid white";
            el.style.cursor = "pointer";

            new mapboxgl.Marker(el)
              .setLngLat(shelter.coordinates)
              .setPopup(
                new mapboxgl.Popup().setHTML(`
                  <div style="padding: 8px;">
                    <h3 style="font-weight: bold; margin-bottom: 4px;">${shelter.name}</h3>
                    <p style="font-size: 12px; color: #666;">${shelter.type}</p>
                    <p style="font-size: 12px; margin-top: 4px;">${shelter.distance.toFixed(1)} km away</p>
                  </div>
                `)
              )
              .addTo(map.current!);
          });

        } catch (error) {
          console.error("Error loading shelters:", error);
          toast({
            title: "Error",
            description: "Unable to load shelter locations",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Map initialization error:", error);
        toast({
          title: "Error",
          description: "Unable to initialize map",
          variant: "destructive",
        });
      }
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, [searchedLocation, toast]);

  const getDirections = (shelter: Shelter) => {
    if (!userLocation) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[1]},${userLocation[0]}&destination=${shelter.coordinates[1]},${shelter.coordinates[0]}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <Card className="p-0 shadow-elevation overflow-hidden">
        <div ref={mapContainer} className="w-full h-[400px]" />
      </Card>

      <Card className="p-6 shadow-elevation">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Nearby Emergency Shelters</h3>
        </div>

        <div className="space-y-3">
          {shelters.map((shelter) => (
            <div
              key={shelter.id}
              className="p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
              onClick={() => setSelectedShelter(shelter)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">{shelter.name}</h4>
                      <p className="text-sm text-muted-foreground">{shelter.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {shelter.distance.toFixed(1)} km away
                    </span>
                    <span className="text-muted-foreground">
                      Capacity: {shelter.capacity}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {shelter.facilities.map((facility, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3 h-3" />
                    <span className="text-muted-foreground">{shelter.phone}</span>
                  </div>
                </div>

                <Button size="sm" onClick={() => getDirections(shelter)}>
                  Get Directions
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Safety Tips</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Avoid flood-prone roads, low-lying areas, and waterlogged streets</li>
            <li>• Move to higher floors or elevated ground immediately</li>
            <li>• Keep NDRF (1070) and local emergency numbers accessible</li>
            <li>• Never wade or drive through flooded streets</li>
            <li>• Stay away from electric poles and damaged power lines</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
