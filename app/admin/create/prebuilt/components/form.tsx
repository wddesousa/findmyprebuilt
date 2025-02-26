import { useActionState } from "react";
import { submitPrebuilt } from "../action";

export default function NewPrebuiltForm() {
    const [state, action, pending] = useActionState(submitPrebuilt, undefined)

    
  return (
    <form action={action}>
      <div className=""></div>
    </form>
  );
}
