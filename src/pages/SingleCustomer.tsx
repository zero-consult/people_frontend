import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router";
import {loadSingleCustomer, resetSingleCustomer, selectSelectedCustomer} from "../redux/customer.slice.ts";
import {useEffect} from "react";
import {Configuration, CustomerApiFp, type CustomerStatus, type Sector} from "../types/people";
import {PEOPLE_BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import moment from "moment/moment";
import {Save} from "lucide-react";
import {handleError, showError} from "../redux/error.slice.ts";
import {useTranslation} from "react-i18next";
import {selectToken} from "../redux/account.slice.ts";

function SingleCustomer() {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const {customerId} = useParams();
    const token = useSelector(selectToken);
    const customer = useSelector(selectSelectedCustomer);

    async function fetchCustomer(customerId: string) {
        const customerFetch = await CustomerApiFp(new Configuration({accessToken: token, basePath: PEOPLE_BACKEND_HOST})).getCustomer(customerId);
        try {
            const customerFetchResponse = await customerFetch(axios);
            dispatch(loadSingleCustomer(customerFetchResponse.data));
        } catch (error) {
            dispatch(handleError(error))
        }
    }

    useEffect(() => {
        if (typeof customerId !== "undefined") {
            fetchCustomer(customerId);
        } else {
            dispatch(resetSingleCustomer())
        }
    }, [customerId]);

    async function saveCustomer() {
        if (customer.companyName.trim().length === 0) {
            dispatch(showError({
                title: "Input error",
                message: t('single_customer.input.error.company_name_required')
            }));
            return;
        }
        if (customer.contactPersonFirstName.trim().length === 0) {
            dispatch(showError({
                title: "Input error",
                message: t('single_customer.input.error.contact_person_first_name_required')
            }));
            return;
        }
        if (customer.contactPersonLastName.trim().length === 0) {
            dispatch(showError({
                title: "Input error",
                message: t('single_customer.input.error.contact_person_last_name_required')
            }));
            return;
        }
        if (Number.isNaN(customer.hiringRatePerHour) || customer.hiringRatePerHour <= 0) {
            dispatch(showError({title: "Input error", message: t('single_employee.input.error.hiringRate_required')}));
            return;
        }
        if (customer.email.trim().length === 0) {
            dispatch(showError({title: "Input error", message: t('single_customer.input.error.email_required')}));
            return;
        }
        if (customer.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) === null) {
            dispatch(showError({title: "Input error", message: t('single_customer.input.error.email_invalid')}));
            return;
        }
        if (customer.phone.trim().length > 0 && customer.phone.trim().match(/^\+?[\s\d-]+$/) === null) {
            dispatch(showError({title: "Input error", message: t('single_customer.input.error.phone_invalid')}));
            return;
        }
        if (Number.isNaN(customer.startDate)) {
            dispatch(showError({title: "Input error", message: t('single_customer.input.error.startDate')}));
            return;
        }
        if (typeof customerId === "undefined") {
            const customerAdd = await CustomerApiFp(new Configuration({accessToken: token, basePath: PEOPLE_BACKEND_HOST})).addCustomer(customer);
            try {
                const customerAddResponse = await customerAdd(axios);
                dispatch(loadSingleCustomer(customerAddResponse.data));
                window.location.href = "/people/customers";
            } catch (error) {
                dispatch(handleError(error))
            }
        } else {
            const customerUpdate = await CustomerApiFp(new Configuration({accessToken: token, basePath: PEOPLE_BACKEND_HOST})).updateCustomer(customerId, customer);
            try {
                const customerUpdateResponse = await customerUpdate(axios);
                dispatch(loadSingleCustomer(customerUpdateResponse.data));
                window.location.href = "/people/customers";
            } catch (error) {
                dispatch(handleError(error))
            }
        }
    }

    return <>
        <div className="grid grid-cols-2 gap-4 p-5">
            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.company_name')} *</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t('single_customer.placeholders.company_name')} value={customer.companyName}
                    onChange={(e) => dispatch(loadSingleCustomer({...customer, companyName: e.target.value}))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.contact_person_first_name')} *</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t('single_customer.placeholders.first_name')} value={customer.contactPersonFirstName}
                    onChange={(e) => dispatch(loadSingleCustomer({
                        ...customer,
                        contactPersonFirstName: e.target.value
                    }))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.contact_person_last_name')} *</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t('single_customer.placeholders.last_name')} value={customer.contactPersonLastName}
                    onChange={(e) => dispatch(loadSingleCustomer({
                        ...customer,
                        contactPersonLastName: e.target.value
                    }))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.sector')}</label>
                <select
                    className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                    value={customer.sector}
                    onChange={(e) => dispatch(loadSingleCustomer({...customer, sector: e.target.value as Sector}))}>
                    <option key={"Tech"} value={"Tech"}>{t('single_customer.sector.tech')}</option>
                    <option key={"Retail"} value={"Retail"}>{t('single_customer.sector.retail')}</option>
                    <option key={"Healthcare"} value={"Healthcare"}>{t('single_customer.sector.healthcare')}</option>
                    <option key={"Finance"} value={"Finance"}>{t('single_customer.sector.finance')}</option>
                    <option key={"Government"} value={"Government"}>{t('single_customer.sector.government')}</option>
                    <option key={"Education"} value={"Education"}>{t('single_customer.sector.education')}</option>
                    <option key={"Other"} value={"Other"}>{t('single_customer.sector.other')}</option>
                </select>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.status')}</label>
                <select
                    className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
                    value={customer.status} onChange={(e) => dispatch(loadSingleCustomer({
                    ...customer,
                    status: e.target.value as CustomerStatus
                }))}>
                    <option key={"Active"} value={"Active"}>{t('single_customer.status.active')}</option>
                    <option key={"Inactive"} value={"Inactive"}>{t('single_customer.status.inactive')}</option>
                    <option key={"Prospect"} value={"Prospect"}>{t('single_customer.status.prospect')}</option>
                </select>
            </div>
            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.hiringRate')} *</label>
                <input type="number"
                       className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       placeholder={"50,00"} value={customer.hiringRatePerHour}
                       onChange={(e) => dispatch(loadSingleCustomer({
                           ...customer,
                           hiringRatePerHour: parseFloat(e.target.value)
                       }))}/>
            </div>
            <div className="col-span-2">
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.email')} *</label>
                <input type="email"
                       className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       placeholder={t('single_customer.placeholders.email')} value={customer.email}
                       onChange={(e) => dispatch(loadSingleCustomer({...customer, email: e.target.value}))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.phone')}</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t('single_customer.placeholders.phone')} value={customer.phone}
                    onChange={(e) => dispatch(loadSingleCustomer({...customer, phone: e.target.value}))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.city')}</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t('single_customer.placeholders.city')} value={customer.city}
                    onChange={(e) => dispatch(loadSingleCustomer({...customer, city: e.target.value}))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.website')}</label>
                <input
                    className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={t('single_customer.placeholders.website')} value={customer.website}
                    onChange={(e) => dispatch(loadSingleCustomer({...customer, website: e.target.value}))}/>
            </div>
            <div>
                <label
                    className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{t('single_customer.labels.customer_since')} *</label>
                <input type="date"
                       className="w-full bg-input-background text-foreground text-sm rounded-md px-3 py-2 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                       value={moment(customer.startDate).format("YYYY-MM-DD")}
                       onChange={(e) => dispatch(loadSingleCustomer({
                           ...customer,
                           startDate: moment(e.target.value, "YYYY-MM-DD").valueOf()
                       }))}/>
            </div>
            <div className="col-span-2">
                <button onClick={() => saveCustomer()}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Save className="w-4 h-4"/>{t('single_customer.save')}
                </button>
            </div>
        </div>
    </>
}

export default SingleCustomer;