import PropTypes from "prop-types";
import { useMemo } from "react";

export default function Autocomplete({ value, onChange, items, getLabel, getImage, onSelect, placeholder }) {
  const suggestions = useMemo(() => {
    const term = value.trim().toLowerCase();
    if (!term) return [];
    return items
      .filter((it) => getLabel(it).toLowerCase().includes(term))
      .slice(0, 8);
  }, [value, items, getLabel]);

  return (
    <div className="position-relative">
      <input
        className="form-control"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
          {suggestions.map((it) => {
            const label = getLabel(it);
            const img = getImage?.(it);
            return (
              <li key={label} className="list-group-item d-flex align-items-center gap-2" role="button" onClick={() => onSelect(it)}>
                {img && <img src={img} alt={label} style={{ width: 24, height: 24 }} />}
                <span className="text-capitalize">{label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

Autocomplete.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  getLabel: PropTypes.func.isRequired,
  getImage: PropTypes.func,
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};