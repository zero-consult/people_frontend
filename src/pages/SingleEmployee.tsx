import {useEffect} from "react";
import {Link, useParams} from "react-router";
import {Save} from "lucide-react";
import {Configuration, type Department, EmployeeApiFp, type EmployeeStatus} from "../types/employee/index.ts";
import {BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import moment from "moment";
import {useDispatch, useSelector} from "react-redux";
import {loadSingleEmployee, resetSingleEmployee, selectSelectedEmployee} from "../redux/employee.slice.ts";


function SingleEmployee() {
    const dispatch = useDispatch();
    const {employeeId} = useParams();
    const employee = useSelector(selectSelectedEmployee);

    async function fetchEmployee(employeeId: string) {
        const employeeFetch = await EmployeeApiFp(new Configuration({basePath: BACKEND_HOST})).getEmployee(employeeId);
        const employeeFetchResponse = await employeeFetch(axios);
        dispatch(loadSingleEmployee(employeeFetchResponse.data));
    }

    useEffect(() => {
        if (typeof employeeId !== "undefined") {
            fetchEmployee(employeeId);
        } else {
            dispatch(resetSingleEmployee())
        }
    }, [employeeId]);

    async function saveEmployee() {
        if (typeof employeeId === "undefined") {
            const employeeAdd = await EmployeeApiFp(new Configuration({basePath: BACKEND_HOST})).addEmployee(employee);
            const employeeAddResponse = await employeeAdd(axios);
            dispatch(loadSingleEmployee(employeeAddResponse.data));
        } else {
            const employeeUpdate = await EmployeeApiFp(new Configuration({basePath: BACKEND_HOST})).updateEmployee(employeeId, employee);
            const employeeUpdateResponse = await employeeUpdate(axios);
            dispatch(loadSingleEmployee(employeeUpdateResponse.data));
        }
    }

    function setDate(date: string) {
        dispatch(loadSingleEmployee({...employee, startDate: moment(date, "YYYY-MM-DD").valueOf()}));
    }

    return <>
        <div className="grid grid-cols-2 gap-4 p-5">
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">First
                    Name *</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="First name" value={employee.firstName}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, firstName: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Last
                    Name *</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Last name" value={employee.lastName}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, lastName: e.target.value}))}/>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Function
                    Title</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="eg. Senior Developer" value={employee.functionTitle}
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
                    <option key="Active">active</option>
                    <option key="Inactive">inactive</option>
                    <option key="On leave">on leave</option>
                </select>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">E-mail
                    address *</label>
                <input type="email"
                       className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       placeholder="name@company.com" value={employee.email}
                       onChange={(e) => dispatch(loadSingleEmployee({...employee, email: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Phone
                    number</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="+32 6 ..." value={employee.phone}
                    onChange={(e) => dispatch(loadSingleEmployee({...employee, phone: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Start
                    date</label>
                <input type="date"
                       className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       value={moment(employee.startDate).format("YYYY-MM-DD")}
                       onChange={(e) => setDate(e.target.value)}/>
            </div>
            <div className="col-span-2">
                <Link to={"/employees"} onClick={() => saveEmployee()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Save className="w-4 h-4"/> Save
                </Link>
            </div>
        </div>
    </>
}

export default SingleEmployee;