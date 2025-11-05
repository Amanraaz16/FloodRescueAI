import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    
    if (!location) {
      return new Response(
        JSON.stringify({ error: "Location is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Assessing flood risk for location: ${location}`);

    // Fetch comprehensive weather data for the location
    const openWeatherApiKey = Deno.env.get("OPENWEATHER_API_KEY");
    let weatherContext = "";
    let coordinates: { lat: number; lon: number; name: string } | null = null;
    let governmentAlerts = "";
    let floodForecast = "";
    
    if (openWeatherApiKey) {
      try {
        // Get current weather and coordinates
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${openWeatherApiKey}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          coordinates = {
            lat: weatherData.coord.lat,
            lon: weatherData.coord.lon,
            name: weatherData.name
          };
          
          // Use OpenWeather One Call API 3.0 for comprehensive data
          const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${openWeatherApiKey}&units=metric`;
          const oneCallResponse = await fetch(oneCallUrl);
          
          // OpenWeather One Call API 3.0: hourly contains FORECAST (next 48h), not past data
          // For current rainfall, we use the main weather endpoint data
          let rainfallHistory = "No significant recent rainfall detected.";
          const currentRainfall1h = weatherData.rain?.['1h'] || 0;
          const currentRainfall3h = weatherData.rain?.['3h'] || 0;
          let totalRainfall48h = Math.max(currentRainfall1h, currentRainfall3h); // Use available recent data
          let sustainedRainfall = false;
          let forecastRainfall48h = 0;
          let forecastDescription = "No significant rainfall expected";
          
          if (oneCallResponse.ok) {
            const oneCallData = await oneCallResponse.json();
            
            // Check for government weather alerts
            if (oneCallData.alerts && oneCallData.alerts.length > 0) {
              const alerts = oneCallData.alerts.map((alert: { event: string; description: string }) => 
                `- ${alert.event}: ${alert.description.slice(0, 200)}`
              ).join('\n');
              governmentAlerts = `\nGOVERNMENT WEATHER ALERTS:\n${alerts}\n`;
              console.log("Active weather alerts:", alerts);
            }
            
            // FORECAST rainfall for next 48 hours from hourly data
            if (oneCallData.hourly && oneCallData.hourly.length > 0) {
              const next48Hours = oneCallData.hourly.slice(0, Math.min(48, oneCallData.hourly.length));
              forecastRainfall48h = next48Hours.reduce((sum: number, hour: { rain?: { '1h'?: number } }) => {
                return sum + (hour.rain?.['1h'] || 0);
              }, 0);
              
              // Check forecast for sustained rainfall pattern
              let consecutiveRainHours = 0;
              let maxConsecutive = 0;
              next48Hours.forEach((hour: { rain?: { '1h'?: number } }) => {
                if ((hour.rain?.['1h'] || 0) > 1) { // More than 1mm/h
                  consecutiveRainHours++;
                  maxConsecutive = Math.max(maxConsecutive, consecutiveRainHours);
                } else {
                  consecutiveRainHours = 0;
                }
              });
              
              sustainedRainfall = maxConsecutive >= 6; // 6+ consecutive hours forecast
              
              // Categorize forecast rainfall
              if (forecastRainfall48h > 100) {
                forecastDescription = `⚠️ HEAVY RAINFALL FORECAST: ${forecastRainfall48h.toFixed(1)}mm expected in next 48h${sustainedRainfall ? ' (SUSTAINED PATTERN)' : ''}`;
              } else if (forecastRainfall48h > 50) {
                forecastDescription = `⚠️ Moderate rainfall forecast: ${forecastRainfall48h.toFixed(1)}mm expected in next 48h${sustainedRainfall ? ' (continuous)' : ''}`;
              } else if (forecastRainfall48h > 20) {
                forecastDescription = `Light rainfall forecast: ${forecastRainfall48h.toFixed(1)}mm expected in next 48h`;
              } else {
                forecastDescription = `Minimal rainfall forecast: ${forecastRainfall48h.toFixed(1)}mm expected in next 48h`;
              }
            }
            
            // Get daily forecast for additional context
            if (oneCallData.daily && oneCallData.daily.length > 0) {
              const next2Days = oneCallData.daily.slice(0, 2);
              const dailyRainTotal = next2Days.reduce((sum: number, day: { rain?: number }) => {
                return sum + (day.rain || 0);
              }, 0);
              
              if (dailyRainTotal > 0) {
                console.log(`Daily forecast shows ${dailyRainTotal.toFixed(1)}mm rain in next 48h`);
              }
            }
            
            // Update recent rainfall description
            if (currentRainfall1h > 0 || currentRainfall3h > 0) {
              const recentTotal = Math.max(currentRainfall1h * 3, currentRainfall3h); // Estimate 3h from 1h data
              rainfallHistory = `Recent rainfall detected: ${currentRainfall1h.toFixed(1)}mm in last hour${currentRainfall3h > 0 ? `, ${currentRainfall3h.toFixed(1)}mm in last 3 hours` : ''}`;
              totalRainfall48h = recentTotal; // Use as proxy for recent 48h
              
              if (currentRainfall1h > 10) {
                rainfallHistory += " (HEAVY RAIN ONGOING)";
              }
            }
          }
          
          // Try Google Flood Forecasting API (free, no key required)
          try {
            const floodUrl = `https://floodforecasting.googleapis.com/v1/flood?latitude=${coordinates.lat}&longitude=${coordinates.lon}`;
            const floodResponse = await fetch(floodUrl);
            
            if (floodResponse.ok) {
              const floodData = await floodResponse.json();
              if (floodData.forecastProbability) {
                floodForecast = `\nGOOGLE FLOOD FORECAST: ${(floodData.forecastProbability * 100).toFixed(0)}% probability of flooding in next 48h\n`;
                console.log("Google flood forecast:", floodData);
              }
            }
          } catch (error) {
            console.log("Google Flood Forecasting not available for this location");
          }
          
          // Calculate distance to major flood-prone rivers in India
          const majorRivers = [
            { name: "Ganges", lat: 25.9644, lon: 83.5685 },
            { name: "Brahmaputra", lat: 26.1445, lon: 91.7362 },
            { name: "Yamuna", lat: 28.6139, lon: 77.2090 },
            { name: "Godavari", lat: 16.7107, lon: 81.8027 },
            { name: "Krishna", lat: 16.5062, lon: 80.6480 },
          ];
          
          let nearestRiver = "";
          let minDistance = Infinity;
          
          const userCoords = coordinates;
          if (userCoords) {
            majorRivers.forEach(river => {
              const R = 6371; // Earth's radius in km
              const dLat = (river.lat - userCoords.lat) * Math.PI / 180;
              const dLon = (river.lon - userCoords.lon) * Math.PI / 180;
              const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(userCoords.lat * Math.PI / 180) * Math.cos(river.lat * Math.PI / 180) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const distance = R * c;
              
              if (distance < minDistance) {
                minDistance = distance;
                nearestRiver = river.name;
              }
            });
          }
          
          const riverProximity = minDistance < 50 
            ? `LOCATION: ${minDistance.toFixed(1)}km from ${nearestRiver} River (HIGH FLOOD RISK ZONE)`
            : `Location: ${minDistance.toFixed(1)}km from nearest major river (${nearestRiver})`;
          
          // Check if monsoon season in India (June-September)
          const currentMonth = new Date().getMonth() + 1;
          const isMonsoonSeason = currentMonth >= 6 && currentMonth <= 9;
          const monsoonInfo = isMonsoonSeason ? "🌧️ MONSOON SEASON (June-Sept) - ALL RISK FACTORS DOUBLED" : "Outside monsoon season";
          
          // Calculate TOTAL rainfall consideration (current + forecast)
          const totalRainfall96h = totalRainfall48h + forecastRainfall48h;
          
          weatherContext = `
CURRENT WEATHER DATA:
- Location: ${weatherData.name}, ${weatherData.sys.country}
- Temperature: ${weatherData.main.temp}°C (Feels like: ${weatherData.main.feels_like}°C)
- Humidity: ${weatherData.main.humidity}%
- Weather: ${weatherData.weather[0].description}
- Wind Speed: ${weatherData.wind.speed} m/s
- Pressure: ${weatherData.main.pressure} hPa
- **Current Rainfall (1h): ${currentRainfall1h.toFixed(1)}mm** ${currentRainfall1h > 10 ? '⚠️ HEAVY' : ''}
- **Current Rainfall (3h): ${currentRainfall3h.toFixed(1)}mm** ${currentRainfall3h > 30 ? '⚠️ VERY HEAVY' : ''}

RAINFALL ANALYSIS - CRITICAL DATA:
- ${rainfallHistory}
- ${forecastDescription}
- **⚠️ TOTAL RAINFALL RISK (Recent + Forecast 48h): ${totalRainfall96h.toFixed(1)}mm**
- Forecast pattern: ${sustainedRainfall ? '⚠️ SUSTAINED RAINFALL EXPECTED (6+ consecutive hours)' : 'Intermittent or light rainfall expected'}

GEOGRAPHIC RISK FACTORS:
- ${riverProximity}
- Season: ${monsoonInfo}

${governmentAlerts}${floodForecast}

⚠️ CRITICAL ASSESSMENT NOTES: 
- Current rainfall data shows ACTUAL rain in the area right now
- If current 1h rainfall > 10mm OR 3h rainfall > 30mm, this indicates HEAVY RAIN IN PROGRESS
- Forecast must be evaluated for sustained patterns (6+ hours continuous)
- Total risk = Current conditions + Forecast + Geographic factors`;
        }
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    }

    // Use Lovable AI to assess flood risk
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert flood risk assessment AI for India. STRICT ACCURACY IS CRITICAL.

MANDATORY ASSESSMENT RULES (Priority Order):

1. GOVERNMENT ALERTS = IMMEDIATE ACTION
   - ANY flood warning → HIGH RISK (no exceptions)
   - Heavy rain warning → Consider for MEDIUM/HIGH based on other factors

2. RAINFALL ANALYSIS (Past + Forecast COMBINED):
   - Total 96h rainfall (past 48h + forecast 48h) is PRIMARY indicator
   - Forecast rain is AS IMPORTANT as current rain
   - Sustained patterns (12+ consecutive hours) DOUBLE the risk weight

3. RIVER PROXIMITY DURING RAINFALL:
   - <50km from major river + significant rain = HIGH RISK ZONE
   - <100km during monsoon + rain = ELEVATED RISK
   - >150km = Lower risk unless extreme rainfall

4. SEASONAL MULTIPLIER:
   - Monsoon season (June-Sept) = ALL rainfall risk factors DOUBLED

STRICT RISK DEFINITIONS:

HIGH RISK (Evacuation-level danger):
✓ Government flood alert active OR
✓ Google flood probability >60% OR
✓ Total 96h rainfall >150mm + river <150km OR
✓ Total 96h rainfall >100mm + river <50km OR
✓ Sustained heavy rain (>50mm/48h) + river <100km during monsoon OR
✓ Forecast shows >80mm in next 48h + river <100km

MEDIUM RISK (Immediate preparation needed):
✓ Google flood probability 30-60% OR
✓ Total 96h rainfall 75-150mm + river <150km OR
✓ Forecast shows 40-80mm + river <150km OR
✓ Any weather warning + rainfall detected OR
✓ Monsoon season + river <100km + any sustained rain OR
✓ Past 48h >50mm even if river distant

LOW RISK (Stay informed):
✓ Total 96h rainfall <75mm AND
✓ No government alerts AND
✓ Google probability <30% AND
✓ No sustained rainfall patterns

CRITICAL INSTRUCTIONS:
- Calculate TOTAL 96h rainfall (past + forecast) as PRIMARY metric
- Weight forecast rainfall EQUALLY to current rainfall
- During monsoon, ANY rainfall near rivers (<100km) elevates risk
- ALWAYS cite specific numbers in reasoning
- Be conservative when data suggests borderline risk

Return ONLY valid JSON:
{
  "riskLevel": "low" | "medium" | "high",
  "reasoning": "1) Total 96h rainfall: X mm (past Y + forecast Z). 2) River distance: X km. 3) Government/Google alerts: [status]. 4) Monsoon: [Y/N]. 5) Risk level justified by: [specific criteria met]"
}`;

    const userPrompt = `Location: ${location}${coordinates ? ` (${coordinates.name})` : ''}

${weatherContext}

ASSESSMENT PRIORITY ORDER:
1. Check government alerts → If flood warning, must be HIGH
2. Calculate TOTAL 96h rainfall (past + forecast combined)
3. Evaluate river proximity risk during rainfall
4. Apply monsoon multiplier if applicable
5. Check Google flood forecast
6. Determine final risk level using strict criteria above

Provide detailed reasoning citing ALL specific numbers: total 96h rainfall breakdown, river distance, alert status, monsoon context, and which specific HIGH/MEDIUM/LOW criteria were met.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error("Failed to get AI assessment");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response");
    }

    const assessment = JSON.parse(jsonMatch[0]);
    console.log("Assessment:", assessment);

    // Add coordinates to response
    const response = {
      ...assessment,
      coordinates
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error assessing flood risk:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        riskLevel: "medium",
        reasoning: "Unable to assess risk accurately. Please monitor local weather advisories."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
