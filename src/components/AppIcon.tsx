import React from 'react';
import {
  Instagram,
  Youtube,
  MessageSquare,
  Gamepad2,
  Flame,
  Facebook,
  Camera,
  Film,
  Tv,
  Compass,
  Hash,
  Send,
  Package,
} from 'lucide-react';

interface Props {
  iconName: string;
  className?: string;
}

export const AppIcon: React.FC<Props> = ({ iconName, className = 'w-5 h-5 text-white' }) => {
  switch (iconName.toLowerCase()) {
    case 'instagram':
      return <Instagram className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'messagesquare':
    case 'whatsapp':
      return <MessageSquare className={className} />;
    case 'gamepad2':
    case 'gamepad':
      return <Gamepad2 className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'camera':
    case 'snapchat':
      return <Camera className={className} />;
    case 'film':
    case 'reels':
      return <Film className={className} />;
    case 'tv':
    case 'netflix':
      return <Tv className={className} />;
    case 'compass':
    case 'chrome':
      return <Compass className={className} />;
    case 'hash':
    case 'twitter':
      return <Hash className={className} />;
    case 'send':
    case 'telegram':
      return <Send className={className} />;
    default:
      return <Package className={className} />;
  }
};
