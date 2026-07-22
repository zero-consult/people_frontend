import {expect, type MockedFunction, test, vi} from "vitest";
import axios from "axios";
import type {Customer} from "../types/people";
import {fireEvent, render, type RenderResult, waitFor} from "@testing-library/react";
import Customerlist from "./Customerlist.tsx";
import store from "../redux/store.ts";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router";
import {CUST_1} from "../testutils/testData.ts";

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

test('renders empty customer list', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [] as Customer[]}
    )
    const renderResult = render(<Provider store={store}><BrowserRouter><Customerlist/></BrowserRouter></Provider>);
    await waitFor(async () => {
        const tableItem = await renderResult.findAllByText("customerlist.table.empty");
        expect(tableItem.length).toEqual(1);
    }, {timeout: 3000})
    expect(renderResult).toMatchSnapshot();
})

test('renders customer list', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [CUST_1] as Customer[]}
    )
    const renderResult = render(<Provider store={store}><BrowserRouter><Customerlist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);
    expect(renderResult).toMatchSnapshot();
});

async function waitForDataToBeLoaded(renderResult: RenderResult) {
    await waitFor(async () => {
        const tableItem = await renderResult.findAllByText("Jane Doe");
        expect(tableItem.length).toEqual(1);
    }, {timeout: 3000})
}

test('can search customers', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [CUST_1] as Customer[]}
    )
    const renderResult = render(<Provider store={store}><BrowserRouter><Customerlist/></BrowserRouter></Provider>);

    await waitForDataToBeLoaded(renderResult);

    const querySelector = renderResult.container.querySelector('#search');
    expect(querySelector).not.toBeNull()
    if (querySelector !== null) {
        fireEvent.change(querySelector, {target: {value: 'Jane'}})
        const findByText = await renderResult.findAllByText("Jane Doe");
        expect(findByText.length).toEqual(1);
        fireEvent.change(querySelector, {target: {value: 'foe'}})
        expect(() => {
            renderResult.getByText("Jane Doe");
        }).toThrow()
    }
})

test('filter on sector', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [CUST_1, {...CUST_1, id: '2', contactPersonFirstName: 'John', sector: "Government"}] as Customer[]}
    )

    const renderResult = render(<Provider store={store}><BrowserRouter><Customerlist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    expect(() => {
        renderResult.getByText("Jane Doe");
    }).not.toThrow()
    const result = await renderResult.findAllByText('customerlist.filter.sector.government');
    fireEvent.click(result[0]);
    expect(() => {
        renderResult.getByText("Jane Doe");
    }).toThrow()
})

test('sort on sector', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [CUST_1, {...CUST_1, id: '2', contactPersonFirstName: 'John', sector: "Government"}] as Customer[]}
    )
    const renderResult = render(<Provider store={store}><BrowserRouter><Customerlist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    const departmentHeader = await renderResult.findByText('customerlist.table_headers.sector :');
    fireEvent.click(departmentHeader);
    expect(renderResult).toMatchSnapshot();
    fireEvent.click(departmentHeader);
    expect(renderResult).toMatchSnapshot();
})

test('delete customer', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [CUST_1, {...CUST_1, id: '2', contactPersonFirstName: 'John', sector: "Government"}] as Customer[]}
    )
    const renderResult = render(<Provider store={store}><BrowserRouter><Customerlist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    const deleteButton = renderResult.container.querySelector("#delete-1");
    expect(deleteButton).not.toBeNull();
    fireEvent.click(deleteButton!);
    expect(renderResult).toMatchSnapshot();
})