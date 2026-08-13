import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import storePersistor from "./redux/store.ts";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={storePersistor.store}>
            <PersistGate loading={null} persistor={storePersistor.persistor}>
                <App/>
            </PersistGate>
        </Provider>
    </StrictMode>,
)
