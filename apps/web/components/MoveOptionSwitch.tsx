import { Switch } from './ui/switch';

export default function MoveOptionSwitch(
  props: React.ComponentProps<typeof Switch>
) {
  return (
    <div className="flex items-center gap-2">
      <Switch {...props} />
      <code className="text-sm text-muted-foreground ">Option::none</code>
    </div>
  );
}
