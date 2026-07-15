import {useDispatch, useSelector} from "react-redux";
import {Link, useParams} from "react-router";
import {loadSingleCustomer, resetSingleCustomer, selectSelectedCustomer} from "../redux/customer.slice.ts";
import {useEffect} from "react";
import {Configuration, CustomerApiFp, type CustomerStatus, type Sector} from "../types/people";
import {PEOPLE_BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import moment from "moment/moment";
import {Save} from "lucide-react";

function SingleCustomer() {
    const dispatch = useDispatch();
    const {customerId} = useParams();
    const customer = useSelector(selectSelectedCustomer);

    async function fetchCustomer(customerId: string) {
        const customerFetch = await CustomerApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).getCustomer(customerId);
        const customerFetchResponse = await customerFetch(axios);
        dispatch(loadSingleCustomer(customerFetchResponse.data));
    }

    useEffect(() => {
        if (typeof customerId !== "undefined") {
            fetchCustomer(customerId);
        } else {
            dispatch(resetSingleCustomer())
        }
    }, [customerId]);

    async function saveCustomer() {
        if (typeof customerId === "undefined") {
            const customerAdd = await CustomerApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).addCustomer(customer);
            const customerAddResponse = await customerAdd(axios);
            dispatch(loadSingleCustomer(customerAddResponse.data));
        } else {
            const customerUpdate = await CustomerApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).updateCustomer(customerId, customer);
            const customerUpdateResponse = await customerUpdate(axios);
            dispatch(loadSingleCustomer(customerUpdateResponse.data));
        }
    }

    return <>
        <div className="grid grid-cols-2 gap-4 p-5">
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Company
                    name *</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="bijv. Nexgen Solutions BV" value={customer.companyName}
                    onChange={(e) => dispatch(loadSingleCustomer({...customer, companyName: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Contact
                    person first name</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="First name" value={customer.contactPersonFirstName}
                    onChange={(e) => dispatch(loadSingleCustomer({
                        ...customer,
                        contactPersonFirstName: e.target.value
                    }))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Contact
                    person last name</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Last name" value={customer.contactPersonLastName}
                    onChange={(e) => dispatch(loadSingleCustomer({
                        ...customer,
                        contactPersonLastName: e.target.value
                    }))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Sector</label>
                <select
                    className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                    value={customer.sector}
                    onChange={(e) => dispatch(loadSingleCustomer({...customer, sector: e.target.value as Sector}))}>
                    <option key={"Tech"}>Tech</option>
                    <option key={"Retail"}>Retail</option>
                    <option key={"Healthcare"}>Healthcare</option>
                    <option key={"Finance"}>Finance</option>
                    <option key={"Government"}>Government</option>
                    <option key={"Education"}>Education</option>
                    <option key={"Other"}>Other</option>
                </select>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Status</label>
                <select
                    className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                    value={customer.status} onChange={(e) => dispatch(loadSingleCustomer({
                    ...customer,
                    status: e.target.value as CustomerStatus
                }))}>
                    <option key={"Active"}>Active</option>
                    <option key={"Inactive"}>Inactive</option>
                    <option key={"Prospect"}>Prospect</option>
                </select>
            </div>
            <div className="col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">E-mail
                    *</label>
                <input type="email"
                       className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       placeholder="contact@company.com" value={customer.email}
                       onChange={(e) => dispatch(loadSingleCustomer({...customer, email: e.target.value}))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Phone
                    number</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="+31 20 ..." value={customer.phone}
                    onChange={(e) => dispatch(loadSingleCustomer({...customer, phone: e.target.value}))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">City</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="bijv. Amsterdam" value={customer.city}
                    onChange={(e) => dispatch(loadSingleCustomer({...customer, city: e.target.value}))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Website</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="bedrijf.nl" value={customer.website}
                    onChange={(e) => dispatch(loadSingleCustomer({...customer, website: e.target.value}))}/>
            </div>
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Customer
                    since</label>
                <input type="date"
                       className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       value={moment(customer.startDate).format("YYYY-MM-DD")}
                       onChange={(e) => dispatch(loadSingleCustomer({
                           ...customer,
                           startDate: moment(e.target.value, "YYYY-MM-DD").valueOf()
                       }))}/>
            </div>
            <div className="col-span-2">
                <Link to={"/customers"} onClick={() => saveCustomer()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Save className="w-4 h-4"/> Save
                </Link>
            </div>
        </div>
    </>
}

export default SingleCustomer;