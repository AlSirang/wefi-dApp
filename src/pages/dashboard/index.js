import { lazy } from "react";
import LoadWithSuspense from "../../components/loadWithSuspense";
const DashboardComponent = lazy(() =>
  import("./dashboard" /* webpackChunkName: "presale-page" */)
);

const DashboardPage = () => {
  return (
    <LoadWithSuspense>
      <DashboardComponent />
    </LoadWithSuspense>
  );
};

export default DashboardPage;
