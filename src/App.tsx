import './App.css'
import {BrowserRouter, Route, Routes} from "react-router";
import Employeelist from "./pages/Employeelist.tsx";
import Customerlist from "./pages/Customerlist.tsx";
import SingleEmployee from "./pages/SingleEmployee.tsx";
import {useSelector} from "react-redux";
import SingleCustomer from "./pages/SingleCustomer.tsx";
import ErrorMessagePopup from "./components/ErrorMessagePopup.tsx";

import './i18n';
import {useState} from "react";
import CollapsedMenu from "./components/CollapsedMenu.tsx";
import FullMenu from "./components/FullMenu.tsx";
import {selectUser} from "./redux/account.slice.ts";
import Login from "./pages/Login.tsx";

function App() {
    const [collapsed, setCollapsed] = useState(false);
    const user = useSelector(selectUser);

    return (
        <>
            <ErrorMessagePopup/>
            <BrowserRouter>
                {typeof user === "undefined" ?
                    <Login/>
                    :
                    <div className="min-h-screen flex" style={{fontFamily: "'DM Sans', sans-serif"}}>
                        {collapsed ?
                            <CollapsedMenu expand={() => setCollapsed(false)}/>
                            :
                            <FullMenu shrink={() => setCollapsed(true)}/>
                        }

                        {/* Page content */}
                        <main
                            className={"flex-1 flex flex-col min-w-0 bg-background overflow-y-auto" + (collapsed ? " pl-15" : " pl-60")}>
                            {/* Routes */}
                            <Routes>
                                <Route path="/" element={<Employeelist/>}/>
                                <Route path="/employees" element={<Employeelist/>}/>
                                <Route path="/employees/add" element={<SingleEmployee/>}/>
                                <Route path="/employees/:employeeId/edit" element={<SingleEmployee/>}/>
                                <Route path="/customers" element={<Customerlist/>}/>
                                <Route path="/customers/add" element={<SingleCustomer/>}/>
                                <Route path="/customers/:customerId/edit" element={<SingleCustomer/>}/>
                            </Routes>
                        </main>
                    </div>
                }
            </BrowserRouter>
        </>
    )
}

export default App
