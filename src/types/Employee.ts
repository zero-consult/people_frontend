import type {Department} from "./Department.ts";
import type {EmployeeStatus} from "./EmployeeStatus.ts";

export interface Employee {
    id: number;
    name: string;
    role: string;
    department: Department;
    email: string;
    phone: string;
    startDate: string;
    status: EmployeeStatus;
}

export const SEED_EMPLOYEES: Employee[] = [
    { id: 1, name: "Sophie Janssen", role: "Senior Frontend Developer", department: "Engineering", email: "s.janssen@bedrijf.nl", phone: "+31 6 1234 5678", startDate: "2021-03-15", status: "Active" },
    { id: 2, name: "Liam de Vries", role: "UX Designer", department: "Design", email: "l.devries@bedrijf.nl", phone: "+31 6 2345 6789", startDate: "2020-07-01", status: "Active" },
    { id: 3, name: "Emma Bakker", role: "Marketing Manager", department: "Marketing", email: "e.bakker@bedrijf.nl", phone: "+31 6 3456 7890", startDate: "2019-11-20", status: "On leave" },
    { id: 4, name: "Noah Visser", role: "HR Generalist", department: "HR", email: "n.visser@bedrijf.nl", phone: "+31 6 4567 8901", startDate: "2022-01-10", status: "Active" },
    { id: 5, name: "Olivia Smit", role: "Financial Analyst", department: "Finance", email: "o.smit@bedrijf.nl", phone: "+31 6 5678 9012", startDate: "2020-09-05", status: "Active" },
    { id: 6, name: "Lucas Meijer", role: "DevOps Engineer", department: "Engineering", email: "l.meijer@bedrijf.nl", phone: "+31 6 6789 0123", startDate: "2021-06-22", status: "Active" },
    { id: 7, name: "Mia van den Berg", role: "Content Strategist", department: "Marketing", email: "m.vandenberg@bedrijf.nl", phone: "+31 6 7890 1234", startDate: "2023-02-14", status: "Inactive" },
    { id: 8, name: "Finn Peters", role: "Operations Lead", department: "Operations", email: "f.peters@bedrijf.nl", phone: "+31 6 8901 2345", startDate: "2018-05-30", status: "Active" },
    { id: 9, name: "Ava Hendriks", role: "Product Designer", department: "Design", email: "a.hendriks@bedrijf.nl", phone: "+31 6 9012 3456", startDate: "2022-08-17", status: "On leave" },
    { id: 10, name: "Daan Bos", role: "Backend Developer", department: "Engineering", email: "d.bos@bedrijf.nl", phone: "+31 6 0123 4567", startDate: "2020-12-03", status: "Active" },
];