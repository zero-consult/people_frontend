import {AlertCircle, Building2} from "lucide-react";
import {useState} from "react";
import {useDispatch} from "react-redux";
import LanguageSwitcher from "../components/LanguageSwitcher.tsx";
import {Configuration, UserApiFp} from "../types/people";
import {PEOPLE_BACKEND_HOST} from "../Constants.ts";
import axios from "axios";
import {login} from "../redux/account.slice.ts";

function Login() {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        const loginAction = await UserApiFp(new Configuration({basePath: PEOPLE_BACKEND_HOST})).login({ email: email, password: password});
        try {
            const loginActionResult = await loginAction(axios);
            if(loginActionResult.status === 200) {
                dispatch(login(loginActionResult.data))
                setTimeout(() => {
                    window.location.href = import.meta.env.VITE_TIMESHEET_FRONTEND_URL + "/timesheets"
                }, 1000)
            } else {
                setError("Can't login");
            }
        } catch {
            setError("Can't login");
        }
        setLoading(false);
    }

    return <div className="h-screen flex bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Right panel */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">


            <div className="w-full max-w-sm">
                {/* Mobile logo */}
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-foreground font-semibold text-sm" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>Zero consult</span>
                </div>

                    <LanguageSwitcher compact={false} />


                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">E-mail</label>
                        <input
                            type="email"
                            autoComplete="email"
                            className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
                            placeholder="name@company.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(""); }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Password</label>
                        <input
                            type="password"
                            autoComplete="current-password"
                            className="w-full bg-input-background text-foreground placeholder:text-muted-foreground text-sm rounded-md px-3 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(""); }}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-destructive/10 border border-destructive/20">
                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Inloggen…" : "Inloggen"}
                    </button>
                </form>
            </div>
        </div>
    </div>
}

export default Login;