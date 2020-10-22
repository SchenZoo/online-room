import React from 'react';

type Props = {
  crossed?: boolean;
};

export default (props: Props) => {
  const { crossed = false } = props;
  return (
    <svg className="pencil" width="16px" height="16px" viewBox="0 0 512 512">
      <path
        id="pen"
        fill="#F2F2F2"
        d="M496.063 62.299l-46.396-46.4c-21.2-21.199-55.69-21.198-76.888 0l-18.16 18.161 123.284 123.294 18.16-18.161C517.311 117.944 517.314 83.55 496.063 62.299zM22.012 376.747L.251 494.268c-.899 4.857.649 9.846 4.142 13.339 3.497 3.497 8.487 5.042 13.338 4.143l117.512-21.763L22.012 376.747zM333.407 55.274L38.198 350.506 161.482 473.799 456.691 178.568z"
      />

      {crossed && (
        <line
          className="crossed-line"
          x1="512"
          y1="0"
          x2="0"
          y2="512"
          stroke="#EB5757"
        />
      )}
    </svg>
  );
};
