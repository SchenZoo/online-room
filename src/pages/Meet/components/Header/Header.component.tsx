import React from 'react';
import classNames from 'classnames';

import './Header.styles.scss';

type Props = {
  className?: string;
};

const Header = (props: Props) => {
  const { className } = props;
  const classes = classNames([className, 'topbar']);

  return (
    <header className={classes}>
      <h1>Welcome to the class</h1>
    </header>
  );
};

export default Header;
