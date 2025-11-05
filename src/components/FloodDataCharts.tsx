import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, CloudRain, AlertTriangle, MapPin } from "lucide-react";

// Simulated historical flood data for major Indian regions
const historicalFloodData = [
  { year: "2019", Mumbai: 12, Kerala: 18, Assam: 25, Bihar: 22, Chennai: 8 },
  { year: "2020", Mumbai: 15, Kerala: 22, Assam: 28, Bihar: 25, Chennai: 10 },
  { year: "2021", Mumbai: 18, Kerala: 20, Assam: 30, Bihar: 28, Chennai: 12 },
  { year: "2022", Mumbai: 14, Kerala: 24, Assam: 32, Bihar: 30, Chennai: 15 },
  { year: "2023", Mumbai: 20, Kerala: 26, Assam: 35, Bihar: 32, Chennai: 18 },
  { year: "2024", Mumbai: 22, Kerala: 28, Assam: 38, Bihar: 35, Chennai: 20 },
];

// Simulated monthly rainfall patterns (in mm)
const rainfallPatterns = [
  { month: "Jan", rainfall: 15, average: 20 },
  { month: "Feb", rainfall: 20, average: 25 },
  { month: "Mar", rainfall: 35, average: 40 },
  { month: "Apr", rainfall: 45, average: 50 },
  { month: "May", rainfall: 120, average: 100 },
  { month: "Jun", rainfall: 580, average: 520 },
  { month: "Jul", rainfall: 720, average: 650 },
  { month: "Aug", rainfall: 680, average: 600 },
  { month: "Sep", rainfall: 420, average: 380 },
  { month: "Oct", rainfall: 180, average: 160 },
  { month: "Nov", rainfall: 60, average: 55 },
  { month: "Dec", rainfall: 25, average: 30 },
];

// Regional risk assessment trends
const riskTrends = [
  { region: "Mumbai", high: 35, medium: 45, low: 20 },
  { region: "Kerala", high: 42, medium: 38, low: 20 },
  { region: "Assam", high: 55, medium: 30, low: 15 },
  { region: "Bihar", high: 48, medium: 35, low: 17 },
  { region: "Chennai", high: 28, medium: 42, low: 30 },
  { region: "Kolkata", high: 38, medium: 40, low: 22 },
];

// Flood incident frequency by month
const floodFrequency = [
  { month: "Jan", incidents: 2 },
  { month: "Feb", incidents: 1 },
  { month: "Mar", incidents: 3 },
  { month: "Apr", incidents: 5 },
  { month: "May", incidents: 8 },
  { month: "Jun", incidents: 45 },
  { month: "Jul", incidents: 62 },
  { month: "Aug", incidents: 58 },
  { month: "Sep", incidents: 35 },
  { month: "Oct", incidents: 15 },
  { month: "Nov", incidents: 6 },
  { month: "Dec", incidents: 3 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; unit?: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.unit && entry.unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const FloodDataCharts = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-water bg-clip-text text-transparent">
            Flood Data & Analytics
          </h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
          Historical flood patterns, rainfall data, and risk assessments across major Indian regions
        </p>
        <p className="text-xs text-muted-foreground italic">
          Data is simulated for demonstration purposes
        </p>
      </div>

      <Tabs defaultValue="historical" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-1">
          <TabsTrigger value="historical" className="text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Historical </span>Trends
          </TabsTrigger>
          <TabsTrigger value="rainfall" className="text-xs sm:text-sm">
            <CloudRain className="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
            Rainfall
          </TabsTrigger>
          <TabsTrigger value="regional" className="text-xs sm:text-sm">
            <MapPin className="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
            Regional Risk
          </TabsTrigger>
          <TabsTrigger value="frequency" className="text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 mr-1 sm:mr-2" aria-hidden="true" />
            Frequency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historical" className="mt-6">
          <Card className="shadow-elevation transition-all hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Historical Flood Events by Region</CardTitle>
              <CardDescription>Number of flood events recorded annually (2019-2024)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalFloodData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="year" 
                    className="text-xs sm:text-sm" 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    className="text-xs sm:text-sm" 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    label={{ value: 'Number of Events', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="Mumbai" stroke="hsl(205 87% 29%)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Kerala" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Assam" stroke="hsl(0 72% 51%)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Bihar" stroke="hsl(25 95% 53%)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Chennai" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">Key Insight:</strong> Assam and Bihar show consistently higher flood events due to monsoon patterns and geographical factors. Coastal regions like Mumbai and Chennai show increasing trends.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rainfall" className="mt-6">
          <Card className="shadow-elevation transition-all hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Monthly Rainfall Patterns</CardTitle>
              <CardDescription>Average rainfall distribution throughout the year (in mm)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={rainfallPatterns}>
                  <defs>
                    <linearGradient id="colorRainfall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(205 87% 29%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(205 87% 29%)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs sm:text-sm" 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    className="text-xs sm:text-sm" 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="rainfall" stroke="hsl(205 87% 29%)" fillOpacity={1} fill="url(#colorRainfall)" name="2024 Rainfall" />
                  <Area type="monotone" dataKey="average" stroke="hsl(142 76% 36%)" fillOpacity={1} fill="url(#colorAverage)" name="Historical Average" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">Monsoon Season:</strong> June-September accounts for 80% of annual rainfall. Peak flood risk occurs during July-August when rainfall exceeds 600mm monthly.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="mt-6">
          <Card className="shadow-elevation transition-all hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Regional Risk Distribution</CardTitle>
              <CardDescription>Percentage distribution of flood risk levels by region</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={riskTrends} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    className="text-xs sm:text-sm" 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -5, style: { fill: 'hsl(var(--foreground))' } }}
                  />
                  <YAxis 
                    dataKey="region" 
                    type="category" 
                    className="text-xs sm:text-sm" 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="high" stackId="a" fill="hsl(0 72% 51%)" name="High Risk" />
                  <Bar dataKey="medium" stackId="a" fill="hsl(25 95% 53%)" name="Medium Risk" />
                  <Bar dataKey="low" stackId="a" fill="hsl(142 76% 36%)" name="Low Risk" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">High Risk Areas:</strong> Assam (55%), Bihar (48%), and Kerala (42%) require enhanced preparedness measures. These regions need prioritized resource allocation during monsoon season.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency" className="mt-6">
          <Card className="shadow-elevation transition-all hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Monthly Flood Incident Frequency</CardTitle>
              <CardDescription>Average number of flood incidents recorded per month across India</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={floodFrequency}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs sm:text-sm" 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    className="text-xs sm:text-sm" 
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    label={{ value: 'Number of Incidents', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="incidents" 
                    fill="hsl(205 87% 29%)" 
                    name="Flood Incidents"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-warning/5 rounded-lg border border-warning/20">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">Critical Period:</strong> July sees the highest flood incident rate (62 events), requiring maximum emergency response readiness. Pre-monsoon preparation in May-June is crucial.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 transition-all hover:scale-[1.02]">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <TrendingUp className="w-8 h-8 mx-auto text-primary" aria-hidden="true" />
              <p className="text-2xl sm:text-3xl font-bold text-primary">243</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Flood Events (2024)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/30 transition-all hover:scale-[1.02]">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-destructive" aria-hidden="true" />
              <p className="text-2xl sm:text-3xl font-bold text-destructive">5</p>
              <p className="text-xs sm:text-sm text-muted-foreground">High Risk Regions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/30 transition-all hover:scale-[1.02]">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CloudRain className="w-8 h-8 mx-auto text-accent" aria-hidden="true" />
              <p className="text-2xl sm:text-3xl font-bold text-accent">2,465mm</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Average Annual Rainfall</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
