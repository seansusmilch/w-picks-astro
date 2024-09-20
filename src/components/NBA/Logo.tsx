import { TeamMap } from './teamMap';

export function Logo({
  tricode,
  ...props
}: {
  tricode: string;
  [key: string]: any;
}) {
  const { logo, name } = TeamMap[tricode] || TeamMap['NBA'];
  return <img src={logo} alt={`${name} Logo`} {...props} />;
}
