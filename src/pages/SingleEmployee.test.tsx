import {expect, type MockedFunction, test, vi} from "vitest";
import {fireEvent, render, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import store from "../redux/store.ts";
import {BrowserRouter, useParams} from "react-router";
import SingleEmployee from "./SingleEmployee.tsx";
import axios from "axios";
import {EMP_1} from "../testutils/testData.ts";
import {Department, type Employee, EmployeeStatus} from "../types/people";
import {selectSelectedEmployee} from "../redux/employee.slice.ts";
import moment from "moment";
import ErrorMessagePopup from "../components/ErrorMessagePopup.tsx";
import {changeInputValue, changeSelectValue} from "../testutils/testUtils.ts";

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
        useParams: vi.fn(() => ({employeeId: undefined}))
    }
});

vi.mock('moment', async () => {
    const actual = await vi.importActual('moment');
    return {
        ...actual,
        // @ts-expect-error default exists
        default: vi.fn((input) => typeof input !== "undefined" ? actual.default(input) : actual.default('2026-07-20T12:00:00.000Z'))
    };
});

test('render single employee page', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValue(
        {data: [EMP_1] as Employee[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><SingleEmployee/></BrowserRouter></Provider>);
    expect(renderResult).toMatchSnapshot();
})


test('change form values', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValue(
        {data: [EMP_1] as Employee[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><SingleEmployee/></BrowserRouter></Provider>);
    await changeInputValue(renderResult, 'single_employee.labels.firstName *', 'Jane');
    let selectedEmployee = selectSelectedEmployee(store.store.getState());
    expect(selectedEmployee.firstName).toBe('Jane')
    await changeInputValue(renderResult, 'single_employee.labels.lastName *', 'Roe');
    selectedEmployee = selectSelectedEmployee(store.store.getState());
    expect(selectedEmployee.lastName).toBe('Roe')
    await changeInputValue(renderResult, 'single_employee.labels.role', 'developer');
    selectedEmployee = selectSelectedEmployee(store.store.getState());
    expect(selectedEmployee.functionTitle).toBe('developer')
    await changeInputValue(renderResult, 'single_employee.labels.email *', 'jane@doe.com');
    selectedEmployee = selectSelectedEmployee(store.store.getState());
    expect(selectedEmployee.email).toBe('jane@doe.com')
    await changeInputValue(renderResult, 'single_employee.labels.phone', '+32 477 77 77 77');
    selectedEmployee = selectSelectedEmployee(store.store.getState());
    expect(selectedEmployee.phone).toBe('+32 477 77 77 77')
    await changeInputValue(renderResult, 'single_employee.labels.startDate *', '2026-07-19');
    selectedEmployee = selectSelectedEmployee(store.store.getState());
    expect(moment(selectedEmployee.startDate).format("YYYY-MM-DD")).toBe("2026-07-19")
    await changeSelectValue(renderResult, 'single_employee.labels.department', "Marketing");
    selectedEmployee = selectSelectedEmployee(store.store.getState());
    expect(selectedEmployee.department).toBe(Department.Marketing)
    await changeSelectValue(renderResult, 'single_employee.labels.status', "Inactive");
    selectedEmployee = selectSelectedEmployee(store.store.getState());
    expect(selectedEmployee.status).toBe(EmployeeStatus.Inactive)
})

test('change manager', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValue(
        {data: [EMP_1] as Employee[]}
    )
    const renderResult = render(<Provider store={store.store}><BrowserRouter><SingleEmployee/></BrowserRouter></Provider>);
    const renderedLabel = await renderResult.findByText('single_employee.labels.manager');
    expect(renderedLabel.parentNode).not.toBeNull();
    const renderedInput = renderedLabel.parentNode!.querySelector('input');
    fireEvent.change(renderedInput!, {target: {value: 'John'}})
    const employee = await renderResult.findByText('John Doe');
    fireEvent.click(employee);
    const selectedEmployee = selectSelectedEmployee(store.store.getState());
    expect(selectedEmployee.manager!.id).toBe('1');
})

test('Save employee', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValue(
        {data: [EMP_1] as Employee[]}
    )

    const renderResult = render(<Provider
        store={store.store}><BrowserRouter><ErrorMessagePopup/><SingleEmployee/></BrowserRouter></Provider>);
    const saveButton = await renderResult.findByText('single_employee.save');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_employee.input.error.firstName'))
    await changeInputValue(renderResult, 'single_employee.labels.firstName *', 'Jane');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_employee.input.error.lastName'))
    await changeInputValue(renderResult, 'single_employee.labels.lastName *', 'Roe');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_employee.input.error.email_required'))
    await changeInputValue(renderResult, 'single_employee.labels.email *', 'invalid_email');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_employee.input.error.email_invalid'))
    await changeInputValue(renderResult, 'single_employee.labels.email *', 'jane@doe.com');
    await changeInputValue(renderResult, 'single_employee.labels.startDate *', '');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_employee.input.error.startDate'))
    await changeInputValue(renderResult, 'single_employee.labels.startDate *', '2026-07-19');
    await changeInputValue(renderResult, 'single_employee.labels.phone', 'invalid_phone');
    fireEvent.click(saveButton);
    await waitFor(async () => await renderResult.findByText('single_employee.input.error.phone'))
    await changeInputValue(renderResult, 'single_employee.labels.phone', '+32 477 77 77 77');

    const selectedEmployee = selectSelectedEmployee(store.store.getState());
    axiosCalls.mockResolvedValueOnce(({
        data: selectedEmployee
    }))
    fireEvent.click(saveButton);
})

test('Edit employee', async () => {
    const axiosCalls = axios.request as MockedFunction<typeof axios.request>;
    axiosCalls.mockResolvedValueOnce(
        {data: [EMP_1] as Employee[]}
    )
    axiosCalls.mockResolvedValueOnce(
        {data: {...EMP_1, id: '2', firstName: 'Jane'}}
    )
    const useParamsCalls = useParams as MockedFunction<typeof useParams>;
    useParamsCalls.mockReturnValue({employeeId: '2'})
    const renderResult = render(<Provider
        store={store.store}><BrowserRouter><ErrorMessagePopup/><SingleEmployee/></BrowserRouter></Provider>);
    const saveButton = await renderResult.findByText('single_employee.save');
    await changeInputValue(renderResult, 'single_employee.labels.firstName *', 'Jane');
    await changeInputValue(renderResult, 'single_employee.labels.lastName *', 'Roe');
    await changeInputValue(renderResult, 'single_employee.labels.email *', 'jane@doe.com');
    await changeInputValue(renderResult, 'single_employee.labels.startDate *', '2026-07-19');
    await changeInputValue(renderResult, 'single_employee.labels.phone', '+32 477 77 77 77');

    const selectedEmployee = selectSelectedEmployee(store.store.getState());
    axiosCalls.mockResolvedValueOnce(({
        data: selectedEmployee
    }))
    fireEvent.click(saveButton);
})