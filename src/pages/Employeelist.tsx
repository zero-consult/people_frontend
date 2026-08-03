import {Pencil, Plus, Search, Trash2} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router";
import {
    Configuration,
    Department as DepartmentList,
    type Department,
    type Employee,
    EmployeeApiFp,
    type EmployeeStatus
} from "../types/people";
import axios from "axios";
import {PEOPLE_BACKEND_HOST} from "../Constants.ts";
import moment from "moment";
import {useDispatch, useSelector} from "react-redux";
import {loadEmployees, selectEmployees} from "../redux/employee.slice.ts";
import Pagination, {PAGE_SIZE} from "../components/Pagination.tsx";
import {handleError} from "../redux/error.slice.ts";
import {useTranslation} from "react-i18next";
import SortIcon from "../components/SortIcon.tsx";


const DEPT_COLORS: Record<Department, string> = {
    Engineering: "bg-blue-500/15 text-blue-300",
    Design: "bg-purple-500/15 text-purple-300",
    Marketing: "bg-pink-500/15 text-pink-300",
    HR: "bg-green-500/15 text-green-300",
    Finance: "bg-yellow-500/15 text-yellow-300",
    Operations: "bg-orange-500/15 text-orange-300",
};

const EMP_STATUS_COLORS: Record<EmployeeStatus, string> = {
    Active: "bg-emerald-500/15 text-emerald-400",
    'On leave': "bg-yellow-500/15 text-yellow-400",
    Inactive: "bg-red-500/15 text-red-400",
};

const INITIALS_COLORS = [
    "bg-blue-600", "bg-violet-600", "bg-rose-600",
    "bg-amber-600", "bg-teal-600", "bg-indigo-600",
];

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
    return INITIALS_COLORS[name.charCodeAt(0) % INITIALS_COLORS.length];
}


