import {expect, type MockedFunction, test, vi} from "vitest";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import store from "../redux/store.ts";
import {BrowserRouter, useParams} from "react-router";
import SingleCustomer from "./SingleCustomer.tsx";
import axios from "axios";
import {CUST_1} from "../testutils/testData.ts";
import {CustomerStatus, Sector} from "../types/people";
import {selectSelectedCustomer} from "../redux/customer.slice.ts";
import moment from "moment";
import ErrorMessagePopup from "../components/ErrorMessagePopup.tsx";
import {changeInputValue, changeSelectValue} from "../testutils/testUtils.ts";

vi.mock('moment', async () => {
    const actual = await vi.importActual('moment');
    return {
        ...actual,
        // @ts-expect-error default exists
        default: vi.fn((input) => typeof input !== "undefined" ? actual.default(input) : actual.default('2026-07-20T12:00:00.000Z'))
    };
});

vi.mock('axios', () => {
    return {
        default: {
            defaults: {baseURL: 'http://localhost:8080'},
            post: vi.fn(),
            get: vi.fn(),
            delete: vi.fn(),
            put: vi.fn(),
            create: vi.fn().mockReturnThis(),
            request: vi.fn(),
            interceptors: {
                request: {
                    use: vi.fn(),
                    eject: vi.fn(),
                },
                response: {
                    use: vi.fn(),
                    eject: vi.fn(),
                },
            },
        },
    };
});

vi.mock('react-i18next', async (importOriginal) => {

    const actual = await importOriginal<typeof import('react-i18next')>();

    return {
        ...actual,
        useTranslation: () => {
            return {
                t: vi.fn((key) => key),
                i18n: {
                    resolvedLanguage: 'en',
                    changeLanguage: vi.fn(),
                }
            }
        },
    }
});

vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>();
    return {
        ...actual,
        useParams: vi.fn(() => ({customerId: undefined}))
    }
});

test('render single customer page', async () => {
    const renderResult = render(<Provider store={store.store}><BrowserRouter><SingleCustomer/></BrowserRouter></Provider>);
    expect(renderResult).toMatchSnapshot();
})

test('change form values', async () => {
    const renderResult = render(<Provider store={store.store}><BrowserRouter><SingleCustomer/></BrowserRouter></Provider>);
    await changeInputValue(renderResult, 'single_customer.labels.company_name *', 'Company X');
    let selectedCustomer = selectSelectedCustomer(store.store.getState());
    expect(selectedCustomer.companyName).toBe('Company X')
    await changeInputValue(renderResult, 'single_customer.labels.contact_person_first_name *', 'Jane');
    selectedCustomer = selectSelectedCustomer(store.store.getState());
    expect(selectedCustomer.contactPersonFirstName).toBe('Jane')
    await changeInputValue(renderResult, 'single_customer.labels.contact_person_last_name *', 'Roe');
    selectedCustomer = selectSelectedCustomer(store.store.getState());
    expect(selectedCustomer.contactPersonLastName).toBe('Roe')
    await changeSelectValue(renderResult, 'single_customer.labels.sector', "Government");
    selectedCustomer = selectSelectedCustomer(store.store.getState());
    expect(selectedCustomer.sector).toBe(Sector.Government)
    await changeSelectValue(renderResult, 'single_customer.labels.status', "Inactive");
    selectedCustomer = selectSelectedCustomer(store.store.getState());
    expect(selectedCustomer.status).toBe(CustomerStatus.Inactive)
    await changeInputValue(renderResult, 'single_customer.labels.email *', 'jane@doe.com');
    selectedCustomer = selectSelectedCustomer(store.store.getState());
    expect(selectedCustomer.email).toBe('jane@doe.com')
    await changeInputValue(renderResult, 'single_customer.labels.phone', '+32 477 77 77 77');
    selectedCustomer = selectSelectedCustomer(store.store.getState());
    expect(selectedCustomer.phone).toBe('+32 477 77 77 77')
    await changeInputValue(renderResult, 'single_customer.labels.customer_since *', '2026-07-19');
    selectedCustomer = selectSelectedCustomer(store.store.getState());
    expect(moment(selectedCustomer.startDate).format("YYYY-MM-DD")).toBe("2026-07-19")
    await changeInputValue(renderResult, 'single_customer.labels.city', 'Amsterdam');
    selectedCustomer = selectSelectedCustomer(store.store.getState());
    expect(selectedCustomer.city).toBe("Amsterdam")
    await changeInputValue(renderResult, 'single_customer.labels.website', 'www.companyx.com');
    selectedCustomer = selectSelectedCustomer(store.store.getState());
    expect(selectedCustomer.website).toBe("www.companyx.com")

}, 50000)

test('Save customer', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;

    const renderResult = render(<Provider
        store={store.store}><BrowserRouter><ErrorMessagePopup/><SingleCustomer/></BrowserRouter></Provider>);
    const saveButton = await renderResult.findByText('single_customer.save');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_customer.input.error.company_name_required'))
    await changeInputValue(renderResult, 'single_customer.labels.company_name *', 'Company X');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_customer.input.error.contact_person_first_name_required'))
    await changeInputValue(renderResult, 'single_customer.labels.contact_person_first_name *', 'Jane');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_customer.input.error.contact_person_last_name_required'))
    await changeInputValue(renderResult, 'single_customer.labels.contact_person_last_name *', 'Roe');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_customer.input.error.email_required'))
    await changeInputValue(renderResult, 'single_customer.labels.email *', 'invalid_email');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_customer.input.error.email_invalid'))
    await changeInputValue(renderResult, 'single_customer.labels.email *', 'jane@doe.com');
    await changeInputValue(renderResult, 'single_customer.labels.phone', 'invalid_phone');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_customer.input.error.phone_invalid'))
    await changeInputValue(renderResult, 'single_customer.labels.phone', '+32 477 77 77 77');
    await changeInputValue(renderResult, 'single_customer.labels.customer_since *', '');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_customer.input.error.startDate'))
    await changeInputValue(renderResult, 'single_customer.labels.customer_since *', '2026-07-19');

    const selectedCustomer = selectSelectedCustomer(store.store.getState());
    axiosCalls.mockResolvedValueOnce(({
        data: selectedCustomer
    }))
    fireEvent.click(saveButton);
})

test('Edit customer', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: {...CUST_1, id: '2', firstName: 'Jane'}}
    )
    const useParamsCalls = useParams as MockedFunction<typeof useParams>;
    useParamsCalls.mockReturnValue({customerId: '2'})
    const renderResult = render(<Provider
        store={store.store}><BrowserRouter><ErrorMessagePopup/><SingleCustomer/></BrowserRouter></Provider>);
    const saveButton = await renderResult.findByText('single_customer.save');
    await changeInputValue(renderResult, 'single_customer.labels.company_name *', 'Company X');
    await changeInputValue(renderResult, 'single_customer.labels.contact_person_first_name *', 'Jane');
    await changeInputValue(renderResult, 'single_customer.labels.contact_person_last_name *', 'Roe');
    await changeInputValue(renderResult, 'single_customer.labels.email *', 'jane@doe.com');
    await changeInputValue(renderResult, 'single_customer.labels.phone', '+32 477 77 77 77');
    await changeInputValue(renderResult, 'single_customer.labels.customer_since *', '2026-07-19');

    const selectedCustomer = selectSelectedCustomer(store.store.getState());
    axiosCalls.mockResolvedValueOnce(({
        data: selectedCustomer
    }))
    fireEvent.click(saveButton);
})