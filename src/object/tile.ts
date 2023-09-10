import { ObjectProps, create_object } from '.';

export const create_tile = (props: ObjectProps) => {
  const obj = create_object(props);
  const z = props.z ?? 0;
  return {
    ...obj,
    z
  };
};
