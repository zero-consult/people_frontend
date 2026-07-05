import {useState} from "react";
import {type Department, DEPARTMENTS} from "../types/Department.ts";
import {EMPLOYEE_STATUSES, type EmployeeStatus} from "../types/EmployeeStatus.ts";
import {Link, useParams} from "react-router";
import {SEED_EMPLOYEES} from "../types/Employee.ts";
import {Save} from "lucide-react";

const EMPTY_EMP = {
    name: "", role: "", department: "Engineering" as Department,
    email: "", phone: "", startDate: "", status: "Actief" as EmployeeStatus,
};

function SingleEmployee() {
    const { employeeId } = useParams();
    const employee = typeof(employeeId) !== "undefined" ? SEED_EMPLOYEES.filter((emp) => emp.id === parseInt(employeeId))[0] : EMPTY_EMP;
    const [form, setForm] = useState(employee);

    return <>
        <div className="grid grid-cols-2 gap-4 p-5">
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Full Name *</label>
                <input className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Voor- en achternaam" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Function Title</label>
                <input className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" placeholder="bijv. Senior Developer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Department</label>
                <select className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value as Department })}>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Status</label>
                <select className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}>
                    {EMPLOYEE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">E-mail address *</label>
                <input type="email" className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" placeholder="naam@bedrijf.nl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Phone number</label>
                <input className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" placeholder="+31 6 ..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Start date</label>
                <input type="date" className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="col-span-2">
                <Link to={"/employees"} className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Save className="w-4 h-4" /> Save
                </Link>
            </div>
        </div>
    </>
}

export default SingleEmployee;