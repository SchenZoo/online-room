import React from 'react';

type Props = {
  crossed?: boolean;
};

export default (props: Props) => {
  const { crossed = false } = props;
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        transform="translate(2.5 0)"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.803 3.144C8.803 1.412 7.3 0 5.455 0c-1.845 0-3.35 1.412-3.35 3.144v5.12c0 1.731 1.505 3.143 3.35 3.143 1.844-.019 3.348-1.412 3.348-3.162V3.144zM.602 7.699c-.341 0-.602.245-.602.565 0 2.616 2.086 4.818 4.853 5.1v1.507H2.667c-.34 0-.602.244-.602.564 0 .32.261.565.602.565h5.575c.34 0 .602-.245.602-.565 0-.32-.261-.564-.602-.564H6.056v-1.506c2.767-.283 4.853-2.485 4.853-5.101 0-.32-.26-.565-.602-.565-.34 0-.601.245-.601.565 0 2.202-1.905 3.99-4.251 3.99-2.347 0-4.252-1.788-4.252-3.99 0-.32-.26-.565-.601-.565z"
        fill="#F2F2F2"
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
