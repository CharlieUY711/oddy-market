import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const AppContext = createContext();

// Load from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('oddy_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
};

// Initial state
const initialState = {
  cart: loadCartFromStorage(),
  products: [],
  loading: false,
  error: null,
  user: null,
};

// Action types
const ActionTypes = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER: 'SET_USER',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_TO_CART: {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      };
    }

    case ActionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };

    case ActionTypes.UPDATE_CART_ITEM:
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case ActionTypes.CLEAR_CART:
      return {
        ...state,
        cart: [],
      };

    case ActionTypes.SET_PRODUCTS:
      return {
        ...state,
        products: action.payload,
        loading: false,
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addToCart = useCallback((product) => {
    dispatch({ type: ActionTypes.ADD_TO_CART, payload: product });
  }, []);

  const removeFromCart = useCallback((productId) => {
    dispatch({ type: ActionTypes.REMOVE_FROM_CART, payload: productId });
  }, []);

  const updateCartItem = useCallback((productId, quantity) => {
    dispatch({
      type: ActionTypes.UPDATE_CART_ITEM,
      payload: { id: productId, quantity },
    });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_CART });
  }, []);

  const setProducts = useCallback((products) => {
    dispatch({ type: ActionTypes.SET_PRODUCTS, payload: products });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  }, []);

  const setUser = useCallback((user) => {
    dispatch({ type: ActionTypes.SET_USER, payload: user });
  }, []);

  const cartTotal = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartItemsCount = state.cart.reduce(
    (count, item) => count + item.quantity,
    0
  );

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oddy_cart', JSON.stringify(state.cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }, [state.cart]);

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    setProducts,
    setLoading,
    setError,
    setUser,
    cartTotal,
    cartItemsCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
