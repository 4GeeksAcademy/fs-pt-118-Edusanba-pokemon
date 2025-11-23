import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();

    return (
        <nav className="navbar navbar-light bg-light">
            <div className="container">
                <Link to="/">
                    <span className="navbar-brand mb-0 h1">Pokemon Databank</span>
                </Link>
                <div className="ms-auto d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <span>Idioma</span>
                        <select
                            className="form-select form-select-sm"
                            style={{ width: 110 }}
                            value={store.language}
                            onChange={(e) => dispatch({ type: 'set_language', payload: e.target.value })}
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                        </select>
                    </div>
                    <div className="dropdown">
                        <button
                            className="btn btn-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            Favoritos ({store.favorites.length})
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: 260 }}>
                            {store.favorites.length === 0 && (
                                <li className="px-3 py-2 text-muted">Vacío</li>
                            )}
                            {store.favorites.map((f) => (
                                <li key={f.uid} className="d-flex align-items-center px-3 py-2 gap-2">
                                    <Link className="flex-grow-1 text-decoration-none" to={`/single/${f.type}~${f.uid.split(":")[1]}`}>
                                        <span className="text-capitalize">{f.name}</span>
                                    </Link>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => dispatch({ type: "toggle_favorite", payload: f })}
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};