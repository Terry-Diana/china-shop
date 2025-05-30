import { Feature } from "../../../data/features";

interface FooterFeaturesBarProps {
  features: Feature[];
}

const FooterFeaturesBar = ({ features }: FooterFeaturesBarProps) => (
  <div className="border-b border-primary-400/20">
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((feature) => (
          <div key={feature.id} className="flex items-center space-x-3">
            {feature.icon}
            <div>
              <h4 className="font-medium">{feature.title}</h4>
              <p className="text-xs text-gray-300">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default FooterFeaturesBar;