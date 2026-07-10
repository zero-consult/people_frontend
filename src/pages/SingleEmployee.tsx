import {useEffect, useState} from "react";
import {Link, useParams} from "react-router";
import {Save} from "lucide-react";
import {type EmployeeStatus, type Department, Configuration, type Employee, EmployeeApiFp} from "../types/employee/index.ts";
import {BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import moment from "moment";

const EMPTY_EMP: Employee = {
    firstName: "", lastName: "", functionTitle: "", department: "Engineering" as Department,
    email: "", phone: "", startDate: moment().valueOf(), status: "Active" as EmployeeStatus, manager: undefined,
};

function SingleEmployee() {
    const { employeeId } = useParams();
    const [form, setForm] = useState(EMPTY_EMP);

    async function fetchEmployee(employeeId: string) {
        const employeeFetch = await EmployeeApiFp(new Configuration({basePath: BACKEND_HOST})).getEmployee(employeeId);
        const employeeFetchResponse = await employeeFetch(axios);
        setForm(employeeFetchResponse.data);
    }

    useEffect(() => {
        if (typeof employeeId !== "undefined") {
            fetchEmployee(employeeId);
        } else {
            setForm(EMPTY_EMP);
        }
    }, [employeeId]);

    async function saveEmployee() {
        if (typeof employeeId === "undefined") {
            const employeeAdd = await EmployeeApiFp(new Configuration({basePath: BACKEND_HOST})).addEmployee(form);
            const employeeAddResponse = await employeeAdd(axios);
            setForm(employeeAddResponse.data);
        } else {
            const employeeUpdate = await EmployeeApiFp(new Configuration({basePath: BACKEND_HOST})).updateEmployee(employeeId, form);
            const employeeUpdateResponse = await employeeUpdate(axios);
            setForm(employeeUpdateResponse.data);
        }
    }

    function setDate(date: string) {
        setForm({ ...form, startDate: moment(date, "YYYY-MM-DD").valueOf()})
    }

    return <>
        <div className="grid grid-cols-2 gap-4 p-5">
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">First Name *</label>
                <input className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Last Name *</label>
                <input className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Function Title</label>
                <input className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" placeholder="eg. Senior Developer" value={form.functionTitle} onChange={(e) => setForm({ ...form, functionTitle: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Department</label>
                <select className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value as Department })}>
                    <option key="Engineering">Engineering</option>
                    <option key="Design">Design</option>
                    <option key="Marketing">Marketing</option>
                    <option key="Hr">Hr</option>
                    <option key="Finance">Finance</option>
                    <option key="Operations">Operations</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Status</label>
                <select className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}>
                    <option key="Active">active</option>
                    <option key="Inactive">inactive</option>
                    <option key="On leave">on leave</option>
                </select>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">E-mail address *</label>
                <input type="email" className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" placeholder="name@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Phone number</label>
                <input className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" placeholder="+32 6 ..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Start date</label>
                <input type="date" className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" value={moment(form.startDate).format("YYYY-MM-DD")} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="col-span-2">
                <Link to={"/employees"} onClick={() => saveEmployee()} className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Save className="w-4 h-4" /> Save
                </Link>
            </div>
        </div>
    </>
}

export default SingleEmployee;