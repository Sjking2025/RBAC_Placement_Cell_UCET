/**
 * Helper utilities
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to display string
 */
export function formatDate(date, options = {}) {
    if (!date) return '';

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };

    return new Date(date).toLocaleDateString('en-IN', defaultOptions);
}

/**
 * Format date with time
 */
export function formatDateTime(date) {
    if (!date) return '';

    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format currency (INR)
 */
export function formatCurrency(amount, currency = 'INR') {
    if (!amount) return '₹0';

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format salary in LPA
 */
export function formatSalaryLPA(min, max) {
    if (!min && !max) return 'Not disclosed';

    const formatLPA = (val) => {
        if (val >= 100000) {
            return `${(val / 100000).toFixed(1)} LPA`;
        }
        return `₹${val.toLocaleString('en-IN')}`;
    };

    if (min && max && min !== max) {
        return `${formatLPA(min)} - ${formatLPA(max)}`;
    }

    return formatLPA(min || max);
}

/**
 * Get initials from name
 */
export function getInitials(firstName, lastName) {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || '??';
}

/**
 * Truncate text
 */
export function truncate(text, length = 100) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Get status badge color
 */
export function getStatusColor(status) {
    const colors = {
        // Application status
        submitted: 'bg-blue-100 text-blue-800',
        under_review: 'bg-yellow-100 text-yellow-800',
        shortlisted: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        interview_scheduled: 'bg-purple-100 text-purple-800',
        selected: 'bg-green-100 text-green-800',
        offer_accepted: 'bg-green-100 text-green-800',
        offer_rejected: 'bg-gray-100 text-gray-800',
        withdrawn: 'bg-gray-100 text-gray-800',

        // Job status
        draft: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-blue-100 text-blue-800',
        active: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800',

        // Company status
        inactive: 'bg-gray-100 text-gray-800',

        // Interview status
        scheduled: 'bg-blue-100 text-blue-800',
        rescheduled: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        no_show: 'bg-red-100 text-red-800',

        // Default
        default: 'bg-gray-100 text-gray-800'
    };

    return colors[status] || colors.default;
}

/**
 * Format status text
 */
export function formatStatus(status) {
    if (!status) return '';
    return status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(deadline) {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(date) {
    if (!date) return '';

    const now = new Date();
    const then = new Date(date);
    const diff = now - then;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}
