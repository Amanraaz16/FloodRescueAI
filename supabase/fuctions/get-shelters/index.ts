import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

interface Shelter {
  id: number;
  name: string;
  address: string;
  type: string;
  capacity: number;
  facilities: string[];
  coordinates: [number, number];
  phone: string;
  distance: number;
  source: string;
}

// Fetch real shelters from OpenStreetMap Overpass API
async function fetchRealShelters(lat: number, lon: number): Promise<Shelter[]> {
  try {
    // Query for emergency shelters, hospitals, schools, community centers within 10km
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="shelter"](around:10000,${lat},${lon});
        node["amenity"="hospital"](around:10000,${lat},${lon});
        node["amenity"="clinic"](around:10000,${lat},${lon});
        node["amenity"="community_centre"](around:10000,${lat},${lon});
        node["amenity"="school"](around:10000,${lat},${lon});
        node["amenity"="college"](around:10000,${lat},${lon});
        node["building"="school"](around:10000,${lat},${lon});
        node["amenity"="place_of_worship"](around:10000,${lat},${lon});
        node["building"="government"](around:10000,${lat},${lon});
        way["amenity"="shelter"](around:10000,${lat},${lon});
        way["amenity"="hospital"](around:10000,${lat},${lon});
        way["amenity"="community_centre"](around:10000,${lat},${lon});
        way["amenity"="school"](around:10000,${lat},${lon});
        way["building"="school"](around:10000,${lat},${lon});
      );
      out center;
    `;

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
    const response = await fetch(overpassUrl);
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    const shelters: Shelter[] = [];

    interface OverpassElement {
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: {
        name?: string;
        amenity?: string;
        building?: string;
        emergency?: string;
        phone?: string;
        "contact:phone"?: string;
        "addr:street"?: string;
        "addr:city"?: string;
        "addr:postcode"?: string;
      };
    }

    data.elements.forEach((element: OverpassElement, index: number) => {
      const shelterLat = element.lat || element.center?.lat;
      const shelterLon = element.lon || element.center?.lon;
      
      if (!shelterLat || !shelterLon) return;

      const name = element.tags?.name || `${element.tags?.amenity || element.tags?.building || 'Emergency'} Shelter`;
      const amenity = element.tags?.amenity || element.tags?.building || 'shelter';
      
      // Determine shelter type and facilities
      let type = "Emergency Shelter";
      let facilities = ["Water", "Shelter"];
      let capacity = 200;
      let phone = "1070"; // NDRF emergency number

      if (amenity === "hospital" || amenity === "clinic") {
        type = "Hospital";
        facilities = ["Medical Care", "Water", "Emergency Services"];
        capacity = 300;
        phone = element.tags?.phone || element.tags?.["contact:phone"] || "108"; // Medical emergency
      } else if (amenity === "school" || amenity === "college") {
        type = "School/College";
        facilities = ["Water", "Food", "Large Space", "Toilets"];
        capacity = 500;
        phone = element.tags?.phone || element.tags?.["contact:phone"] || "1070";
      } else if (amenity === "community_centre") {
        type = "Community Center";
        facilities = ["Water", "Food", "Blankets", "Toilets"];
        capacity = 300;
        phone = element.tags?.phone || element.tags?.["contact:phone"] || "1070";
      } else if (amenity === "place_of_worship") {
        type = "Place of Worship";
        facilities = ["Water", "Shelter", "Community Support"];
        capacity = 250;
        phone = "1070";
      } else if (amenity === "shelter" || element.tags?.emergency === "shelter") {
        type = "Emergency Shelter";
        facilities = ["Water", "Food", "Medical Aid", "Blankets"];
        capacity = 400;
        phone = "1070";
      } else if (element.tags?.building === "government") {
        type = "Government Building";
        facilities = ["Water", "Food", "Security", "Communication"];
        capacity = 350;
        phone = element.tags?.phone || element.tags?.["contact:phone"] || "1070";
      }

      const address = [
        element.tags?.["addr:street"],
        element.tags?.["addr:city"],
        element.tags?.["addr:postcode"]
      ].filter(Boolean).join(", ") || "Address available on site";

      const distance = calculateDistance(lat, lon, shelterLat, shelterLon);

      shelters.push({
        id: index + 1,
        name: name,
        address: address,
        type: type,
        capacity: capacity,
        facilities: facilities,
        coordinates: [shelterLon, shelterLat],
        phone: phone,
        distance: distance,
        source: "OpenStreetMap"
      });
    });

    // Sort by distance and return top 10
    return shelters.sort((a, b) => a.distance - b.distance).slice(0, 10);

  } catch (error) {
    console.error("Error fetching from OpenStreetMap:", error);
    return [];
  }
}

// Fallback: Generate shelters if OSM returns no results
function generateFallbackShelters(lat: number, lon: number): Shelter[] {
  const shelterTypes = [
    { type: "District Hospital", facilities: ["Medical Care", "Water", "Emergency Services"], capacity: 300, phone: "108" },
    { type: "Government School", facilities: ["Water", "Food", "Large Space"], capacity: 500, phone: "1070" },
    { type: "Community Center", facilities: ["Water", "Blankets", "Food"], capacity: 300, phone: "1070" },
    { type: "Government Building", facilities: ["Water", "Food", "Security"], capacity: 400, phone: "1070" },
    { type: "Relief Camp", facilities: ["Water", "Medical Aid", "Food", "Blankets"], capacity: 250, phone: "1070" },
  ];

  const shelters = [];

  for (let i = 0; i < 5; i++) {
    const angle = (i * 72) * (Math.PI / 180);
    const distance = 0.01 + (Math.random() * 0.04);
    
    const shelterLat = lat + (distance * Math.cos(angle));
    const shelterLon = lon + (distance * Math.sin(angle));
    
    const shelterType = shelterTypes[i];
    
    shelters.push({
      id: i + 1,
      name: `${shelterType.type} ${i + 1}`,
      address: `Near ${['Main Road', 'Market Area', 'District Center', 'Hospital Road', 'City Center'][i]}`,
      type: shelterType.type,
      capacity: shelterType.capacity,
      facilities: shelterType.facilities,
      coordinates: [shelterLon, shelterLat],
      phone: shelterType.phone,
      distance: calculateDistance(lat, lon, shelterLat, shelterLon),
      source: "Generated"
    });
  }

  return shelters.sort((a, b) => a.distance - b.distance);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();
    
    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: "Latitude and longitude are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching real shelters near: ${lat}, ${lon}`);

    // Try to fetch real shelters from OpenStreetMap
    let shelters = await fetchRealShelters(lat, lon);
    
    // Fallback to generated shelters if no real data found
    if (shelters.length === 0) {
      console.log("No OSM shelters found, using fallback generation");
      shelters = generateFallbackShelters(lat, lon);
    }
    
    console.log(`Shelters returned: ${shelters.length} (${shelters[0]?.source || 'unknown'})`);

    return new Response(
      JSON.stringify(shelters),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating shelters:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
