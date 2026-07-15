import {
    Configuration,
    type Customer,
    CustomerApiFp,
    type CustomerStatus,
    type Sector,
    Sector as CustomerSector
} from "../types/people";
import {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {loadCustomers, selectCustomers} from "../redux/customer.slice.ts";
import {PEOPLE_BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import Pagination, {PAGE_SIZE} from "../components/Pagination.tsx";
import {Globe, Mail, MapPin, Pencil, Plus, Search, SortAscIcon, SortDesc, Trash2} from "lucide-react";
import {Link} from "react-router";
import moment from "moment/moment";

const CUST_STATUS_COLORS: Record<CustomerStatus, string> = {
    Active: "bg-emerald-500/15 text-emerald-400",
    Prospect: "bg-sky-500/15 text-sky-400",
    Inactive: "bg-red-500/15 text-red-400",
};

const SECTOR_COLORS: Record<CustomerSector, string> = {
    Tech: "bg-blue-500/15 text-blue-300",
    Retail: "bg-pink-500/15 text-pink-300",
    Healthcare: "bg-teal-500/15 text-teal-300",
    Government: "bg-indigo-500/15 text-indigo-300",
    Finance: "bg-yellow-500/15 text-yellow-300",
    Education: "bg-green-500/15 text-green-300",
    Other: "bg-gray-500/15 text-gray-300",
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

function Customerlist() {
    const dispatch = useDispatch();
    const customers = useSelector(selectCustomers);
    const [search, setSearch] = useState("");
    const [sectorFilter, setSectorFilter] = useState<Sector | "All">("All");
    const [sortKey, setSortKey] = useState<keyof Customer>("companyName");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);

    async function fetchCustomers() {
        const customerList = await CustomerApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).customersList();
        const customerListResponse = await customerList(axios);
        dispatch(loadCustomers(customerListResponse.data));
    }

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filtered = useMemo(() => {
        let list = [...customers];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((c) =>
                c.companyName.toLowerCase().includes(q) || c.contactPersonFirstName.toLowerCase().includes(q) ||
                c.contactPersonLastName.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q)
            );
        }
        if (sectorFilter !== "All") list = list.filter((c) => c.sector === sectorFilter);
        list.sort((a, b) => {
            const av = String(a[sortKey]);
            const bv = String(b[sortKey]);
            return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });
        return list;
    }, [customers, search, sectorFilter, sortKey, sortDir]);

    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    function handleSort(key: keyof Customer) {
        if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else {
            setSortKey(key);
            setSortDir("asc");
        }
        setCurrentPage(1);
    }

    const activeCount = customers.filter((c) => c.status === "Active").length;
    const prospectCount = customers.filter((c) => c.status === "Prospect").length;

    return (
        <>
            <header className="px-8 py-6 border-b border-border flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-foreground tracking-tight"
                        style={{fontFamily: "'Instrument Sans', sans-serif"}}>
                        Customers
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {customers.length} customers — {activeCount} active, {prospectCount} prospects
                    </p>
                </div>
                <Link to={"/customers/add"}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4"/> Add customer
                </Link>
            </header>

            <div className="px-8 py-5 grid grid-cols-3 gap-4 border-b border-border">
                {[
                    {label: "Total", value: customers.length, sub: "customers"},
                    {label: "Active", value: activeCount, sub: "ongoing relation"},
                    {label: "Prospects", value: prospectCount, sub: "in negotiation"},
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
                        className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md pl-9 pr-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="Search company, contact person, city..." value={search} onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}/>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {(["All", CustomerSector.Education, CustomerSector.Finance, CustomerSector.Government, CustomerSector.Tech, CustomerSector.Healthcare, CustomerSector.Retail, CustomerSector.Other] as const).map((s) => (
                        <button key={s} onClick={() => {
                            setSectorFilter(s as CustomerSector | "All");
                            setCurrentPage(1);
                        }}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${sectorFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{s}</button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto px-8 py-4">
                <table className="w-full border-collapse text-sm">
                    <thead>
                    <tr className="border-b border-border">
                        {([
                            ["company", "Company"], ["contact", "Contact person"], ["sector", "Sector"],
                            ["city", "City"], ["since", "Customer since"], ["status", "Status"],
                        ] as [keyof Customer, string][]).map(([key, label]) => (
                            <th key={key}
                                className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-widest cursor-pointer select-none hover:text-foreground transition-colors"
                                style={{fontFamily: "'DM Mono', monospace"}} onClick={() => handleSort(key)}>
                                <span
                                    className="inline-flex items-center gap-1">{label}{(sortKey === key ? (sortDir === "asc" ?
                                    <SortAscIcon/> : <SortDesc/>) : <></>)} :</span>
                            </th>
                        ))}
                        <th className="py-3 px-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-widest"
                            style={{fontFamily: "'DM Mono', monospace"}}>Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-16 text-center text-muted-foreground text-sm">No customers
                                found.
                            </td>
                        </tr>
                    )}
                    {paginated.map((customer, i) => (
                        <tr key={customer.id}
                            className={`border-b border-border/50 hover:bg-card/60 transition-colors group ${i % 2 !== 0 ? "bg-muted/20" : ""}`}>
                            <td className="py-3.5 px-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${getAvatarColor(customer.companyName)}`}>{getInitials(customer.companyName)}</div>
                                    <div>
                                        <p className="font-medium text-foreground">{customer.companyName}</p>
                                        {customer.website &&
                                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Globe
                                                className="w-3 h-3"/>{customer.website}</p>}
                                    </div>
                                </div>
                            </td>
                            <td className="py-3.5 px-3">
                                <p className="text-foreground">{customer.contactPersonFirstName + " " + customer.contactPersonLastName}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"
                                   style={{fontFamily: "'DM Mono', monospace", fontSize: "0.75rem"}}>
                                    <Mail className="w-3 h-3"/>{customer.email}
                                </p>
                            </td>
                            <td className="py-3.5 px-3"><span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${SECTOR_COLORS[customer.sector]}`}>{customer.sector}</span>
                            </td>
                            <td className="py-3.5 px-3 text-muted-foreground">
                                <span className="flex items-center gap-1.5"><MapPin
                                    className="w-3.5 h-3.5 flex-shrink-0"/>{customer.city}</span>
                            </td>
                            <td className="py-3.5 px-3 text-muted-foreground"
                                style={{fontFamily: "'DM Mono', monospace", fontSize: "0.8rem"}}>
                                {moment(customer.startDate).format("DD-MM-YYYY")}
                            </td>
                            <td className="py-3.5 px-3"><span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CUST_STATUS_COLORS[customer.status]}`}>{customer.status}</span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                                <div
                                    className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link to={"/customers/" + customer.id + "/edit"}
                                          className="p-1.5 rounded-md hover:bg-primary/15 hover:text-primary text-muted-foreground transition-colors"><Pencil
                                        className="w-3.5 h-3.5"/></Link>
                                    {!customer.hasTimesheetEntries ?
                                        <button
                                            className="p-1.5 rounded-md hover:bg-destructive/15 hover:text-destructive text-muted-foreground transition-colors">
                                            <Trash2 className="w-3.5 h-3.5"/></button>
                                        : <></>}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <Pagination page={currentPage} total={filtered.length} onChange={setCurrentPage}/>
        </>
    )
}

export default Customerlist;