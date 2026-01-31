/**
 * Application constants
 */

// User roles
exports.USER_ROLES = {
    ADMIN: 'admin',
    DEPT_OFFICER: 'dept_officer',
    COORDINATOR: 'coordinator',
    STUDENT: 'student'
};

// User status
exports.USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
};

// Degree types
exports.DEGREE_TYPES = [
    'BTech',
    'MTech',
    'MBA',
    'MCA',
    'BSc',
    'MSc',
    'BBA',
    'BCA'
];

// Company status
exports.COMPANY_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

// Job types
exports.JOB_TYPES = {
    FULL_TIME: 'full_time',
    INTERNSHIP: 'internship',
    PART_TIME: 'part_time',
    CONTRACT: 'contract'
};

// Job status
exports.JOB_STATUS = {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    ACTIVE: 'active',
    CLOSED: 'closed',
    CANCELLED: 'cancelled'
};

// Application status
exports.APPLICATION_STATUS = {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    SHORTLISTED: 'shortlisted',
    REJECTED: 'rejected',
    INTERVIEW_SCHEDULED: 'interview_scheduled',
    SELECTED: 'selected',
    OFFER_ACCEPTED: 'offer_accepted',
    OFFER_REJECTED: 'offer_rejected',
    WITHDRAWN: 'withdrawn'
};

// Interview types
exports.INTERVIEW_TYPES = {
    TECHNICAL: 'technical',
    HR: 'hr',
    APTITUDE: 'aptitude',
    GROUP_DISCUSSION: 'group_discussion',
    FINAL: 'final'
};

// Interview modes
exports.INTERVIEW_MODES = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    HYBRID: 'hybrid'
};

// Interview status
exports.INTERVIEW_STATUS = {
    SCHEDULED: 'scheduled',
    RESCHEDULED: 'rescheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show'
};

// Announcement types
exports.ANNOUNCEMENT_TYPES = {
    GENERAL: 'general',
    URGENT: 'urgent',
    JOB_POSTING: 'job_posting',
    EVENT: 'event',
    DEADLINE: 'deadline'
};

// Announcement priority
exports.ANNOUNCEMENT_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

// Notification types
exports.NOTIFICATION_TYPES = {
    APPLICATION_UPDATE: 'application_update',
    INTERVIEW_SCHEDULED: 'interview_scheduled',
    ANNOUNCEMENT: 'announcement',
    PROFILE_UPDATE: 'profile_update',
    JOB_POSTED: 'job_posted',
    SYSTEM: 'system'
};
