import { useState } from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface HouseholdData {
  totalMembers: number;
  infants: number;
  children: number;
  adults: number;
  elderly: number;
}

interface HouseholdInputProps {
  onUpdate: (data: HouseholdData) => void;
}

export const HouseholdInput = ({ onUpdate }: HouseholdInputProps) => {
  const [data, setData] = useState<HouseholdData>({
    totalMembers: 1,
    infants: 0,
    children: 0,
    adults: 1,
    elderly: 0,
  });

  const updateData = (updates: Partial<HouseholdData>) => {
    const newData = { ...data, ...updates };
    // Auto-calculate total if individual counts change
    if ('infants' in updates || 'children' in updates || 'adults' in updates || 'elderly' in updates) {
      newData.totalMembers = newData.infants + newData.children + newData.adults + newData.elderly;
    }
    setData(newData);
    onUpdate(newData);
  };

  return (
    <Card className="p-6 shadow-elevation h-full bg-gradient-to-br from-background to-muted/20">
      <div className="space-y-5 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Household Information</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="infants" className="text-sm font-semibold">
              Infants (0-2 years)
            </Label>
            <Input
              id="infants"
              type="number"
              min="0"
              max="10"
              value={data.infants}
              onChange={(e) => updateData({ infants: parseInt(e.target.value) || 0 })}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="children" className="text-sm font-semibold">
              Children (3-17 years)
            </Label>
            <Input
              id="children"
              type="number"
              min="0"
              max="20"
              value={data.children}
              onChange={(e) => updateData({ children: parseInt(e.target.value) || 0 })}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adults" className="text-sm font-semibold">
              Adults (18-59 years)
            </Label>
            <Input
              id="adults"
              type="number"
              min="0"
              max="20"
              value={data.adults}
              onChange={(e) => updateData({ adults: parseInt(e.target.value) || 0 })}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="elderly" className="text-sm font-semibold">
              Elderly (60+ years)
            </Label>
            <Input
              id="elderly"
              type="number"
              min="0"
              max="20"
              value={data.elderly}
              onChange={(e) => updateData({ elderly: parseInt(e.target.value) || 0 })}
              className="text-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-lg mt-auto">
          <p className="text-center text-lg font-bold">
            Total Household Members: <span className="text-primary text-2xl">{data.totalMembers}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};
