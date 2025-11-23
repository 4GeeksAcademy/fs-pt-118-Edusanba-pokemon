// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext, useEffect } from "react";
import storeReducer, { initialStore } from "../store"
import PropTypes from "prop-types"

// Create a context to hold the global state of the application
// We will call this global state the "store" to avoid confusion while using local states
const StoreContext = createContext()

// Define a provider component that encapsulates the store and warps it in a context provider to 
// broadcast the information throught all the app pages and components.
export function StoreProvider({ children }) {
    const initializer = (init) => {
        try {
            const persisted = localStorage.getItem('app_store');
            if (persisted) return JSON.parse(persisted);
        } catch (err) { console.error(err) }
        return init;
    }
    const [store, dispatch] = useReducer(storeReducer, initialStore(), initializer)

    useEffect(() => {
        try {
            localStorage.setItem('app_store', JSON.stringify(store));
        } catch (err) { console.error(err) }
    }, [store])
    // Provide the store and dispatch method to all child components.
    return <StoreContext.Provider value={{ store, dispatch }}>
        {children}
    </StoreContext.Provider>
}

// Custom hook to access the global state and dispatch function.
export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext)
    return { dispatch, store };
}

StoreProvider.propTypes = {
    children: PropTypes.node
}