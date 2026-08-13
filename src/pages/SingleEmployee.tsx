import {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router";
import {Save, Search, X} from "lucide-react";
import {Configuration, type Department, EmployeeApiFp, type EmployeeStatus} from "../types/people";
import {PEOPLE_BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import moment from "moment";
import {useDispatch, useSelector} from "react-redux";
import {
    loadEmployees,
    loadSingleEmployee,
    resetSingleEmployee,
    selectEmployees,
    selectSelectedEmployee
} from "../redux/employee.slice.ts";
import {handleError, showError} from "../redux/error.slice.ts";
import {useTranslation} from "react-i18next";
import {selectToken} from "../redux/account.slice.ts";


function SingleEmployee() {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const {employeeId} = useParams();
    const token = useSelector(selectToken);
    const employee = useSelector(selectSelectedEmployee);
    const employees = useSelector(selectEmployees);
    const [search, setSearch] = useState("");

    const managers = useMemo(() => {
        return employees.filter((e) => (e.firstName + " " + e.lastName).toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    async function fetchEmployees() {
        const employeeList = await EmployeeApiFp(new Configuration({accessToken: token, basePath: PEOPLE_BACKEND_HOST})).employeesList();
        try {
            const employeeListResponse = await employeeList(axios);
            dispatch(loadEmployees(employeeListResponse.data));
        } catch(error) {
            dispatch(handleError(error))
        }
    }

    useEffect(() => {
        fetchEmployees();
    }, []);

    async function fetchEmployee(employeeId: string) {
        const employeeFetch = await EmployeeApiFp(new Configuration({accessToken: token, basePath: PEOPLE_BACKEND_HOST})).getEmployee(employeeId);
        try {
            const employeeFetchResponse = await employeeFetch(axios);
            dispatch(loadSingleEmployee(employeeFetchResponse.data));
        } catch(error) {
            dispatch(handleError(error))
        }
    }

    useEffect(() => {
        if (typeof employeeId !== "undefined") {
            fetchEmployee(employeeId);
        } else {
            dispatch(resetSingleEmployee())
        }
    }, [employeeId]);


    async function saveEmployee() {
        if (employee.firstName.trim().length === 0) {
            dispatch(showError({title: "Input error", message: t('single_employee.input.error.firstName')}));
            return;
        }
        if (employee.lastName.trim().length === 0) {
            dispatch(showError({title: "Input error", message: t('single_employee.input.error.lastName')}));
            return;
        }
        if (employee.email.trim().length === 0) {
            dispatch(showError({title: "Input error", message: t('single_employee.input.error.email_required')}));
            return;
        }
        if (employee.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) === null) {
            dispatch(showError({title: "Input error", message: t('single_employee.input.error.email_invalid')}));
            return;
        }
        if (Number.isNaN(employee.startDate)) {
            dispatch(showError({title: "Input error", message: t('single_employee.input.error.startDate')}));
            return;
        }
        if (employee.phone.trim().length > 0 && employee.phone.trim().match(/^\+?[\s\d-]+$/) === null) {
            dispatch(showError({title: "Input error", message: t('single_employee.input.error.phone')}));
            return;
        }
        if (Number.isNaN(employee.grossWage) || employee.grossWage <= 0) {
            dispatch(showError({title: "Input error", message: t('single_employee.input.error.grossWage_required')}));
            return;
        }
        if (typeof employeeId === "undefined") {
            const employeeAdd = await EmployeeApiFp(new Configuration({accessToken: token, basePath: PEOPLE_BACKEND_HOST})).addEmployee(employee);
            try {
                const employeeAddResponse = await employeeAdd(axios);
                dispatch(loadSingleEmployee(employeeAddResponse.data));
                window.location.href = "/employees";
            } catch (error) {
                dispatch(handleError(error))
            }
        } else {
            const employeeUpdate = await EmployeeApiFp(new Configuration({accessToken: token, basePath: PEOPLE_BACKEND_HOST})).updateEmployee(employeeId, employee);
            try {
                const employeeUpdateResponse = await employeeUpdate(axios);
                dispatch(loadSingleEmployee(employeeUpdateResponse.data));
                window.location.href = "/employees";
            } catch (error) {
                dispatch(handleError(error))
            }
        }
    }

    function setDate(date: string) {
        dispatch(loadSingleEmployee({...employee, startDate: moment(date, "YYYY-MM-DD").valueOf()}));
    }

    return <>
        <div className="grid grid-cols-2 gap-4 p-5">
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_employee.labels.firstName')} *</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t('single_employee.labels.firstName')} value={employee.firstName}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, firstName: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_employee.labels.lastName')} *</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t('single_employee.labels.lastName')} value={employee.lastName}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, lastName: e.target.value}))}/>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_employee.labels.role')}</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t('single_employee.placeholders.role')} value={employee.functionTitle}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, functionTitle: e.target.value}))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_employee.labels.department')}</label>
                <select
                    className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                    value={employee.department} onChange={(e) => dispatch(loadSingleEmployee({
                    ...employee,
                    department: e.target.value as Department
                }))}>
                    <option key="Engineering" value="Engineering">{t('single_employee.department.engineering')}</option>
                    <option key="Design" value="Design">{t('single_employee.department.design')}</option>
                    <option key="Marketing" value="Marketing">{t('single_employee.department.marketing')}</option>
                    <option key="Hr" value="HR">{t('single_employee.department.hr')}</option>
                    <option key="Finance" value="Finance">{t('single_employee.department.finance')}</option>
                    <option key="Operations" value="Operations">{t('single_employee.department.operations')}</option>
                </select>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_employee.labels.status')}</label>
                <select
                    className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                    value={employee.status} onChange={(e) => dispatch(loadSingleEmployee({
                    ...employee,
                    status: e.target.value as EmployeeStatus
                }))}>
                    <option key="Active" value={"Active"}>{t('single_employee.status.active')}</option>
                    <option key="Inactive" value={"Inactive"}>{t('single_employee.status.inactive')}</option>
                    <option key="On leave" value={"On leave"}>{t('single_employee.status.onleave')}</option>
                </select>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_employee.labels.email')} *</label>
                <input type="email"
                       className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       placeholder={t('single_employee.placeholders.email')} value={employee.email}
                       onChange={(e) => dispatch(loadSingleEmployee({...employee, email: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_employee.labels.phone')}</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t('single_employee.placeholders.phone')} value={employee.phone}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, phone: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_employee.labels.startDate')} *</label>
                <input type="date"
                       className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       value={moment(employee.startDate).format("YYYY-MM-DD")}
                       onChange={(e) => setDate(e.target.value)}/>
            </div>
            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_employee.labels.manager')}</label>
                {
                    typeof employee.manager != "undefined" && employee.manager !== null ?
                        <div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-full rounded-full flex px-0 py-0">
                                        <span
                                            className="text-primary">{employee.manager.firstName} {employee.manager.lastName}</span>
                                        <X size={32} className="absolute right-5 py-1 text-muted-foreground"
                                           onClick={() => dispatch(loadSingleEmployee({
                                               ...employee,
                                               manager: undefined
                                           }))}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <>
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                <input
                                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md pl-9 pr-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder={t('single_employee.placeholders.search')} value={search}
                                    onChange={(e) => setSearch(e.target.value)}/>
                            </div>
                            {search.length > 0 ?
                                <div id="dropdown"
                                     className="absolute z-10 bg-input-background bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-44">
                                    <ul className="p-2 text-sm text-body font-medium"
                                        aria-labelledby="dropdownDefaultButton">
                                        {managers.map((manager) => <li
                                            key={manager.id} onClick={() => {
                                            dispatch(loadSingleEmployee({...employee, manager: manager}))
                                        }}>{manager.firstName} {manager.lastName}</li>)}
                                    </ul>
                                </div>
                                :
                                <></>}
                        </>
                }
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_employee.labels.grossWage')} *</label>
                <input type="number"
                       className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       placeholder={"4000,00"} value={employee.grossWage}
                       onChange={(e) => dispatch(loadSingleEmployee({...employee, grossWage: parseFloat(e.target.value)}))}/>
            </div>
            <div className="col-span-2">
                <button onClick={() => saveEmployee()}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Save className="w-4 h-4"/>{t('single_employee.save')}
                </button>
            </div>
        </div>
    </>
}

export default SingleEmployee;