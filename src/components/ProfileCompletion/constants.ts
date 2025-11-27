import { Linkedin, Github, Twitter, Globe, Instagram } from "lucide-react"

export const socialPlatforms = [
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/in/username"
  },
  {
    key: "github",
    label: "GitHub",
    icon: Github,
    placeholder: "https://github.com/username"
  },
  {
    key: "twitter",
    label: "Twitter/X",
    icon: Twitter,
    placeholder: "https://twitter.com/username"
  },
  {
    key: "website",
    label: "Personal Website",
    icon: Globe,
    placeholder: "https://yourwebsite.com"
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/username"
  }
] as const
