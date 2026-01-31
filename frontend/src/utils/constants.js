/**
 * Application constants
 */

export const USER_ROLES = {
    ADMIN: 'admin',
    DEPT_OFFICER: 'dept_officer',
    COORDINATOR: 'coordinator',
    STUDENT: 'student'
};

export const ROLE_LABELS = {
    admin: 'Administrator',
    dept_officer: 'Department Officer',
    coordinator: 'Coordinator',
    student: 'Student'
};

export const DEGREE_TYPES = [
    { value: 'BTech', label: 'B.Tech' },
    { value: 'MTech', label: 'M.Tech' },
    { value: 'MBA', label: 'MBA' },
    { value: 'MCA', label: 'MCA' },
    { value: 'BSc', label: 'B.Sc' },
    { value: 'MSc', label: 'M.Sc' },
    { value: 'BBA', label: 'BBA' },
    { value: 'BCA', label: 'BCA' }
];

export const JOB_TYPES = [
    { value: 'full_time', label: 'Full Time' },
    { value: 'internship', label: 'Internship' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' }
];

export const JOB_STATUS = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' },
    { value: 'cancelled', label: 'Cancelled' }
];

export const APPLICATION_STATUS = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'selected', label: 'Selected' },
    { value: 'offer_accepted', label: 'Offer Accepted' },
    { value: 'offer_rejected', label: 'Offer Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' }
];

export const INTERVIEW_TYPES = [
    { value: 'technical', label: 'Technical' },
    { value: 'hr', label: 'HR' },
    { value: 'aptitude', label: 'Aptitude' },
    { value: 'group_discussion', label: 'Group Discussion' },
    { value: 'final', label: 'Final' }
];

export const INTERVIEW_MODES = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'hybrid', label: 'Hybrid' }
];

export const WORK_MODES = [
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' }
];

export const ANNOUNCEMENT_TYPES = [
    { value: 'general', label: 'General' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'job_posting', label: 'Job Posting' },
    { value: 'event', label: 'Event' },
    { value: 'deadline', label: 'Deadline' }
];

export const PRIORITY_LEVELS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
];

export const BATCH_YEARS = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() + 2 - i
);

export const PROFICIENCY_LEVELS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
];