function Employeelist() {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const employees = useSelector(selectEmployees);
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState<Department | "All">("All");
    const [sortKey, setSortKey] = useState<keyof Employee>("firstName");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);

    async function fetchEmployees() {
        const employeeList = await EmployeeApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).employeesList();
        try {
            const employeeListResponse = await employeeList(axios);
            dispatch(loadEmployees(employeeListResponse.data));
        } catch (error) {
            dispatch(handleError(error))
        }
    }

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filtered = useMemo(() => {
        let list = [...employees];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((e) =>
                e.firstName.toLowerCase().includes(q) ||
                e.lastName.toLowerCase().includes(q) ||
                e.functionTitle?.toLowerCase().includes(q) ||
                e.email.toLowerCase().includes(q) ||
                e.department?.toLowerCase().includes(q)
            );
        }
        if (deptFilter !== "All") list = list.filter((e) => e.department === deptFilter);
        list.sort((a, b) => {
            const av = String(a[sortKey]);
            const bv = String(b[sortKey]);
            return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });
        return list;
    }, [employees, search, deptFilter, sortKey, sortDir]);

    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    function handleSort(key: keyof Employee) {
        if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else {
            setSortKey(key);
            setSortDir("asc");
        }
    }

    const activeCount = employees.filter((e) => e.status === "Active").length;
    const leaveCount = employees.filter((e) => e.status === "On leave").length;

    async function deleteEmployee(emp: Employee) {
        if (typeof emp.id != "undefined") {
            const deleteEmployee = await EmployeeApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).deleteEmployee(emp.id);
            try {
                await deleteEmployee(axios);
                fetchEmployees();
            } catch (error) {
                dispatch(handleError(error))
            }
        }
    }

    return <>
        <header className="px-8 py-6 border-b border-border flex items-center justify-between">
            <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight"
                    style={{fontFamily: "'Instrument Sans', sans-serif"}}>
                    {t('menu.employees')}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {t('employeelist.number_of_employees', {count: employees.length})} — {t('employeelist.active_employees', {count: activeCount})}, {t('employeelist.on_leave_employees', {count: leaveCount})}
                </p>
            </div>
            <Link to={"/employees/add"}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4"/> {t('employeelist.add_employee')}
            </Link>
        </header>

        <div className="px-8 py-5 grid grid-cols-3 gap-4 border-b border-border">
            {[
                {label: t("employeelist.card.total"), value: employees.length, sub: t("employeelist.card.employees")},
                {label: t("employeelist.card.active"), value: activeCount, sub: t("employeelist.card.in_service")},
                {label: t("employeelist.card.on_leave"), value: leaveCount, sub: t("employeelist.card.abscent")},
            ].map(({label, value, sub}) => (
                <div key={label} className="bg-card rounded-lg px-5 py-4 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1"
                       style={{fontFamily: "'DM Mono', monospace"}}>{label}</p>
                    <p className="text-2xl font-semibold text-foreground"
                       style={{fontFamily: "'Instrument Sans', sans-serif"}}>{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
            ))}
        </div>

        <div className="px-8 py-4 flex items-center gap-3 border-b border-border flex-wrap">
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                <input
                    id="search"
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md pl-9 pr-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t("employeelist.filter.search")} value={search}
                    onChange={(e) => setSearch(e.target.value)}/>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {(["All", DepartmentList.Design, DepartmentList.Hr, DepartmentList.Finance, DepartmentList.Engineering, DepartmentList.Marketing, DepartmentList.Operations] as const).map((d) => (
                    <button key={d} onClick={() => setDeptFilter(d as Department | "All")}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${deptFilter === d ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{t('employeelist.filter.department.' + d.toLowerCase())}</button>
                ))}
            </div>
        </div>

        <Pagination page={currentPage} total={filtered.length} onChange={setCurrentPage}/>

        <div className="flex-1 overflow-x-auto px-8 py-4">
            <table className="w-full border-collapse text-sm" style={{width: "1300px"}}>
                <thead>
                <tr className="border-b border-border">
                    {([
                        ["name", t("employeelist.table_headers.name")], ["role", t("employeelist.table_headers.role")], ["department", t("employeelist.table_headers.department")],
                        ["email", t("employeelist.table_headers.email")], ["startDate", t("employeelist.table_headers.startDate")], ["status", t("employeelist.table_headers.status")],
                    ] as [keyof Employee, string][]).map(([key, label]) => (
                        <th key={key}
                            className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-widest cursor-pointer select-none hover:text-foreground transition-colors"
                            style={{fontFamily: "'DM Mono', monospace"}} onClick={() => handleSort(key)}>
                            <span
                                className="inline-flex items-center gap-1">
                                    {label}
                                <SortIcon active={sortKey === key}
                                          dir={sortDir}/>
                                </span>
                        </th>
                    ))}
                    <th className="py-3 px-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-widest"
                        style={{fontFamily: "'DM Mono', monospace"}}>{t("employeelist.table_headers.actions")}
                    </th>
                </tr>
                </thead>
                <tbody>
                {paginated.length === 0 && (
                    <tr>
                        <td colSpan={7}
                            className="py-16 text-center text-muted-foreground text-sm">{t('employeelist.table.empty')}
                        </td>
                    </tr>
                )}
                {paginated.map((emp, i) => (
                    <tr key={emp.id}
                        className={`border-b border-border/50 hover:bg-card/60 transition-colors group ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                        <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${getAvatarColor(emp.firstName + ' ' + emp.lastName)}`}>{getInitials(emp.firstName + ' ' + emp.lastName)}</div>
                                <span className="font-medium text-foreground">{emp.firstName} {emp.lastName}</span>
                            </div>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground">{emp.functionTitle}</td>
                        <td className="py-3.5 px-3"><span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeof emp.department != "undefined" ? DEPT_COLORS[emp.department] : ""}`}>{t('employeelist.filter.department.' + ("" + emp.department).toLowerCase())}</span>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground"
                            style={{fontFamily: "'DM Mono', monospace", fontSize: "0.8rem"}}>{emp.email}</td>
                        <td className="py-3.5 px-3 text-muted-foreground"
                            style={{fontFamily: "'DM Mono', monospace", fontSize: "0.8rem"}}>
                            {moment(emp.startDate).format("DD-MM-YYYY")}
                        </td>
                        <td className="py-3.5 px-3"><span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${EMP_STATUS_COLORS[emp.status]}`}>{t('employeelist.status.' + ("" + emp.status).replaceAll(' ', '').toLowerCase())}</span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                            <div
                                className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <nav className="flex">
                                    <Link to={"/employees/" + emp.id + "/edit"}
                                          className="p-1.5 rounded-md hover:bg-primary/15 hover:text-primary text-muted-foreground transition-colors"><Pencil
                                        className="w-3.5 h-3.5"/></Link>
                                    {!emp.hasTimesheetEntries ?
                                        <button
                                            id={"delete-" + emp.id}
                                            onClick={() => deleteEmployee(emp)}
                                            className="p-1.5 rounded-md hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors">
                                            <Trash2 className="w-3.5 h-3.5"/>
                                        </button>
                                        : <></>}
                                </nav>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </>
}

export default Employeelist;