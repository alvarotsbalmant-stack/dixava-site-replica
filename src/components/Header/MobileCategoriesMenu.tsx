
import { categories, Category } from './categories';
import { cn } from '@/lib/utils';

interface MobileCategoriesMenuProps {
  showCategories: boolean;
  onCategoryClick: (category: Category) => void;
}

const MobileCategoriesMenu = ({ showCategories, onCategoryClick }: MobileCategoriesMenuProps) => {
  if (!showCategories) return null;

  return (
    <div className="lg:hidden border-t border-gray-200 bg-gray-50">
      <div className="container-professional py-4">
        <div className="grid grid-cols-2 gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category)}
              className={cn(
                "text-left py-2 px-3 text-sm font-medium text-uti-dark rounded-md",
                // Apply hover effects only on desktop (md and above) - REMOVED hover effects for mobile
                "md:hover:text-uti-red md:hover:bg-red-50 md:transition-all md:duration-200"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileCategoriesMenu;
