import {expect, type MockedFunction, test, vi} from "vitest";
import axios from "axios";
import type {Employee} from "../types/people";
import {fireEvent, render, type RenderResult, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import store from "../redux/store.ts";
import {BrowserRouter} from "react-router";
import Employeelist from "./Employeelist.tsx";
import {EMP_1} from "../testutils/testData.ts";

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

async function waitForDataToBeLoaded(renderResult: RenderResult) {
    await waitFor(async () => {
        const tableItem = await renderResult.findAllByText("John Doe");
        expect(tableItem.length).toEqual(1);
    }, {timeout: 3000})
}

test('renders empty employee list', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [] as Employee[]}
    )
    const renderResult = render(<Provider store={store}><BrowserRouter><Employeelist/></BrowserRouter></Provider>);
    await waitFor(async () => {
        const tableItem = await renderResult.findAllByText("employeelist.table.empty");
        expect(tableItem.length).toEqual(1);
    }, {timeout: 3000})
    expect(renderResult).toMatchSnapshot();
})

test('renders employee list', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [EMP_1] as Employee[]}
    )
    const renderResult = render(<Provider store={store}><BrowserRouter><Employeelist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);
    expect(renderResult).toMatchSnapshot();
});

test('can search employees', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [EMP_1] as Employee[]}
    )
    const renderResult = render(<Provider store={store}><BrowserRouter><Employeelist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    const querySelector = renderResult.container.querySelector('#search');
    expect(querySelector).not.toBeNull()
    if (querySelector !== null) {
        fireEvent.change(querySelector, {target: {value: 'John'}})
        const findByText = await renderResult.findAllByText("John Doe");
        expect(findByText.length).toEqual(1);
        fireEvent.change(querySelector, {target: {value: 'foe'}})
        expect(() => {
            renderResult.getByText("John Doe");
        }).toThrow()
    }
})

test('filter on department', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [EMP_1, {...EMP_1, id: '2', firstName: 'Jane', department: 'IT'}] as Employee[]}
    )

    const renderResult = render(<Provider store={store}><BrowserRouter><Employeelist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    expect(() => {
        renderResult.getByText("Jane Doe");
    }).not.toThrow()
    const result = await renderResult.findAllByText('employeelist.filter.department.engineering');
    fireEvent.click(result[0]);
    expect(() => {
        renderResult.getByText("Jane Doe");
    }).toThrow()
})

test('sort on department', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [EMP_1, {...EMP_1, id: '2', firstName: 'Jane', department: 'IT'}] as Employee[]}
    )
    const renderResult = render(<Provider store={store}><BrowserRouter><Employeelist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    const departmentHeader = await renderResult.findByText('employeelist.table_headers.department :');
    fireEvent.click(departmentHeader);
    expect(renderResult).toMatchSnapshot();
    fireEvent.click(departmentHeader);
    expect(renderResult).toMatchSnapshot();
})

test('delete employee', async () => {
    (axios.request as MockedFunction<typeof axios.request>).mockResolvedValue(
        {data: [EMP_1, {...EMP_1, id: '2', firstName: 'Jane', department: 'IT'}] as Employee[]}
    )
    const renderResult = render(<Provider store={store}><BrowserRouter><Employeelist/></BrowserRouter></Provider>);
    await waitForDataToBeLoaded(renderResult);

    const deleteButton = renderResult.container.querySelector("#delete-1");
    expect(deleteButton).not.toBeNull();
    fireEvent.click(deleteButton!);
    expect(renderResult).toMatchSnapshot();
})
