import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!navigator.geolocation) {
          throw new Error("Geolocation not supported");
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            const { data, error } = await supabase.functions.invoke('get-weather', {
              body: { lat: latitude, lon: longitude }
            });

            if (error) throw error;
            
            setWeather(data);
            setLoading(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast({
              title: "Location Error",
              description: "Unable to get your location for weather updates",
              variant: "destructive",
            });
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Weather fetch error:', error);
        toast({
          title: "Weather Error",
          description: "Unable to fetch weather data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchWeather();
  }, [toast]);

  if (loading) {
    return (
      <Card className="p-4 shadow-elevation">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-muted-foreground animate-pulse" />
          <span className="text-sm text-muted-foreground">Loading weather...</span>
        </div>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-6 h-6 text-primary" />;
      case 'clear':
        return <Sun className="w-6 h-6 text-accent" />;
      default:
        return <Cloud className="w-6 h-6 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-4 shadow-elevation">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getWeatherIcon(weather.weather[0].main)}
            <div>
              <h3 className="font-semibold">{weather.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">
                {weather.weather[0].description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.round(weather.main.temp)}°C</div>
            <div className="text-xs text-muted-foreground">
              Feels like {Math.round(weather.main.feels_like)}°C
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Wind className="w-4 h-4 text-muted-foreground" />
            <span>{weather.wind.speed} m/s</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-4 h-4 text-muted-foreground" />
            <span>{weather.main.humidity}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
