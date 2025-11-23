export const initialStore = () => {
  return {
    message: null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],
    favorites: [],
    language: 'en',
    cache: {
      pokemons: null,
      items: null,
      types: null,
      categories: null,
      pNext: null,
      iNext: null,
    }
  };
};

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'add_task': {
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        ),
      };
    }
    case 'toggle_favorite': {
      const item = action.payload;
      const exists = store.favorites.find((f) => f.uid === item.uid);
      return {
        ...store,
        favorites: exists
          ? store.favorites.filter((f) => f.uid !== item.uid)
          : [...store.favorites, item],
      };
    }
    case 'set_cache': {
      const c = action.payload || {};
      return {
        ...store,
        cache: {
          ...store.cache,
          ...c,
        }
      };
    }
    case 'set_favorites': {
      return {
        ...store,
        favorites: Array.isArray(action.payload) ? action.payload : store.favorites,
      };
    }
    case 'set_language': {
      const lang = action.payload === 'es' ? 'es' : 'en';
      return {
        ...store,
        language: lang,
      };
    }
    default:
      throw Error('Unknown action.');
  }    
}
