import { beforeEach, describe, expect, it } from 'vitest';

import { useFilterStore } from '@/store/filterStore';

describe('filterStore', () => {
  beforeEach(() => {
    useFilterStore.setState({ active: {} });
  });

  it('adds and removes categorical filters', () => {
    useFilterStore.getState().setCategoricalFilter('customer_region', ['North', 'South']);
    expect(useFilterStore.getState().active.customer_region).toEqual(['North', 'South']);
    expect(useFilterStore.getState().activeCount()).toBe(1);

    useFilterStore.getState().clearFilter('customer_region');
    expect(useFilterStore.getState().active).toEqual({});
  });

  it('clears a categorical filter when set to an empty selection', () => {
    useFilterStore.getState().setCategoricalFilter('product_category', ['Books']);
    useFilterStore.getState().setCategoricalFilter('product_category', []);

    expect(useFilterStore.getState().active).toEqual({});
  });

  it('tracks numeric/date ranges and clear-all state', () => {
    useFilterStore.getState().setNumericFilter('quantity', [2, 8]);
    useFilterStore.getState().setNumericFilter('order_date', [1704067200000, 1711843200000]);

    expect(useFilterStore.getState().hasActiveFilters()).toBe(true);
    expect(useFilterStore.getState().activeCount()).toBe(2);

    useFilterStore.getState().clearAll();
    expect(useFilterStore.getState().active).toEqual({});
    expect(useFilterStore.getState().hasActiveFilters()).toBe(false);
  });
});
