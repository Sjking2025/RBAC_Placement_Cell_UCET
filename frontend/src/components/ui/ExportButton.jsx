import { useState } from 'react';
import { Download, Loader2, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from './Button';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Export Button component for downloading CSV/Excel files
 */
const ExportButton = ({
  endpoint,
  filename,
  label = 'Export',
  params = {},
  variant = 'outline',
  size = 'default',
  icon = 'download',
  className
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query string
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = icon === 'spreadsheet' ? FileSpreadsheet : 
                        icon === 'file' ? FileText : Download;

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <IconComponent className="h-4 w-4 mr-2" />
      )}
      {label}
    </Button>
  );
};

/**
 * Preset export buttons for common exports
 */
const ExportStudentsButton = (props) => (
  <ExportButton
    endpoint="/export/students"
    filename="students_export.csv"
    label="Export Students"
    icon="spreadsheet"
    {...props}
  />
);

const ExportPlacementsButton = (props) => (
  <ExportButton
    endpoint="/export/placements"
    filename="placements_export.csv"
    label="Export Placements"
    icon="spreadsheet"
    {...props}
  />
);

const ExportCompaniesButton = (props) => (
  <ExportButton
    endpoint="/export/companies"
    filename="companies_export.csv"
    label="Export Companies"
    icon="spreadsheet"
    {...props}
  />
);

const ExportAnalyticsButton = (props) => (
  <ExportButton
    endpoint="/export/analytics"
    filename="analytics_summary.csv"
    label="Export Report"
    icon="file"
    {...props}
  />
);

export {
  ExportButton,
  ExportStudentsButton,
  ExportPlacementsButton,
  ExportCompaniesButton,
  ExportAnalyticsButton
};

export default ExportButton;
