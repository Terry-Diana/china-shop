import { useState } from "react";
import { Mail } from "lucide-react";
import Logo from "../../ui/Logo";

interface FooterNewsletterProps {
  description: string;
}

const FooterNewsletter = ({ description }: FooterNewsletterProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Thank you for subscribing!");
      setEmail("");
    }, 1500);
  };

  return (
    <div>
      <Logo className="h-8 w-auto mb-4" />
      <p className="text-sm text-gray-300 mb-4">{description}</p>
      <h4 className="font-semibold mb-3">Subscribe to our newsletter</h4>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex">
          <input
            type="email"
            placeholder="Your email address"
            className="px-3 py-2 text-sm flex-grow bg-primary-light text-white rounded-l-md focus:outline-none"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-dark px-4 py-2 rounded-r-md transition-colors disabled:opacity-75"
            disabled={isSubmitting}
            aria-label="Subscribe"
          >
            <Mail size={18} />
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </form>
    </div>
  );
};

export default FooterNewsletter;