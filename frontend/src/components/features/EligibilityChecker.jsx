import { useState } from 'react';
import {
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '../../utils/helpers';

const EligibilityChecker = ({ job, student, className }) => {
  if (!job || !student) return null;

  const checks = [];

  // CGPA Check
  if (job.min_cgpa) {
    const passes = student.cgpa >= job.min_cgpa;
    checks.push({
      label: `CGPA ${job.min_cgpa}+`,
      passes,
      current: student.cgpa,
      required: job.min_cgpa
    });
  }

  // 10th Percentage
  if (job.min_tenth_percentage) {
    const passes = student.tenth_percentage >= job.min_tenth_percentage;
    checks.push({
      label: `10th ${job.min_tenth_percentage}%+`,
      passes,
      current: student.tenth_percentage,
      required: job.min_tenth_percentage
    });
  }

  // 12th Percentage
  if (job.min_twelfth_percentage) {
    const passes = student.twelfth_percentage >= job.min_twelfth_percentage;
    checks.push({
      label: `12th ${job.min_twelfth_percentage}%+`,
      passes,
      current: student.twelfth_percentage,
      required: job.min_twelfth_percentage
    });
  }

  // Backlogs
  if (job.max_backlogs !== null && job.max_backlogs !== undefined) {
    const passes = (student.backlogs || 0) <= job.max_backlogs;
    checks.push({
      label: job.max_backlogs === 0 ? 'No Backlogs' : `Max ${job.max_backlogs} Backlogs`,
      passes,
      current: student.backlogs || 0,
      required: job.max_backlogs
    });
  }

  // Batch Year
  if (job.allowed_batch_years?.length > 0) {
    const passes = job.allowed_batch_years.includes(student.batch_year);
    checks.push({
      label: `Batch ${job.allowed_batch_years.join('/')}`,
      passes,
      current: student.batch_year,
      required: job.allowed_batch_years.join(', ')
    });
  }

  // Degrees
  if (job.allowed_degrees?.length > 0) {
    const passes = job.allowed_degrees.includes(student.degree);
    checks.push({
      label: 'Allowed Degrees',
      passes,
      current: student.degree,
      required: job.allowed_degrees.join(', ')
    });
  }

  // Departments
  if (job.allowed_departments?.length > 0) {
    const passes = job.allowed_departments.some(d => d.id === student.department_id);
    checks.push({
      label: 'Department',
      passes,
      current: student.department?.name || 'N/A',
      required: job.allowed_departments.map(d => d.name).join(', ')
    });
  }

  const allPass = checks.every(c => c.passes);
  const passingCount = checks.filter(c => c.passes).length;

  if (checks.length === 0) {
    return (
      <div className={cn('p-4 bg-green-50 dark:bg-green-900/20 rounded-lg', className)}>
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">No specific eligibility criteria</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          All students can apply to this position.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border', className)}>
      {/* Summary Header */}
      <div
        className={cn(
          'p-4 flex items-center gap-3',
          allPass
            ? 'bg-green-50 dark:bg-green-900/20'
            : 'bg-red-50 dark:bg-red-900/20'
        )}
      >
        {allPass ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600" />
        )}
        <div>
          <p className={cn('font-medium', allPass ? 'text-green-700' : 'text-red-700')}>
            {allPass ? "You're eligible!" : "Not eligible"}
          </p>
          <p className="text-sm text-muted-foreground">
            {passingCount}/{checks.length} criteria met
          </p>
        </div>
      </div>

      {/* Criteria List */}
      <div className="p-4 space-y-3">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {check.passes ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-red-600" />
              )}
              <span className={cn('text-sm', !check.passes && 'text-red-600 font-medium')}>
                {check.label}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className={cn(!check.passes && 'text-red-600 font-medium')}>
                {check.current}
              </span>
              {!check.passes && (
                <span className="ml-1">
                  (need: {check.required})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Warning for non-eligible */}
      {!allPass && (
        <div className="p-4 border-t bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-start gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <p className="text-sm">
              You don't meet all the eligibility criteria. You may still apply, but your application might be reviewed differently.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EligibilityChecker;
