import { Apple, Users, Heart, AlertCircle, Baby, User } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NutritionGuidanceProps {
  infants: number;
  children: number;
  adults: number;
  elderly: number;
  totalMembers: number;
}

export const NutritionGuidance = ({ infants, children, adults, elderly, totalMembers }: NutritionGuidanceProps) => {
  // WHO and NDMA recommended daily requirements during emergencies
  const waterPerPerson = 3; // liters
  const caloriesPerAdult = 2100; // kcal (SPHERE standards)
  const caloriesPerChild = 1800; // kcal
  const caloriesPerElderly = 1900; // kcal
  const caloriesPerInfant = 800; // kcal (milk-based)
  
  const totalDailyCalories = (adults * caloriesPerAdult) + (children * caloriesPerChild) + 
                             (elderly * caloriesPerElderly) + (infants * caloriesPerInfant);
  
  return (
    <Card className="p-6 shadow-elevation">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Apple className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Emergency Nutrition Plan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-primary/10 border-2 border-primary/20 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              72-Hour Supply Requirements
            </h4>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Water:</strong> {(waterPerPerson * totalMembers * 3).toFixed(0)} liters total</li>
              <li>• <strong>Daily calories needed:</strong> {totalDailyCalories.toLocaleString()} kcal</li>
              <li>• <strong>Food:</strong> No refrigeration or cooking required</li>
              <li>• Manual can opener and disposable utensils</li>
            </ul>
          </div>

          <div className="p-4 bg-secondary/10 border-2 border-secondary/20 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Household Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              {infants > 0 && (
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-primary" />
                  <span><strong>{infants}</strong> Infant{infants > 1 ? 's' : ''} (0-2 yrs) - {infants * caloriesPerInfant} kcal/day</span>
                </div>
              )}
              {children > 0 && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span><strong>{children}</strong> Child{children > 1 ? 'ren' : ''} (3-17 yrs) - {children * caloriesPerChild} kcal/day</span>
                </div>
              )}
              {adults > 0 && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span><strong>{adults}</strong> Adult{adults > 1 ? 's' : ''} (18-59 yrs) - {adults * caloriesPerAdult} kcal/day</span>
                </div>
              )}
              {elderly > 0 && (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  <span><strong>{elderly}</strong> Elder{elderly > 1 ? 's' : ''} (60+ yrs) - {elderly * caloriesPerElderly} kcal/day</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg border border-border">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Essential Foods (ICMR Guidelines)
            </h4>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Proteins:</strong> Dal packets, rajma, chana (50g protein/adult/day)</li>
              <li>• <strong>Carbohydrates:</strong> Rice, roti packets, poha mix (300-400g/adult/day)</li>
              <li>• <strong>Energy:</strong> Jaggery, glucose powder, chikki (quick energy)</li>
              <li>• <strong>Hydration:</strong> ORS packets (WHO formula), electrolyte powder</li>
              <li>• <strong>Ready-to-eat:</strong> Khichdi packets, MTR/Gits instant meals</li>
              <li>• <strong>Dry snacks:</strong> Murmura, chana, dry fruits (200 kcal/serving)</li>
            </ul>
          </div>

          {infants > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Baby className="w-5 h-5" />
                For Infants (0-2 years) - {infants} infant{infants > 1 ? 's' : ''}
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Infant formula:</strong> {infants * 7} days supply minimum (Similac/Enfamil)</li>
                <li>• <strong>Baby food jars:</strong> Cerelac, Nestle stage foods (age-appropriate)</li>
                <li>• <strong>Feeding essentials:</strong> Bottles, nipples, sterilization tablets</li>
                <li>• <strong>Diapers:</strong> {infants * 30} diapers (10/day × 3 days)</li>
                <li>• <strong>Wipes & diaper rash cream</strong></li>
                <li>• <strong>Pediatric medicines:</strong> Gripe water, cough syrup (if prescribed)</li>
              </ul>
            </div>
          )}

          {children > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-900 dark:text-green-100">
                <User className="w-5 h-5" />
                For Children (3-17 years) - {children} child{children > 1 ? 'ren' : ''}
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>High-calorie:</strong> Peanut butter, Nutella, energy bars ({children * 3} servings/day)</li>
                <li>• <strong>Fortified foods:</strong> Fortified biscuits, Horlicks, Bournvita packets</li>
                <li>• <strong>Milk:</strong> Amul powder or tetra packs (2 cups/child/day = {children * 2} cups total)</li>
                <li>• <strong>Fruits:</strong> Banana chips, dried mango, apple chips</li>
                <li>• <strong>Vitamins:</strong> Multivitamin drops/chewables</li>
                <li>• <strong>Comfort foods:</strong> Biscuits, chocolates (for morale)</li>
              </ul>
            </div>
          )}

          {elderly > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <Heart className="w-5 h-5" />
                For Elderly (60+ years) - {elderly} elder{elderly > 1 ? 's' : ''}
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Easy to digest:</strong> Khichdi mix, daliya, sabudana ({elderly * 3} meals/day)</li>
                <li>• <strong>Low sodium:</strong> Unsalted options for BP management</li>
                <li>• <strong>Soft foods:</strong> Ragi porridge, oats, sooji (semolina)</li>
                <li>• <strong>Fiber:</strong> Isabgol, dried prunes (digestive health)</li>
                <li>• <strong>Medications:</strong> 2-week supply + prescription copies ({elderly} × 14 days)</li>
                <li>• <strong>Diabetic-friendly:</strong> Sugar-free items, whole grains (if applicable)</li>
              </ul>
            </div>
          )}

          <div className="p-4 border-2 border-border rounded-lg bg-card">
            <h4 className="font-semibold mb-3 text-lg">Medical & Hygiene Essentials</h4>
            <ul className="space-y-1 text-sm">
              <li>✓ Water purification tablets ({totalMembers * 10} tablets for emergency water)</li>
              <li>✓ First aid kit with antiseptic, bandages, paracetamol, pain relief</li>
              <li>✓ ORS packets - {totalMembers * 5} sachets minimum</li>
              <li>✓ Sanitary supplies for {Math.ceil((adults + elderly) / 2)} women if applicable</li>
              <li>✓ Torch, extra batteries, portable phone charger</li>
              <li>✓ Important documents in waterproof ziplock bags</li>
              <li>✓ Cash (₹5000-10000) in small denominations</li>
            </ul>
          </div>

          <div className="p-4 bg-destructive/10 border-2 border-destructive/20 rounded-lg">
            <h4 className="font-semibold text-destructive mb-2">⚠️ Foods to AVOID in Emergencies</h4>
            <ul className="space-y-1 text-sm">
              <li>• Salty snacks (increase thirst/dehydration)</li>
              <li>• Caffeinated drinks (dehydrating effect)</li>
              <li>• Perishable items requiring refrigeration</li>
              <li>• Glass containers (breakage risk)</li>
              <li>• Alcohol (impairs judgment, dehydrating)</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};
