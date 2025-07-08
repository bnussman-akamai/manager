import { getMinimumPayment } from './PaymentDrawer';

describe('Make a Payment Panel', () => {
  describe('getMinimumPayment helper method', () => {
    it('should return 5 if the balance due is 0', () => {
      expect(getMinimumPayment(0)).toBe('5.00');
    });

    it('should return the balance if the balance due is less than $5', () => {
      expect(getMinimumPayment(1.5)).toBe('1.50');
    });

    it('should return 5 if the balance due is less than 0', () => {
      expect(getMinimumPayment(-10.6)).toBe('5.00');
    });

    it('should return 5 if the balance due is greater than 5', () => {
      expect(getMinimumPayment(100000)).toBe('5.00');
    });
  });
});
