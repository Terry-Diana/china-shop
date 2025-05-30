import FooterFeaturesBar from "./FooterFeaturesBar";
import FooterNewsletter from "./FooterNewsletter";
import FooterLinksSection from "./FooterLinksSection";
import FooterSocialLinks from "./FooterSocialLinks";
import FooterCopyright from "./FooterCopyright";
import { features } from "../../../data/features";
import {
  categoriesLinks,
  customerServiceLinks,
  aboutLinks,
} from "../../../data/footerLinks";
import { socialLinks } from "../../../data/socialLinks";

const companyDescription = 
  "China Square offers a seamless shopping experience with quality " +
  "products and exceptional service.";

const Footer = () => (
  <footer className="bg-primary-dark text-white">
    <FooterFeaturesBar features={features} />
    
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FooterNewsletter description={companyDescription} />
        
        <FooterLinksSection 
          title="Categories" 
          links={categoriesLinks} 
        />
        
        <FooterLinksSection 
          title="Customer Service" 
          links={customerServiceLinks} 
        />
        
        <div>
          <FooterLinksSection 
            title="About China Square" 
            links={aboutLinks} 
          />
          <h4 className="font-semibold mt-6 mb-3">Follow Us</h4>
          <FooterSocialLinks socialLinks={socialLinks} />
        </div>
      </div>
    </div>
    
    <FooterCopyright />
  </footer>
);

export default Footer;