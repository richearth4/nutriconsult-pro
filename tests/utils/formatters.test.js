import {
    calculateBMI,
    getBMIStatus,
    formatDate,
    formatNumber,
    capitalize,
    truncate
} from '../../assets/js/utils/formatters.js';
import { BMI_CATEGORIES } from '../../assets/js/utils/constants.js';

describe('Formatters Utility', () => {

    describe('calculateBMI', () => {
        test('should calculate BMI correctly', () => {
            expect(calculateBMI(70, 175)).toBeCloseTo(22.86, 2);
        });

        test('should return null for invalid inputs', () => {
            expect(calculateBMI(0, 175)).toBeNull();
            expect(calculateBMI(70, 0)).toBeNull();
            expect(calculateBMI(-70, 175)).toBeNull();
        });
    });

    describe('getBMIStatus', () => {
        test('should return correct category', () => {
            expect(getBMIStatus(18)).toEqual(BMI_CATEGORIES.UNDERWEIGHT);
            expect(getBMIStatus(22)).toEqual(BMI_CATEGORIES.NORMAL);
            expect(getBMIStatus(27)).toEqual(BMI_CATEGORIES.OVERWEIGHT);
            expect(getBMIStatus(32)).toEqual(BMI_CATEGORIES.OBESE);
        });

        test('should handle invalid input', () => {
            const status = getBMIStatus(0);
            expect(status.label).toBe('Unknown');
        });
    });

    describe('formatDate', () => {
        test('should format date for display', () => {
            const date = new Date('2023-01-01T12:00:00Z');
            // Testing exact string might depend on locale, checking partial
            expect(formatDate(date, 'display')).toContain('Jan');
            expect(formatDate(date, 'display')).toContain('2023');
        });

        test('should handle invalid date', () => {
            expect(formatDate('invalid')).toBe('Invalid Date');
        });
    });

    describe('String Utils', () => {
        test('capitalize should capitalize first letter', () => {
            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('WORLD')).toBe('World');
        });

        test('truncate should shorten string', () => {
            expect(truncate('hello world', 5)).toBe('he...');
            expect(truncate('short', 10)).toBe('short');
        });
    });
});
