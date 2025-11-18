import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../cartStore';

describe('cartStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        type: 'test',
        name: 'Blood Test',
        price: 500,
        diagnosticCenterId: 'dc1',
        diagnosticCenterName: 'Lab 1',
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Blood Test');
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        type: 'test',
        name: 'Blood Test',
        price: 500,
        diagnosticCenterId: 'dc1',
        diagnosticCenterName: 'Lab 1',
      });
    });

    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should calculate total price', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        type: 'test',
        name: 'Test 1',
        price: 500,
        diagnosticCenterId: 'dc1',
        diagnosticCenterName: 'Lab 1',
      });
      result.current.addItem({
        id: '2',
        type: 'test',
        name: 'Test 2',
        price: 300,
        diagnosticCenterId: 'dc1',
        diagnosticCenterName: 'Lab 1',
      });
    });

    expect(result.current.getTotalPrice()).toBe(800);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        type: 'test',
        name: 'Test 1',
        price: 500,
        diagnosticCenterId: 'dc1',
        diagnosticCenterName: 'Lab 1',
      });
    });

    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });
});

