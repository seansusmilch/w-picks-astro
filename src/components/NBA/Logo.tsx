import { TeamMap } from './teamMap';

export function Logo({
  tricode,
  ...props
}: {
  tricode: string;
  [key: string]: any;
}) {
  const { logo, name } = TeamMap[tricode];
  return <img src={logo} alt={`${name} Logo`} {...props} />;
}
