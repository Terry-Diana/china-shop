import { CreditCard, Shield, Clock, MapPin } from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
}

export const features: Feature[] = [
  {
    id: "payment",
    title: "Secure Payment",
    description: "Multiple payment options",
    icon: <CreditCard className="text-accent" size={24} />,
  },
  {
    id: "protection",
    title: "Buyer Protection",
    description: "Money back guarantee",
    icon: <Shield className="text-accent" size={24} />,
  },
  {
    id: "delivery",
    title: "Fast Delivery",
    description: "Express shipping options",
    icon: <Clock className="text-accent" size={24} />,
  },
  {
    id: "pickup",
    title: "Store Pickup",
    description: "At your convenience",
    icon: <MapPin className="text-accent" size={24} />,
  },
];
