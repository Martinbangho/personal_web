export interface SocialLink {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const socialLinks: SocialLink[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'fab fa-facebook-f',
    href: 'https://www.facebook.com/profile.php?id=100010412142790',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'fab fa-instagram',
    href: 'https://www.instagram.com/johniq_/',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'fab fa-linkedin-in',
    href: 'https://www.linkedin.com/in/mbangho/',
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: 'fab fa-discord',
    href: 'https://discord.com/users/170603121167433740',
  },
];
