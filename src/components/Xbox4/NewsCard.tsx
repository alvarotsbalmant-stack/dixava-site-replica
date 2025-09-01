
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: number;
  type: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
}

interface NewsCardProps {
  news: NewsItem;
  index: number;
  className?: string;
}

const NewsCard = ({ news, index, className }: NewsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15, scale: 0.98 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05, 
        ease: "easeOut" 
      }}
      whileHover={{ 
        scale: 1.02,
        rotateY: 1,
        boxShadow: "0 0 25px -5px rgba(16, 124, 16, 0.7), 0 0 12px -8px rgba(16, 124, 16, 0.5)",
        borderColor: "#107C10",
        transition: { 
          duration: 0.15, 
          ease: "easeOut" 
        }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      className={cn(
        "group relative bg-black rounded-xl overflow-hidden border border-transparent cursor-pointer transform-gpu will-change-transform",
        "active:scale-95 md:active:scale-100",
        "w-full max-w-[280px] md:max-w-none",
        // Adicionando margin para evitar clipping das animações
        "mx-auto my-4 md:my-0",
        className
      )}
      style={{
        transformStyle: "preserve-3d",
        perspective: "800px",
        // Garantindo espaço para a animação
        margin: "16px auto",
      }}
    >
      <div className="relative aspect-video overflow-hidden">
        <motion.img 
          src={news.imageUrl} 
          alt={news.title}
          className="w-full h-full object-cover"
          whileHover={{ 
            scale: 1.06,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
        
        {news.type === 'trailer' && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            whileHover={{ 
              scale: 1.15,
              transition: { duration: 0.15, ease: "easeOut" }
            }}
          >
            <motion.div 
              className="w-10 h-10 rounded-full bg-[#107C10]/80 flex items-center justify-center md:w-16 md:h-16"
              whileHover={{
                backgroundColor: "rgba(16, 124, 16, 1)",
                boxShadow: "0 0 20px rgba(16, 124, 16, 0.8)",
                transition: { duration: 0.15 }
              }}
            >
              <Play className="w-5 h-5 text-white ml-1 md:w-8 md:h-8" />
            </motion.div>
          </motion.div>
        )}
        
        <div className="absolute top-2 left-2 z-10 md:top-3 md:left-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.15 }}
          >
            <Badge className={cn(
              "text-xs font-bold px-2 py-1 rounded-full shadow-md md:px-3",
              news.type === 'trailer' ? "bg-[#107C10] text-white" : 
              news.type === 'news' ? "bg-yellow-500 text-black" : 
              "bg-blue-500 text-white"
            )}>
              {news.type === 'trailer' ? 'TRAILER' : 
               news.type === 'news' ? 'NOVIDADE' : 'EVENTO'}
            </Badge>
          </motion.div>
        </div>
      </div>
      
      <div className="p-3 md:p-5">
        <motion.h3 
          className="font-bold text-sm mb-2 transition-colors duration-150 leading-tight md:text-lg"
          whileHover={{ 
            color: "#107C10",
            transition: { duration: 0.15 }
          }}
        >
          {news.title}
        </motion.h3>
        
        <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-normal md:text-sm md:mb-4">
          {news.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {news.date}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <Button 
              variant="ghost" 
              size="sm"
              className="text-[#107C10] hover:text-white hover:bg-[#107C10] transition-colors duration-150 hover:shadow-[0_0_15px_rgba(16,124,16,0.5)] text-xs px-2 py-1 h-8 md:text-sm md:px-4 md:py-2 md:h-9"
            >
              {news.type === 'trailer' ? 'Assistir' : 'Ler mais'}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsCard;
