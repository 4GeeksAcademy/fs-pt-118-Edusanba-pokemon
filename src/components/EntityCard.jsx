import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function EntityCard({ type, name, url }) {
  const { store, dispatch } = useGlobalReducer();
  const [desc, setDesc] = useState("");
  const [id, setId] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        setData(json);
        if (type === "pokemon") {
          setId(json.id);
          const speciesUrl = json?.species?.url;
          const typesText = json.types?.map((t) => t.type.name).join(", ");
          setDesc(typesText ? `Tipos: ${typesText}` : "");
          if (speciesUrl) {
            try {
              const sRes = await fetch(speciesUrl);
              const sJson = await sRes.json();
              const entry = sJson.flavor_text_entries?.find(
                (e) => e.language?.name === store.language
              );
              const text = entry?.flavor_text?.replace(/\s+/g, " ").trim();
              if (text) setDesc(text);
            } catch (err) { console.error(err); }
          }
        } else if (type === "item") {
          const entry = json.effect_entries?.find(
            (e) => e.language?.name === store.language
          );
          const short = entry?.short_effect || entry?.effect;
          const text = short?.replace(/\s+/g, " ").trim();
          setDesc(text || "");
        }
      } catch (e) {
        console.error(e);
        setDesc("");
      }
    };
    load();
  }, [type, url, store.language]);

EntityCard.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

  const uid = useMemo(() => `${type}:${id || name}`, [type, id, name]);
  const isFav = useMemo(
    () => store.favorites.some((f) => f.uid === uid),
    [store.favorites, uid]
  );

  const img =
    type === "pokemon"
      ? id
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
        : undefined
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;

  const toggleFav = () => {
    dispatch({
      type: "toggle_favorite",
      payload: { uid, name, type, url },
    });
  };

  return (
    <div className="card h-100">
      {img && <img src={img} className="card-img-top" alt={name} />}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-capitalize">{name}</h5>
        {desc && <p className="card-text small text-muted">{desc}</p>}
        {type === "pokemon" && data && (
          <div className="mb-2">
            <div className="d-flex flex-wrap gap-1 mb-1">
              {data.types?.map((t) => (
                <span key={t.type.name} className="badge text-bg-secondary text-capitalize">{t.type.name}</span>
              ))}
            </div>
            <p className="small mb-1">Habilidades: {data.abilities?.map((a) => a.ability.name).slice(0,3).join(", ")}</p>
            <div className="small text-muted">Exp: {data.base_experience} • Altura: {data.height} • Peso: {data.weight}</div>
            <div className="d-flex flex-wrap gap-1 mt-1">
              {data.stats?.map((s) => (
                <span key={s.stat.name} className="badge text-bg-light text-uppercase">{s.stat.name}: {s.base_stat}</span>
              ))}
            </div>
          </div>
        )}
        {type === "item" && data && (
          <div className="mb-2">
            {data.category?.name && (
              <span className="badge text-bg-secondary text-capitalize me-2">{data.category.name}</span>
            )}
            <div className="small mb-1">Atributos: {data.attributes?.map((a) => a.name).slice(0,4).join(", ") || "N/A"}</div>
            <div className="small text-muted">Costo: {data.cost}</div>
          </div>
        )}
        <div className="mt-auto d-flex gap-2">
          <Link
            to={`/single/${type}~${id || name}`}
            className="btn btn-outline-secondary btn-sm"
          >
            Detalles
          </Link>
          <button
            className={`btn btn-sm ${isFav ? "btn-warning" : "btn-primary"}`}
            onClick={toggleFav}
          >
            {isFav ? "Quitar" : "Favorito"}
          </button>
        </div>
      </div>
    </div>
  );
}