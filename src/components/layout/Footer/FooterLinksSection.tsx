import { Link } from "react-router-dom";
import { FooterLink } from "../../../data/footerLinks";

interface FooterLinksSectionProps {
  title: string;
  links: FooterLink[];
}

const FooterLinksSection = ({ title, links }: FooterLinksSectionProps) => (
  <div>
    <h4 className="font-semibold mb-4 text-lg">{title}</h4>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.title}>
          {link.external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-accent-200 text-sm flex items-center"
            >
              {link.icon}
              {link.title}
            </a>
          ) : (
            <Link
              to={link.href}
              className="text-gray-300 hover:text-accent-200 text-sm flex items-center"
            >
              {link.icon}
              {link.title}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default FooterLinksSection;