import React from 'react';
import './Avatar.styles.scss';
import classNames from 'classnames';
import UserIcon from '../../../icons/User.icon';

type Props = {
  src: string;
  alt?: string;
  rounded?: boolean;
};

const Avatar: React.FC<Props> = ({ src, alt = 'avatar', rounded }) => {
  const classes = classNames([
    'avatar',
    {
      'avatar--rounded': rounded,
    },
  ]);

  return src ? (
    <img src={src} alt={alt} className={classes} />
  ) : (
    <div className={classes}>
      <UserIcon />
    </div>
  );
};

export default Avatar;
