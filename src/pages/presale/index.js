import { lazy } from "react";
import LoadWithSuspense from "../../components/loadWithSuspense";
const PresaleComponent = lazy(() =>
  import("./presale" /* webpackChunkName: "presale-page" */)
);

const PresalePage = () => {
  return (
    <LoadWithSuspense>
      <PresaleComponent />
    </LoadWithSuspense>
  );
};

export default PresalePage;
