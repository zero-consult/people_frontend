import {configureStore} from "@reduxjs/toolkit";

import employeeSlice from "./employee.slice";
import customerSlice from "./customer.slice.ts";


const store = configureStore({
    reducer: {
        customer: customerSlice.reducer,
        employee: employeeSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    })
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store;