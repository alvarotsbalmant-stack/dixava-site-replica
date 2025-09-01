
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

// Interface for the banner data (props)
interface PromotionalBannerProps {
  imageUrl: string;
  title: string;
  description: string; // Keep description for desktop
  buttonText: string;
  buttonLink: string;
  backgroundColor?: string; // Optional background color override
  textColor?: string; // Optional text color override
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  imageUrl,
  title,
  description,
  buttonText,
  buttonLink,
  backgroundColor = 'bg-gradient-to-r from-uti-dark to-uti-dark/90',
  textColor = 'text-white'
}) => {
  return (
    <div className={cn(
      "rounded-lg overflow-hidden shadow-lg my-6 md:my-8", // Margin top/bottom
      backgroundColor
    )}>
      {/* Desktop layout - Text on left, No Image */}
      <div className="hidden md:flex flex-row items-center">
        {/* Text Content Area */}
        <div className={cn(
          "flex-grow flex flex-col justify-center",
          "p-6 lg:p-8" // Reduced padding for desktop (was p-8 lg:p-10)
        )}>
          <h2 className={cn(
            "text-2xl lg:text-3xl font-bold mb-2", // Slightly smaller text size
            textColor
          )}>
            {title}
          </h2>
          <p className={cn(
            "text-base mb-4 opacity-90", // Slightly smaller text size
            textColor
          )}>
            {description}
          </p>
          <a href={buttonLink} target="_blank" rel="noopener noreferrer" className="self-start mt-auto">
            <Button 
              variant="outline" 
              size="default" // Keep button size
              className={cn(
                "bg-transparent border-white/80 hover:bg-white/10 active:bg-white/20",
                textColor
              )}
            >
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
      
      {/* Mobile layout - Remains unchanged */}
      <div className="flex md:hidden flex-col">
        {/* Text Content Area - Takes full width */}
        <div className={cn(
          "flex flex-col justify-center items-start", // Align items to start (left)
          "p-4 py-3" // Reduced padding for mobile, making it more rectangular
        )}>
          <h2 className={cn(
            "text-base font-bold mb-1", // Smaller text for mobile
            textColor
          )}>
            {title}
          </h2>
          {/* Description is implicitly removed as it's not rendered here */}
          <a href={buttonLink} target="_blank" rel="noopener noreferrer" className="self-start mt-1">
            <Button 
              variant="outline" 
              size="sm" // Changed from "xs" to "sm" as "xs" is not a valid size
              className={cn(
                "bg-transparent border-white/80 hover:bg-white/10 active:bg-white/20",
                "text-xs px-2 py-1 h-6", // Custom styling to make it smaller
                textColor
              )}
            >
              {buttonText}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;

