import { SocialLink } from "../../../data/socialLinks";

interface FooterSocialLinksProps {
  socialLinks: SocialLink[];
}

const FooterSocialLinks = ({ socialLinks }: FooterSocialLinksProps) => (
  <div className="flex space-x-3">
    {socialLinks.map((social) => (
      <a
        key={social.name}
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={social.name}
        className="bg-primary-light hover:bg-accent transition-colors p-2 rounded-full"
      >
        {social.icon}
      </a>
    ))}
  </div>
);

export default FooterSocialLinks;