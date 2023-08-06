import { ObjectProps, create_object } from '.';

export const create_tile = (props: ObjectProps) => {
  const obj = create_object(props);
  return {
    ...obj
  };
};
