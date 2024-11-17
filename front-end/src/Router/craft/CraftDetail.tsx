import { useParams } from "react-router-dom";

function CraftDetail() {
  const id = useParams().id;

  return (
    <div>
      <div>{id}</div>
    </div>
  );
}

export default CraftDetail;
