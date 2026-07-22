import customerSlice, {
    type CustomerState,
    EMPTY_CUST,
    loadCustomers,
    loadSingleCustomer,
    resetSingleCustomer
} from "./customer.slice.ts";
import {describe, expect} from "vitest";
import {test} from "@vitest/runner";

const initialState: CustomerState = {
    customers: [],
    selectedCustomer: EMPTY_CUST
}

describe('Customer slice', () => {
    test('Initial state', async () => {
        const customerSliceInit = customerSlice.reducer(initialState, {type: 'unknown'})
        expect(customerSliceInit).toBe(initialState)
    })
    test('loadCustomers', async () => {
        const customerSliceInit = customerSlice.reducer(initialState, loadCustomers([EMPTY_CUST]))
        expect(customerSliceInit).toEqual({customers: [EMPTY_CUST], selectedCustomer: EMPTY_CUST})
    })
    test('loadSingleCustomer', async () => {
        const customerSliceInit = customerSlice.reducer(initialState, loadSingleCustomer({
            ...EMPTY_CUST,
            companyName: "test"
        }))
        expect(customerSliceInit).toEqual({customers: [], selectedCustomer: {...EMPTY_CUST, companyName: "test"}})
    })
    test('resetSingleCustomer', async () => {
        const customerSliceInit = customerSlice.reducer({
            ...initialState,
            selectedCustomer: {...EMPTY_CUST, companyName: "test"}
        }, resetSingleCustomer())
        expect(customerSliceInit).toEqual({customers: [], selectedCustomer: EMPTY_CUST})
    })

})

