import { Link, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "./single.css";

export const Single = () => {
  const { store, dispatch } = useGlobalReducer();
  const { theId } = useParams();

  const [data, setData] = useState(null);
  const [desc, setDesc] = useState("");
  const [species, setSpecies] = useState(null);
  const [showAllMoves, setShowAllMoves] = useState(false);
  const [evolution, setEvolution] = useState([]);
  const [type, value] = theId.split("~");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/${type}/${value}`);
        const json = await res.json();
        setData(json);
        if (type === 'pokemon') {
          const speciesUrl = json?.species?.url || `https://pokeapi.co/api/v2/pokemon-species/${value}`;
          try {
            const sRes = await fetch(speciesUrl);
            const sJson = await sRes.json();
            setSpecies(sJson);
            const entry = sJson.flavor_text_entries?.find((e) => e.language?.name === store.language);
            const text = entry?.flavor_text?.replace(/\s+/g, ' ').trim();
            setDesc(text || "");
            if (sJson?.evolution_chain?.url) {
              try {
                const eRes = await fetch(sJson.evolution_chain.url);
                const eJson = await eRes.json();
                const list = [];
                const walk = (node) => {
                  if (!node) return;
                  const n = node.species;
                  const m = n?.url?.match(/pokemon-species\/(\d+)\/?$/);
                  const id = m ? m[1] : null;
                  list.push({ name: n?.name, id });
                  if (Array.isArray(node.evolves_to) && node.evolves_to.length > 0) {
                    node.evolves_to.forEach(walk);
                  }
                };
                walk(eJson.chain);
                setEvolution(list);
              } catch (err) { console.error(err) }
            }
          } catch (err) { console.error(err) }
        } else if (type === 'item') {
          const entry = json.effect_entries?.find((e) => e.language?.name === store.language);
          const text = (entry?.short_effect || entry?.effect)?.replace(/\s+/g, ' ').trim();
          setDesc(text || "");
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [type, value, store.language]);

  const uid = `${type}:${value}`;
  const isFav = useMemo(
    () => store.favorites.some((f) => f.uid === uid),
    [store.favorites, uid]
  );

  const name = data?.name || value;
  const img =
    type === "pokemon"
      ? (data?.sprites?.other?.["official-artwork"]?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data?.id || value}.png`)
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;

  const toggleFav = () => {
    dispatch({
      type: "toggle_favorite",
      payload: { uid, name, type, url: `https://pokeapi.co/api/v2/${type}/${value}` },
    });
  };

  return (
    <div className="container py-4">
      <div className="card pokeball-detail">
        <div className="row g-0">
          <div className="col-12 col-md-4 p-3 text-center">
            {img && <img src={img} alt={name} className="img-fluid w-100 detail-hero-img" />}
          </div>
          <div className="col-12 col-md-8">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <h3 className="card-title text-capitalize mb-0">{name}</h3>
                <div className="d-flex gap-2">
                  <button
                    className={`btn ${isFav ? "btn-warning" : "btn-primary"}`}
                    onClick={toggleFav}
                  >
                    {isFav ? "Quitar favorito" : "Agregar a favoritos"}
                  </button>
                  <Link to="/" className="btn btn-outline-secondary">Volver</Link>
                </div>
              </div>
              {desc && <p className="mt-3 text-muted">{desc}</p>}

              {type === "pokemon" && data && (
                <>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {data.types?.map((t) => (
                      <span key={t.type.name} className="badge text-bg-secondary text-capitalize">{t.type.name}</span>
                    ))}
                  </div>
                  <ul className="list-group list-group-flush mt-3">
                    <li className="list-group-item">Altura: {data.height}</li>
                    <li className="list-group-item">Peso: {data.weight}</li>
                    <li className="list-group-item">Exp. base: {data.base_experience}</li>
                    <li className="list-group-item">Habilidades: {data.abilities?.map((a) => a.ability.name).join(", ")}</li>
                  </ul>
                  <div className="mt-3">
                    <h6 className="mb-2">Stats</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {data.stats?.map((s) => (
                        <span key={s.stat.name} className="badge text-bg-light text-uppercase">{s.stat.name}: {s.base_stat}</span>
                      ))}
                    </div>
                  </div>
                  <div className="accordion mt-3" id="accPokemon">
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="hdrSprites">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#colSprites" aria-expanded="false" aria-controls="colSprites">Sprites</button>
                      </h2>
                      <div id="colSprites" className="accordion-collapse collapse" aria-labelledby="hdrSprites" data-bs-parent="#accPokemon">
                        <div className="accordion-body">
                          <div className="row g-2">
                            {[
                              data.sprites?.front_default,
                              data.sprites?.back_default,
                              data.sprites?.front_shiny,
                              data.sprites?.back_shiny,
                              data.sprites?.other?.["official-artwork"]?.front_default,
                            ].filter(Boolean).map((src, i) => (
                              <div className="col-auto" key={i}><img src={src} alt="sprite" style={{ width: 72, height: 72 }} /></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="hdrMoves">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#colMoves" aria-expanded="false" aria-controls="colMoves">Movimientos</button>
                      </h2>
                      <div id="colMoves" className="accordion-collapse collapse" aria-labelledby="hdrMoves" data-bs-parent="#accPokemon">
                        <div className="accordion-body">
                          <div className="d-flex flex-wrap gap-2">
                            {(showAllMoves ? data.moves : data.moves?.slice(0, 12))?.map((m) => (
                              <span key={m.move.name} className="badge text-bg-secondary text-capitalize">{m.move.name}</span>
                            ))}
                          </div>
                          {data.moves?.length > 12 && (
                            <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => setShowAllMoves(!showAllMoves)}>
                              {showAllMoves ? "Mostrar menos" : "Mostrar más"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="hdrSpecies">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#colSpecies" aria-expanded="false" aria-controls="colSpecies">Especie</button>
                      </h2>
                      <div id="colSpecies" className="accordion-collapse collapse" aria-labelledby="hdrSpecies" data-bs-parent="#accPokemon">
                        <div className="accordion-body">
                          <div className="row g-2">
                            <div className="col-6">Color: {species?.color?.name || "N/A"}</div>
                            <div className="col-6">Hábitat: {species?.habitat?.name || "N/A"}</div>
                            <div className="col-6">Crecimiento: {species?.growth_rate?.name || "N/A"}</div>
                            <div className="col-6">Generación: {species?.generation?.name || "N/A"}</div>
                            <div className="col-12">Grupos Huevo: {species?.egg_groups?.map((e) => e.name).join(", ") || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="hdrEvolution">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#colEvolution" aria-expanded="false" aria-controls="colEvolution">Cadena de evolución</button>
                      </h2>
                      <div id="colEvolution" className="accordion-collapse collapse" aria-labelledby="hdrEvolution" data-bs-parent="#accPokemon">
                        <div className="accordion-body">
                          <div className="d-flex align-items-center flex-wrap gap-2">
                            {evolution.map((ev, idx) => (
                              <div key={`evwrap-${ev.name}`} className="d-flex align-items-center gap-2">
                                <Link to={`/single/pokemon~${ev.id || ev.name}`} className="text-decoration-none d-flex align-items-center gap-2">
                                  {ev.id && (
                                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ev.id}.png`} alt={ev.name} style={{ width: 40, height: 40 }} />
                                  )}
                                  <span className="text-capitalize">{ev.name}</span>
                                </Link>
                                {idx < evolution.length - 1 && <span className="mx-1">→</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {type === "item" && data && (
                <ul className="list-group list-group-flush mt-3">
                  <li className="list-group-item">Costo: {data.cost}</li>
                  <li className="list-group-item">Categoría: {data.category?.name}</li>
                  <li className="list-group-item">Efectos: {data.effect_entries?.[0]?.short_effect || "N/A"}</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Single.propTypes = {
  match: PropTypes.object,
};
