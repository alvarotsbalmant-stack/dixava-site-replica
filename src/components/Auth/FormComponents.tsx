import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react';

// Professional Input Field with Icon and Validation
interface ProfessionalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const ProfessionalInput = forwardRef<HTMLInputElement, ProfessionalInputProps>(
  ({ label, icon, error, success, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label 
          htmlFor={props.id} 
          className="text-sm font-medium text-gray-700 flex items-center gap-2"
        >
          {icon}
          {label}
        </Label>
        
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              "h-12 pl-4 pr-4 rounded-xl border-2 transition-all duration-200",
              "focus:ring-2 focus:ring-offset-0",
              error 
                ? "border-red-300 focus:border-red-400 focus:ring-red-100" 
                : success
                ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                : "border-gray-200 focus:border-amber-400 focus:ring-amber-100",
              className
            )}
            {...props}
          />
          
          {/* Success/Error Icons */}
          {(error || success) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {error ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        
        {/* Helper Text or Error Message */}
        {(error || helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-xs flex items-center gap-1",
              error ? "text-red-600" : "text-gray-500"
            )}
          >
            {error && <AlertCircle className="w-3 h-3" />}
            {error || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

ProfessionalInput.displayName = "ProfessionalInput";

// Password Input with Toggle Visibility
interface PasswordInputProps extends Omit<ProfessionalInputProps, 'type'> {
  showPassword: boolean;
  onTogglePassword: () => void;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showPassword, onTogglePassword, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label 
          htmlFor={props.id} 
          className="text-sm font-medium text-gray-700 flex items-center gap-2"
        >
          {props.icon}
          {props.label}
        </Label>
        
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn(
              "h-12 pl-4 pr-12 rounded-xl border-2 transition-all duration-200",
              "focus:ring-2 focus:ring-offset-0",
              props.error 
                ? "border-red-300 focus:border-red-400 focus:ring-red-100" 
                : props.success
                ? "border-green-300 focus:border-green-400 focus:ring-green-100"
                : "border-gray-200 focus:border-amber-400 focus:ring-amber-100",
              className
            )}
            {...props}
          />
          
          {/* Password Toggle Button */}
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Helper Text or Error Message */}
        {(props.error || props.helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-xs flex items-center gap-1",
              props.error ? "text-red-600" : "text-gray-500"
            )}
          >
            {props.error && <AlertCircle className="w-3 h-3" />}
            {props.error || props.helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

// Professional Submit Button
interface ProfessionalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const ProfessionalButton = forwardRef<HTMLButtonElement, ProfessionalButtonProps>(
  ({ 
    loading = false, 
    loadingText = "Carregando...", 
    variant = 'primary',
    size = 'md',
    icon,
    children, 
    className, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = "font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2";
    
    const variantClasses = {
      primary: "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
      outline: "border-2 border-gray-200 hover:border-amber-400 text-gray-700 hover:text-amber-600"
    };
    
    const sizeClasses = {
      sm: "h-10 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg"
    };

    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </Button>
    );
  }
);

ProfessionalButton.displayName = "ProfessionalButton";

// Form Error Alert
interface FormErrorProps {
  message: string;
  onDismiss?: () => void;
}

export const FormError: React.FC<FormErrorProps> = ({ message, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
    >
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <p className="text-red-700 text-sm flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

// Form Success Alert
interface FormSuccessProps {
  message: string;
  onDismiss?: () => void;
}

export const FormSuccess: React.FC<FormSuccessProps> = ({ message, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
    >
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
      <p className="text-green-700 text-sm flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-400 hover:text-green-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

// Loading Overlay for Forms
export const FormLoadingOverlay: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm text-gray-600">Processando...</p>
      </div>
    </motion.div>
  );
};

// Divider with Text
interface DividerProps {
  text: string;
}

export const Divider: React.FC<DividerProps> = ({ text }) => {
  return (
    <div className="relative flex items-center justify-center my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative bg-white px-4">
        <span className="text-sm text-gray-500">{text}</span>
      </div>
    </div>
  );
};

// Social Login Button
interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'google' | 'facebook' | 'github';
  loading?: boolean;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ 
  provider, 
  loading = false, 
  className, 
  children,
  ...props 
}) => {
  const providerConfig = {
    google: {
      bg: "bg-white hover:bg-gray-50",
      border: "border-gray-300",
      text: "text-gray-700"
    },
    facebook: {
      bg: "bg-blue-600 hover:bg-blue-700",
      border: "border-blue-600",
      text: "text-white"
    },
    github: {
      bg: "bg-gray-900 hover:bg-gray-800",
      border: "border-gray-900",
      text: "text-white"
    }
  };

  const config = providerConfig[provider];

  return (
    <Button
      variant="outline"
      disabled={loading}
      className={cn(
        "h-12 w-full rounded-xl border-2 font-medium transition-all duration-200",
        config.bg,
        config.border,
        config.text,
        loading && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        children
      )}
    </Button>
  );
};

