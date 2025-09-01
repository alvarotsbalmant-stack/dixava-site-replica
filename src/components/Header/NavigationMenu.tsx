
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNavigationItems } from '@/hooks/useNavigationItems';
import { cn } from '@/lib/utils';

const NavigationMenu = () => {
  const navigate = useNavigate();
  const { items: navigationItems, loading: isLoading } = useNavigationItems();

  const handleNavClick = (item: any) => {
    if (item.link_type === 'external') {
      window.open(item.link_url, '_blank');
    } else {
      navigate(item.link_url);
    }
  };

  if (isLoading || !navigationItems?.length) {
    return null;
  }

  return (
    <nav className="hidden lg:flex items-center justify-center gap-2 px-4">
      {navigationItems.map((item) => (
        <motion.button
          key={item.id}
          onClick={() => handleNavClick(item)}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out",
            "hover:scale-105 hover:shadow-lg active:scale-95"
          )}
          style={{
            backgroundColor: item.background_color,
            color: item.text_color,
          }}
          whileHover={{
            backgroundColor: item.hover_background_color || item.background_color,
            color: item.hover_text_color || item.text_color,
            scale: 1.05,
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Icon with rotation animation */}
          {item.icon_url && (
            <motion.span 
              className="text-lg"
              whileHover={{ rotate: 360 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeInOut" 
              }}
            >
              {item.icon_type === 'emoji' ? (
                item.icon_url
              ) : item.icon_type === 'image' ? (
                <img src={item.icon_url} alt="" className="w-5 h-5" />
              ) : (
                <i className={item.icon_url} />
              )}
            </motion.span>
          )}
          
          {/* Title */}
          <span className="whitespace-nowrap">{item.title}</span>

          {/* Hover effect overlay */}
          <motion.div
            className="absolute inset-0 rounded-lg opacity-0"
            style={{
              background: `linear-gradient(135deg, ${item.hover_background_color || item.background_color}40, ${item.hover_background_color || item.background_color}20)`,
            }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        </motion.button>
      ))}
    </nav>
  );
};

export default NavigationMenu;
