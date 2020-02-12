import React, { useState, createRef, useEffect } from 'react';
import { camelCase } from 'lodash';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import messages from '../LeftMenuLinkContainer/messages.json';
import Search from './Search';
import Title from './Title';
import SearchButton from './SearchButton';

const LeftMenuLinkHeader = ({ section, searchable, setSearch, search }) => {
  const [showSearch, setShowSearch] = useState(false);
  const ref = createRef();
  const { id, defaultMessage } = messages[camelCase(section)];

  useEffect(() => {
    if (showSearch && ref.current) {
      ref.current.focus();
    }
  }, [ref, showSearch]);

  const toggleSearch = () => {
    setShowSearch(prev => !prev);
  };

  const handleChange = ({ target: { value } }) => {
    setSearch(value);
  };

  const clearSearch = () => {
    setSearch('');
    setShowSearch(false);
  };

  return !showSearch ? (
    <Title>
      <FormattedMessage id={id} defaultMessage={defaultMessage} />
      {searchable && (
        <SearchButton onClick={toggleSearch}>
          <FontAwesomeIcon icon="search" />
        </SearchButton>
      )}
    </Title>
  ) : (
    <Title>
      <div>
        <FontAwesomeIcon icon="search" />
      </div>
      <FormattedMessage id="components.Search.placeholder">
        {message => (
          <Search
            ref={ref}
            onChange={handleChange}
            value={search}
            placeholder={message}
          />
        )}
      </FormattedMessage>
      <SearchButton onClick={clearSearch}>
        <FontAwesomeIcon icon="times" />
      </SearchButton>
    </Title>
  );
};

LeftMenuLinkHeader.propTypes = {
  section: PropTypes.string.isRequired,
  searchable: PropTypes.bool,
  setSearch: PropTypes.func,
  search: PropTypes.string,
};

LeftMenuLinkHeader.defaultProps = {
  search: null,
  searchable: false,
  setSearch: () => {},
};

export default LeftMenuLinkHeader;
