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


function SingleEmployee() {
    const dispatch = useDispatch();
    const {employeeId} = useParams();
    const employee = useSelector(selectSelectedEmployee);
    const employees = useSelector(selectEmployees);
    const [search, setSearch] = useState("");

    const managers = useMemo(() => {
        return employees.filter((e) => (e.firstName + " " + e.lastName).toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    async function fetchEmployees() {
        const employeeList = await EmployeeApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).employeesList();
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
        const employeeFetch = await EmployeeApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).getEmployee(employeeId);
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
            dispatch(showError({title: "Input error", message: "First name is required"}));
            return;
        }
        if (employee.firstName.trim().length === 0) {
            dispatch(showError({title: "Input error", message: "Last name is required"}));
            return;
        }
        if (employee.email.trim().length === 0) {
            dispatch(showError({title: "Input error", message: "E-mail is required"}));
            return;
        }
        if (employee.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) === null) {
            dispatch(showError({title: "Input error", message: "E-mail is invalid"}));
            return;
        }
        if (Number.isNaN(employee.startDate)) {
            dispatch(showError({title: "Input error", message: "Start date is required"}));
            return;
        }
        if (typeof employeeId === "undefined") {
            const employeeAdd = await EmployeeApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).addEmployee(employee);
            try {
                const employeeAddResponse = await employeeAdd(axios);
                dispatch(loadSingleEmployee(employeeAddResponse.data));
                window.location.href = "/employees";
            } catch (error) {
                dispatch(handleError(error))
            }
        } else {
            const employeeUpdate = await EmployeeApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).updateEmployee(employeeId, employee);
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
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">First Name *</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="First name" value={employee.firstName}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, firstName: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Last Name *</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Last name" value={employee.lastName}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, lastName: e.target.value}))}/>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Function Title</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="E.g. Senior Developer" value={employee.functionTitle}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, functionTitle: e.target.value}))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Department</label>
                <select
                    className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                    value={employee.department} onChange={(e) => dispatch(loadSingleEmployee({
                    ...employee,
                    department: e.target.value as Department
                }))}>
                    <option key="Engineering">Engineering</option>
                    <option key="Design">Design</option>
                    <option key="Marketing">Marketing</option>
                    <option key="Hr">Hr</option>
                    <option key="Finance">Finance</option>
                    <option key="Operations">Operations</option>
                </select>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Status</label>
                <select
                    className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                    value={employee.status} onChange={(e) => dispatch(loadSingleEmployee({
                    ...employee,
                    status: e.target.value as EmployeeStatus
                }))}>
                    <option key="Active" value={"Active"}>active</option>
                    <option key="Inactive" value={"Inactive"}>inactive</option>
                    <option key="On leave" value={"On leave"}>on leave</option>
                </select>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">E-mail address *</label>
                <input type="email"
                       className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       placeholder="name@company.com" value={employee.email}
                       onChange={(e) => dispatch(loadSingleEmployee({...employee, email: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Phone number</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="+32 6 ..." value={employee.phone}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, phone: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Start date *</label>
                <input type="date"
                       className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       value={moment(employee.startDate).format("YYYY-MM-DD")}
                       onChange={(e) => setDate(e.target.value)}/>
            </div>
            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Manager</label>
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
                                    placeholder="Search manager" value={search}
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
                <button onClick={() => saveEmployee()}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Save className="w-4 h-4"/> Save
                </button>
            </div>
        </div>
    </>
}

export default SingleEmployee;