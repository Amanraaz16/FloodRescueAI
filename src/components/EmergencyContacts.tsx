import { Phone, AlertCircle, PhoneCall } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const emergencyNumbers = [
  { service: "Emergency (Police)", number: "100", priority: "high", description: "Immediate danger, crimes" },
  { service: "Ambulance", number: "108", priority: "high", description: "Medical emergencies" },
  { service: "Fire & Rescue", number: "101", priority: "high", description: "Fire, rescue operations" },
  { service: "National Disaster Response", number: "011-26105763", priority: "medium", description: "NDRF coordination" },
  { service: "State Disaster Management", number: "1070", priority: "medium", description: "State-level assistance" },
  { service: "Women Helpline", number: "1091", priority: "medium", description: "Women safety & assistance" },
];

export const EmergencyContacts = () => {
  const handleCall = (number: string, service: string) => {
    // On mobile devices, tel: link will open dialer
    window.location.href = `tel:${number}`;
    toast.success(`Calling ${service}: ${number}`);
  };

  return (
    <Card className="p-6 shadow-elevation border-2 border-destructive/30 bg-gradient-to-br from-background to-destructive/5">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-6 h-6 text-destructive animate-pulse" />
          <h3 className="text-xl font-bold">Emergency Contacts</h3>
        </div>

        <div className="p-4 bg-destructive/20 border-2 border-destructive rounded-lg mb-4">
          <p className="text-sm font-bold text-destructive text-center">
            🚨 In immediate danger, call <strong>100</strong> (Police) or <strong>108</strong> (Ambulance) first
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {emergencyNumbers.map((contact) => (
            <div
              key={contact.number}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:scale-[1.02] ${
                contact.priority === "high" 
                  ? "bg-destructive/10 border-destructive/40 hover:border-destructive" 
                  : "bg-muted border-border hover:border-primary"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-full ${contact.priority === "high" ? "bg-destructive/20" : "bg-primary/20"}`}>
                  <Phone className={`w-5 h-5 ${contact.priority === "high" ? "text-destructive" : "text-primary"}`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base">{contact.service}</p>
                  <p className="text-sm text-muted-foreground">{contact.description}</p>
                  <p className="text-lg font-mono font-bold mt-1">{contact.number}</p>
                </div>
              </div>
              <Button 
                size="lg" 
                variant={contact.priority === "high" ? "destructive" : "default"}
                onClick={() => handleCall(contact.number, contact.service)}
                className="gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                Call
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
          <h4 className="font-semibold mb-2 text-primary">📱 Save These Numbers</h4>
          <p className="text-sm text-muted-foreground">
            Program these emergency numbers into your phone contacts now. In a flood emergency, mobile networks may be disrupted, so memorize key numbers like <strong>100</strong> and <strong>108</strong>.
          </p>
        </div>
      </div>
    </Card>
  );
};
