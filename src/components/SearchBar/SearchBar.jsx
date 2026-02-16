import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useApp } from '@context/AppContext';
import { formatCurrency } from '@utils/formatting';
import styles from './SearchBar.module.css';

export const SearchBar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { products } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const searchBarRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
      setResults(filtered.slice(0, 8));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, products]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      onClose();
      setSearchQuery('');
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/products/${productId}`);
    onClose();
    setSearchQuery('');
  };


  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.searchBar} ref={searchBarRef}>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.searchInputContainer}>
            <Search className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={styles.clearButton}
                aria-label="Limpiar búsqueda"
              >
                <X className={styles.clearIcon} />
              </button>
            )}
          </div>
        </form>

        {searchQuery && (
          <div className={styles.resultsContainer}>
            {isSearching ? (
              <div className={styles.loading}>Buscando...</div>
            ) : results.length > 0 ? (
              <>
                <div className={styles.resultsList}>
                  {results.map((product) => (
                    <button
                      key={product.id}
                      className={styles.resultItem}
                      onClick={() => handleResultClick(product.id)}
                    >
                      <img
                        src={product.image || '/placeholder-product.jpg'}
                        alt={product.name}
                        className={styles.resultImage}
                      />
                      <div className={styles.resultInfo}>
                        <h4 className={styles.resultName}>{product.name}</h4>
                        {product.category && (
                          <p className={styles.resultCategory}>{product.category}</p>
                        )}
                        <p className={styles.resultPrice}>{formatCurrency(product.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {results.length >= 8 && (
                  <button
                    className={styles.viewAllButton}
                    onClick={handleSubmit}
                  >
                    Ver todos los resultados para "{searchQuery}"
                  </button>
                )}
              </>
            ) : (
              <div className={styles.noResults}>
                <p>No se encontraron productos para "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
