import { cn } from '../../utils/helpers';
import { Check, X, AlertCircle, Info, CheckCircle2, XCircle } from 'lucide-react';

const variants = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-green-500/10 text-green-600 dark:text-green-400',
  warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  error: 'bg-red-500/10 text-red-600 dark:text-red-400',
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
};

const icons = {
  default: null,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
  info: Info
};

/**
 * Alert/Notice component
 */
const Alert = ({
  variant = 'default',
  title,
  children,
  className,
  icon: CustomIcon,
  dismissible,
  onDismiss
}) => {
  const IconComponent = CustomIcon || icons[variant];

  return (
    <div className={cn(
      "rounded-lg p-4",
      variants[variant],
      className
    )}>
      <div className="flex">
        {IconComponent && (
          <div className="flex-shrink-0">
            <IconComponent className="h-5 w-5" />
          </div>
        )}
        <div className={cn("flex-1", IconComponent && "ml-3")}>
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          {children && (
            <div className={cn("text-sm", title && "mt-1 opacity-90")}>
              {children}
            </div>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-4 inline-flex rounded-md hover:opacity-70 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Success alert shorthand
 */
const SuccessAlert = ({ title, children, ...props }) => (
  <Alert variant="success" title={title} {...props}>{children}</Alert>
);

/**
 * Warning alert shorthand
 */
const WarningAlert = ({ title, children, ...props }) => (
  <Alert variant="warning" title={title} {...props}>{children}</Alert>
);

/**
 * Error alert shorthand
 */
const ErrorAlert = ({ title, children, ...props }) => (
  <Alert variant="error" title={title} {...props}>{children}</Alert>
);

/**
 * Info alert shorthand
 */
const InfoAlert = ({ title, children, ...props }) => (
  <Alert variant="info" title={title} {...props}>{children}</Alert>
);

export { Alert, SuccessAlert, WarningAlert, ErrorAlert, InfoAlert };
export default Alert;
