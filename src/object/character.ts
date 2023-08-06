import { ObjectProps, create_object } from '.';

export const create_character = (props: ObjectProps) => {
  const obj = create_object(props);
  return {
    ...obj
  };
};
