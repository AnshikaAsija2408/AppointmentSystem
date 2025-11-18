import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

interface Footer7Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Services",
    links: [
      { name: "Book Appointment", href: "/dashboard" },
      { name: "Manage Bookings", href: "/bookings" },
      { name: "Calendar View", href: "/calendar" },
      { name: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Team", href: "/team" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/help" },
      { name: "FAQ", href: "/faq" },
      { name: "Contact Support", href: "/support" },
      { name: "Documentation", href: "/docs" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
];

export const Footer7 = ({
  logo = {
    url: "/",
    src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center",
    alt: "AppointmentHub logo",
    title: "AppointmentHub",
  },
  sections = defaultSections,
  description = "Your one-stop solution for managing appointments efficiently. Book, schedule, and manage all your appointments in one place.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2025 AppointmentHub. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <section className="py-8 md:py-16 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              </a>
              <h2 className="text-xl font-semibold">{logo.title}</h2>
            </div>
            <p className="max-w-full text-sm text-muted-foreground md:max-w-[70%]">
              {description}
            </p>
            <ul className="flex items-center space-x-4 text-muted-foreground md:space-x-6">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-primary">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold">{section.title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground md:space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} className="font-medium hover:text-primary">
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row md:space-x-4">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-primary">
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
