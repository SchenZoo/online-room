import React from 'react';

type Props = {
  crossed?: boolean;
};

export default (props: Props) => {
  const { crossed = false } = props;
  return (
    <svg width="17px" height="16px" fill="none" viewBox="0 0 17 16">
      <path
        transform="translate(0 3)"
        fill="#F2F2F2"
        d="M10.9755 0H1.18056C.528791.000758723.000768589.522003 0 1.1654V8.8346C.000768589 9.478.528791 9.99924 1.18056 10H10.9755C11.6271 9.99924 12.1553 9.478 12.156 8.8346V1.1654C12.1553.522003 11.6271.000758723 10.9755 0zM12.9429 6.59606L16.9998 8.78255V1.24219L12.9429 3.42868V6.59606z"
      />
      {crossed && (
        <line
          className="crossed-line"
          x1="16"
          y1="0"
          x2="0"
          y2="16"
          stroke="#EB5757"
        />
      )}
    </svg>
  );
};
