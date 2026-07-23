import {Link} from "react-router";
import {Briefcase, Clock, Users} from "lucide-react";
import {useTranslation} from "react-i18next";

export type NavigationListProps = {
    active: string;
    compact: boolean;
}

function NavigationList(props: NavigationListProps) {
    const { t } = useTranslation();

    return (<><Link
        key={"Employees"}
        to={"/employees"}
        className={`w-full flex items-center h-10 gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer
      ${
            props.active === "employees"
                ? "bg-primary/15 text-primary font-medium"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        }`}>
        <Users className="w-4 h-4 shrink-0" />
        {props.compact ? '' : t("menu.employees")}
    </Link>
        <Link
            key={"Customers"}
            to={"/customers"}
            className={`w-full flex items-center h-10 gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer
      ${
                props.active === "customers"
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}>
            <Briefcase className="w-4 h-4 shrink-0" />
            {props.compact ? '' : t("menu.customers")}
        </Link>
        <Link
            key={"Timesheets"}
            to={import.meta.env.VITE_TIMESHEET_FRONTEND_URL + "/timesheets"}
            className={`w-full flex items-center h-10 gap-3 px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer
      ${
                props.active === "timesheets"
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            }`}>
            <Clock className="ml-0.5 w-4 h-4 shrink-0"/>
            {props.compact ? '' : t("menu.timesheets")}
        </Link></>)
}

export default NavigationList;