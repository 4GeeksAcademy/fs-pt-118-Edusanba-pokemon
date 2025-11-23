import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EntityCard from "../components/EntityCard";
import "./home.css";
import Autocomplete from "../components/Autocomplete";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [pokemons, setPokemons] = useState([]);
  const [items, setItems] = useState([]);
  const [pNext, setPNext] = useState(null);
  const [iNext, setINext] = useState(null);
  const [searchP, setSearchP] = useState("");
  const [searchI, setSearchI] = useState("");
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [typeSel, setTypeSel] = useState("");
  const [catSel, setCatSel] = useState("");

  useEffect(() => {
    const cached = store.cache || {};
    const hasCache = cached.pokemons && cached.items && cached.types && cached.categories;
    const load = async () => {
      const pRes = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
      const pJson = await pRes.json();
      const iRes = await fetch("https://pokeapi.co/api/v2/item?limit=20");
      const iJson = await iRes.json();
      const tRes = await fetch("https://pokeapi.co/api/v2/type");
      const tJson = await tRes.json();
      const cRes = await fetch("https://pokeapi.co/api/v2/item-category");
      const cJson = await cRes.json();

      setPokemons(pJson.results || []);
      setPNext(pJson.next || null);
      setItems(iJson.results || []);
      setINext(iJson.next || null);
      setTypes(tJson.results || tJson?.results || []);
      setCategories(cJson.results || []);

      dispatch({
        type: 'set_cache',
        payload: {
          pokemons: pJson.results || [],
          items: iJson.results || [],
          types: tJson.results || tJson?.results || [],
          categories: cJson.results || [],
          pNext: pJson.next || null,
          iNext: iJson.next || null,
        }
      })
    };

    if (hasCache) {
      setPokemons(cached.pokemons);
      setItems(cached.items);
      setTypes(cached.types);
      setCategories(cached.categories);
      setPNext(cached.pNext);
      setINext(cached.iNext);
    } else {
      load();
    }
  }, [store.cache, dispatch]);

  const loadPokemons = async () => {
    if (!pNext || typeSel) return;
    const res = await fetch(pNext);
    const json = await res.json();
    setPokemons((prev) => [...prev, ...(json.results || [])]);
    setPNext(json.next || null);
  };

  const loadItems = async () => {
    if (!iNext || catSel) return;
    const res = await fetch(iNext);
    const json = await res.json();
    setItems((prev) => [...prev, ...(json.results || [])]);
    setINext(json.next || null);
  };

  const applyType = async (val) => {
    setTypeSel(val);
    if (!val) {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
      const json = await res.json();
      setPokemons(json.results || []);
      setPNext(json.next || null);
      return;
    }
    const res = await fetch(`https://pokeapi.co/api/v2/type/${val}`);
    const json = await res.json();
    const list = (json.pokemon || []).map((p) => p.pokemon);
    setPokemons(list);
    setPNext(null);
  };

  const applyCategory = async (val) => {
    setCatSel(val);
    if (!val) {
      const res = await fetch("https://pokeapi.co/api/v2/item?limit=20");
      const json = await res.json();
      setItems(json.results || []);
      setINext(json.next || null);
      return;
    }
    const res = await fetch(`https://pokeapi.co/api/v2/item-category/${val}`);
    const json = await res.json();
    const list = (json.items || []).map((i) => ({ name: i.name, url: i.url }));
    setItems(list);
    setINext(null);
  };

  const filteredPokemons = useMemo(() => {
    return pokemons.filter((p) => p.name.toLowerCase().includes(searchP.toLowerCase()));
  }, [pokemons, searchP]);

  const filteredItems = useMemo(() => {
    return items.filter((i) => i.name.toLowerCase().includes(searchI.toLowerCase()));
  }, [items, searchI]);

  return (
    <div className="container py-4">
      <h2 className="mb-3 section-title-poke">Browse Databank</h2>

      <div className="d-flex align-items-center mb-2">
        <span className="me-2 fw-bold section-title-poke">Pokemons</span>
      </div>
      <div className="row g-3 mb-3 align-items-end">
        <div className="col-12 col-md-6">
          <Autocomplete
            value={searchP}
            onChange={setSearchP}
            items={pokemons}
            getLabel={(p) => p.name}
            getImage={(p) => {
              const m = p.url.match(/\/pokemon\/(\d+)\/?$/);
              const id = m ? m[1] : null;
              return id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` : null;
            }}
            onSelect={(p) => {
              const m = p.url.match(/\/pokemon\/(\d+)\/?$/);
              const id = m ? m[1] : p.name;
              navigate(`/single/pokemon~${id}`);
            }}
            placeholder="Buscar Pokémon"
          />
        </div>
        <div className="col-12 col-md-4">
          <select className="form-select" value={typeSel} onChange={(e) => applyType(e.target.value)}>
            <option value="">Todos los tipos</option>
            {types.map((t) => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-2">
          <button className="btn btn-outline-primary w-100" onClick={loadPokemons} disabled={!pNext || !!typeSel}>Mostrar más</button>
        </div>
      </div>
      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3 mb-4">
        {filteredPokemons.map((p) => (
          <div className="col" key={`pokemon:${p.name}`}>
            <EntityCard type="pokemon" name={p.name} url={p.url} />
          </div>
        ))}
      </div>

      <div className="d-flex align-items-center mb-2">
        <span className="me-2 fw-bold section-title-poke">Items</span>
      </div>
      <div className="row g-3 mb-3 align-items-end">
        <div className="col-12 col-md-6">
          <Autocomplete
            value={searchI}
            onChange={setSearchI}
            items={items}
            getLabel={(i) => i.name}
            getImage={(i) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${i.name}.png`}
            onSelect={(i) => navigate(`/single/item~${i.name}`)}
            placeholder="Buscar Item"
          />
        </div>
        <div className="col-12 col-md-4">
          <select className="form-select" value={catSel} onChange={(e) => applyCategory(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-2">
          <button className="btn btn-outline-primary w-100" onClick={loadItems} disabled={!iNext || !!catSel}>Mostrar más</button>
        </div>
      </div>
      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">
        {filteredItems.map((it) => (
          <div className="col" key={`item:${it.name}`}>
            <EntityCard type="item" name={it.name} url={it.url} />
          </div>
        ))}
      </div>
    </div>
  );
};